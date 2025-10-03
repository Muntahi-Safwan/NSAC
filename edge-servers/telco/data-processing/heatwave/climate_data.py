"""
Simplified North American Climate Adaptation for Heatwave Detection
Focused regional thresholds for TEMPO coverage area only
"""

from typing import Dict, Tuple
import numpy as np


class NorthAmericanHeatwaveThresholds:
    """
    Simplified regional heatwave thresholds for North America only
    Based on well-established climate zones within TEMPO coverage area
    """
    
    # Simplified North American climate regions
    CLIMATE_REGIONS = {
        'desert_southwest': {
            'name': 'Desert Southwest',
            'bounds': (32.0, 42.0, -125.0, -109.0),  # AZ, NV, S.CA, S.UT
            'characteristics': 'Dry heat, high daytime temps, good nighttime cooling',
            'temp_thresholds_c': {
                'moderate_risk': 40,    # 104°F
                'high_risk': 43,        # 109°F  
                'extreme_risk': 46      # 115°F
            },
            'heat_index_critical': False,  # Dry heat - temperature more important than humidity
            'nighttime_cooling_threshold': 15  # Good cooling expected
        },
        
        'great_plains': {
            'name': 'Great Plains & Central',
            'bounds': (30.0, 49.0, -104.0, -90.0),   # TX, OK, KS, NE, ND, SD, parts of CO/WY
            'characteristics': 'Continental climate, moderate humidity, variable cooling',
            'temp_thresholds_c': {
                'moderate_risk': 35,    # 95°F
                'high_risk': 38,        # 100°F
                'extreme_risk': 41      # 106°F
            },
            'heat_index_critical': True,   # Moderate humidity makes heat index important
            'nighttime_cooling_threshold': 12
        },
        
        'southeast_humid': {
            'name': 'Southeast Humid',
            'bounds': (25.0, 37.0, -95.0, -75.0),    # FL, GA, AL, MS, LA, AR, TN, SC, NC
            'characteristics': 'High humidity, heat index critical, poor nighttime cooling',
            'temp_thresholds_c': {
                'moderate_risk': 32,    # 90°F (but heat index much higher)
                'high_risk': 35,        # 95°F
                'extreme_risk': 38      # 100°F
            },
            'heat_index_critical': True,   # Very high humidity - heat index is key metric
            'nighttime_cooling_threshold': 8   # Poor cooling due to humidity
        },
        
        'northeast_temperate': {
            'name': 'Northeast Temperate',
            'bounds': (37.0, 47.0, -80.0, -65.0),    # VA, WV, MD, DE, PA, NJ, NY, CT, RI, MA, VT, NH, ME
            'characteristics': 'Temperate climate, lower heat tolerance, good cooling',
            'temp_thresholds_c': {
                'moderate_risk': 30,    # 86°F
                'high_risk': 33,        # 91°F
                'extreme_risk': 36      # 97°F
            },
            'heat_index_critical': True,   # Moderate humidity
            'nighttime_cooling_threshold': 10
        },
        
        'pacific_northwest': {
            'name': 'Pacific Northwest',
            'bounds': (42.0, 50.0, -125.0, -110.0),  # OR, WA, ID, BC
            'characteristics': 'Marine climate, lowest heat tolerance, excellent cooling',
            'temp_thresholds_c': {
                'moderate_risk': 28,    # 82°F
                'high_risk': 32,        # 90°F
                'extreme_risk': 35      # 95°F
            },
            'heat_index_critical': False,  # Generally lower humidity
            'nighttime_cooling_threshold': 12
        }
    }
    
    # Default thresholds for areas not covered by specific regions
    DEFAULT_THRESHOLDS = {
        'name': 'Default North American',
        'temp_thresholds_c': {
            'moderate_risk': 32,    # 90°F
            'high_risk': 35,        # 95°F
            'extreme_risk': 38      # 100°F
        },
        'heat_index_critical': True,
        'nighttime_cooling_threshold': 10
    }
    
    @classmethod
    def get_climate_region(cls, latitude: float, longitude: float) -> Dict:
        """
        Get climate region and thresholds for a location in North America
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            
        Returns:
            Dictionary with region info and thresholds
        """
        # Check each climate region
        for region_id, region_data in cls.CLIMATE_REGIONS.items():
            lat_min, lat_max, lon_min, lon_max = region_data['bounds']
            
            if (lat_min <= latitude <= lat_max and 
                lon_min <= longitude <= lon_max):
                return {
                    'region_id': region_id,
                    'region_name': region_data['name'],
                    'characteristics': region_data['characteristics'],
                    'temp_thresholds': region_data['temp_thresholds_c'],
                    'heat_index_critical': region_data['heat_index_critical'],
                    'nighttime_cooling_threshold': region_data['nighttime_cooling_threshold']
                }
        
        # Return default if no specific region matches
        return {
            'region_id': 'default',
            'region_name': cls.DEFAULT_THRESHOLDS['name'],
            'characteristics': 'Standard North American climate',
            'temp_thresholds': cls.DEFAULT_THRESHOLDS['temp_thresholds_c'],
            'heat_index_critical': cls.DEFAULT_THRESHOLDS['heat_index_critical'],
            'nighttime_cooling_threshold': cls.DEFAULT_THRESHOLDS['nighttime_cooling_threshold']
        }
    
    @classmethod
    def assess_heatwave_risk(cls, latitude: float, longitude: float,
                           daily_max_temp: float, daily_min_temp: float,
                           max_heat_index: float, consecutive_hot_hours: int) -> Dict:
        """
        Assess heatwave risk for a North American location
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            daily_max_temp: Maximum temperature (°C)
            daily_min_temp: Minimum temperature (°C)
            max_heat_index: Maximum heat index (°C)
            consecutive_hot_hours: Hours above threshold
            
        Returns:
            Dictionary with risk assessment
        """
        region = cls.get_climate_region(latitude, longitude)
        thresholds = region['temp_thresholds']
        
        # Determine base risk level from temperature
        risk_level = 0
        risk_description = "No Risk"
        
        # Use heat index if it's critical for this region, otherwise use temperature
        assessment_temp = max_heat_index if region['heat_index_critical'] else daily_max_temp
        
        if assessment_temp >= thresholds['extreme_risk']:
            risk_level = 4
            risk_description = "Extreme Risk"
        elif assessment_temp >= thresholds['high_risk']:
            risk_level = 3
            risk_description = "High Risk"
        elif assessment_temp >= thresholds['moderate_risk']:
            risk_level = 2
            risk_description = "Moderate Risk"
        elif assessment_temp >= thresholds['moderate_risk'] - 3:  # Warning level
            risk_level = 1
            risk_description = "Low Risk"
        
        # Adjust risk based on nighttime cooling
        nighttime_cooling = daily_max_temp - daily_min_temp
        if nighttime_cooling < region['nighttime_cooling_threshold']:
            risk_level = min(risk_level + 1, 4)  # Increase risk but cap at 4
            poor_cooling = True
        else:
            poor_cooling = False
        
        # Calculate probability (simplified)
        if risk_level == 0:
            probability = 0.0
        else:
            base_prob = 0.2 + (risk_level - 1) * 0.2  # 0.2, 0.4, 0.6, 0.8
            if poor_cooling:
                base_prob = min(base_prob + 0.1, 1.0)
            if consecutive_hot_hours >= 12:  # More than half the day
                base_prob = min(base_prob + 0.1, 1.0)
            probability = base_prob
        
        return {
            'risk_level': risk_level,
            'risk_description': risk_description,
            'probability': probability,
            'region': region['region_name'],
            'assessment_method': 'heat_index' if region['heat_index_critical'] else 'temperature',
            'assessment_temp': assessment_temp,
            'nighttime_cooling': nighttime_cooling,
            'poor_cooling': poor_cooling,
            'thresholds_used': thresholds
        }
    
    @classmethod
    def get_regional_summary(cls) -> Dict:
        """Get summary of all North American climate regions"""
        summary = {
            'total_regions': len(cls.CLIMATE_REGIONS),
            'coverage_area': 'TEMPO Satellite Coverage (North America)',
            'regions': {}
        }
        
        for region_id, region_data in cls.CLIMATE_REGIONS.items():
            lat_range = region_data['bounds'][1] - region_data['bounds'][0]
            lon_range = region_data['bounds'][3] - region_data['bounds'][2]
            
            summary['regions'][region_id] = {
                'name': region_data['name'],
                'characteristics': region_data['characteristics'],
                'temp_range': f"{region_data['temp_thresholds_c']['moderate_risk']}-{region_data['temp_thresholds_c']['extreme_risk']}°C",
                'heat_index_critical': region_data['heat_index_critical'],
                'coverage_degrees': f"{lat_range:.0f}° × {lon_range:.0f}°"
            }
        
        return summary


def main():
    """Example usage of North American climate adaptation"""
    print("🌡️ North American Heatwave Climate Adaptation")
    print("=" * 60)
    
    # Test major North American cities
    test_cities = [
        (40.7128, -74.0060, "New York City, NY"),
        (34.0522, -118.2437, "Los Angeles, CA"), 
        (25.7617, -80.1918, "Miami, FL"),
        (47.6062, -122.3321, "Seattle, WA"),
        (32.7767, -96.7970, "Dallas, TX"),
        (33.4484, -112.0740, "Phoenix, AZ"),
        (41.8781, -87.6298, "Chicago, IL"),
        (29.7604, -95.3698, "Houston, TX")
    ]
    
    print("📍 Regional Climate Classification:")
    for lat, lon, city in test_cities:
        region = NorthAmericanHeatwaveThresholds.get_climate_region(lat, lon)
        print(f"\n{city}:")
        print(f"   Region: {region['region_name']}")
        print(f"   Moderate Risk: {region['temp_thresholds']['moderate_risk']}°C")
        print(f"   Extreme Risk: {region['temp_thresholds']['extreme_risk']}°C")
        print(f"   Heat Index Critical: {region['heat_index_critical']}")
    
    # Example heatwave assessment
    print(f"\n🔥 Example Heatwave Assessment:")
    print(f"Phoenix, AZ - July Heat Event:")
    
    assessment = NorthAmericanHeatwaveThresholds.assess_heatwave_risk(
        latitude=33.4484, longitude=-112.0740,
        daily_max_temp=45, daily_min_temp=32,  # 113°F max, 90°F min
        max_heat_index=44,  # Dry heat, so heat index ≈ temperature
        consecutive_hot_hours=14
    )
    
    print(f"   Risk Level: {assessment['risk_level']}/4 ({assessment['risk_description']})")
    print(f"   Probability: {assessment['probability']:.1%}")
    print(f"   Assessment Method: {assessment['assessment_method']}")
    print(f"   Nighttime Cooling: {assessment['nighttime_cooling']}°C")
    print(f"   Poor Cooling: {assessment['poor_cooling']}")
    
    print(f"\n📊 Regional Summary:")
    summary = NorthAmericanHeatwaveThresholds.get_regional_summary()
    print(f"   Total Regions: {summary['total_regions']}")
    print(f"   Coverage: {summary['coverage_area']}")


if __name__ == "__main__":
    main()
