"""
Simple Hardcoded Heatwave Thresholds for North America
Operational system with fixed thresholds - no complex regional calculations
"""

from typing import Dict, Tuple


class SimpleHeatwaveThresholds:
    """
    Hardcoded heatwave thresholds for operational use
    Simple, fast, and reliable
    """
    
    # Hardcoded temperature thresholds (°C)
    # Based on established heat warning systems in North America
    MODERATE_RISK_TEMP = 32  # 90°F - Heat advisory level
    HIGH_RISK_TEMP = 35      # 95°F - Heat warning level  
    EXTREME_RISK_TEMP = 38   # 100°F - Excessive heat warning
    
    # Heat index thresholds (°C) - when humidity matters
    MODERATE_RISK_HEAT_INDEX = 35  # 95°F heat index
    HIGH_RISK_HEAT_INDEX = 40      # 104°F heat index
    EXTREME_RISK_HEAT_INDEX = 46   # 115°F heat index
    
    # Nighttime cooling threshold
    MIN_NIGHTTIME_COOLING = 10  # °C - Less cooling increases risk
    
    # Consecutive hours threshold
    MIN_HOT_HOURS = 6  # Hours above threshold to be concerning
    
    @classmethod
    def assess_heatwave_risk(cls, daily_max_temp: float, daily_min_temp: float,
                           max_heat_index: float, consecutive_hot_hours: int,
                           avg_humidity: float = 50.0) -> Dict:
        """
        Simple heatwave risk assessment with hardcoded thresholds
        
        Args:
            daily_max_temp: Maximum temperature (°C)
            daily_min_temp: Minimum temperature (°C)  
            max_heat_index: Maximum heat index (°C)
            consecutive_hot_hours: Hours above threshold
            avg_humidity: Average humidity (%) - default 50%
            
        Returns:
            Dictionary with risk assessment
        """
        
        # Determine if humidity is high (use heat index) or low (use temperature)
        use_heat_index = avg_humidity > 60  # High humidity threshold
        assessment_temp = max_heat_index if use_heat_index else daily_max_temp
        
        # Base risk level from temperature/heat index
        if assessment_temp >= cls.EXTREME_RISK_TEMP:
            risk_level = 4
            risk_description = "Extreme Risk"
        elif assessment_temp >= cls.HIGH_RISK_TEMP:
            risk_level = 3  
            risk_description = "High Risk"
        elif assessment_temp >= cls.MODERATE_RISK_TEMP:
            risk_level = 2
            risk_description = "Moderate Risk"
        elif assessment_temp >= cls.MODERATE_RISK_TEMP - 3:  # 29°C / 84°F
            risk_level = 1
            risk_description = "Low Risk"
        else:
            risk_level = 0
            risk_description = "No Risk"
        
        # Adjust for poor nighttime cooling
        nighttime_cooling = daily_max_temp - daily_min_temp
        poor_cooling = nighttime_cooling < cls.MIN_NIGHTTIME_COOLING
        
        if poor_cooling and risk_level > 0:
            risk_level = min(risk_level + 1, 4)  # Increase risk, cap at 4
        
        # Calculate simple probability
        probability_map = {0: 0.0, 1: 0.2, 2: 0.4, 3: 0.7, 4: 0.9}
        base_probability = probability_map[risk_level]
        
        # Adjust probability for consecutive hot hours
        if consecutive_hot_hours >= cls.MIN_HOT_HOURS:
            base_probability = min(base_probability + 0.1, 1.0)
        
        return {
            'risk_level': risk_level,
            'risk_description': risk_description,
            'probability': base_probability,
            'assessment_temp': assessment_temp,
            'assessment_method': 'heat_index' if use_heat_index else 'temperature',
            'nighttime_cooling': nighttime_cooling,
            'poor_cooling': poor_cooling,
            'consecutive_hot_hours': consecutive_hot_hours,
            'thresholds_used': {
                'moderate': cls.MODERATE_RISK_TEMP,
                'high': cls.HIGH_RISK_TEMP,
                'extreme': cls.EXTREME_RISK_TEMP
            }
        }
    
    @classmethod
    def get_threshold_info(cls) -> Dict:
        """Get information about hardcoded thresholds"""
        return {
            'system': 'Simple Hardcoded Thresholds',
            'coverage': 'North America (TEMPO area)',
            'temperature_thresholds_c': {
                'moderate_risk': cls.MODERATE_RISK_TEMP,
                'high_risk': cls.HIGH_RISK_TEMP,
                'extreme_risk': cls.EXTREME_RISK_TEMP
            },
            'temperature_thresholds_f': {
                'moderate_risk': cls.MODERATE_RISK_TEMP * 9/5 + 32,
                'high_risk': cls.HIGH_RISK_TEMP * 9/5 + 32,
                'extreme_risk': cls.EXTREME_RISK_TEMP * 9/5 + 32
            },
            'heat_index_thresholds_c': {
                'moderate_risk': cls.MODERATE_RISK_HEAT_INDEX,
                'high_risk': cls.HIGH_RISK_HEAT_INDEX,
                'extreme_risk': cls.EXTREME_RISK_HEAT_INDEX
            },
            'other_criteria': {
                'min_nighttime_cooling_c': cls.MIN_NIGHTTIME_COOLING,
                'min_hot_hours': cls.MIN_HOT_HOURS,
                'high_humidity_threshold': 60  # % - when to use heat index
            }
        }


def main():
    """Example usage of simple hardcoded thresholds"""
    print("🌡️ Simple Hardcoded Heatwave Thresholds")
    print("=" * 50)
    
    # Show threshold info
    info = SimpleHeatwaveThresholds.get_threshold_info()
    print(f"System: {info['system']}")
    print(f"Coverage: {info['coverage']}")
    print()
    
    print("🌡️ Temperature Thresholds:")
    temp_c = info['temperature_thresholds_c']
    temp_f = info['temperature_thresholds_f']
    for level in ['moderate_risk', 'high_risk', 'extreme_risk']:
        print(f"   {level.replace('_', ' ').title()}: {temp_c[level]}°C ({temp_f[level]:.0f}°F)")
    
    print()
    print("🔥 Example Assessments:")
    
    # Test scenarios
    scenarios = [
        {
            'name': 'Normal Summer Day',
            'max_temp': 28, 'min_temp': 18, 'heat_index': 30, 'hot_hours': 4, 'humidity': 45
        },
        {
            'name': 'Hot Dry Day (Phoenix-style)',
            'max_temp': 42, 'min_temp': 28, 'heat_index': 42, 'hot_hours': 12, 'humidity': 25
        },
        {
            'name': 'Hot Humid Day (Miami-style)', 
            'max_temp': 34, 'min_temp': 26, 'heat_index': 43, 'hot_hours': 10, 'humidity': 80
        },
        {
            'name': 'Extreme Heat Event',
            'max_temp': 40, 'min_temp': 32, 'heat_index': 45, 'hot_hours': 16, 'humidity': 70
        }
    ]
    
    for scenario in scenarios:
        assessment = SimpleHeatwaveThresholds.assess_heatwave_risk(
            daily_max_temp=scenario['max_temp'],
            daily_min_temp=scenario['min_temp'],
            max_heat_index=scenario['heat_index'],
            consecutive_hot_hours=scenario['hot_hours'],
            avg_humidity=scenario['humidity']
        )
        
        print(f"\n📊 {scenario['name']}:")
        print(f"   Max Temp: {scenario['max_temp']}°C, Heat Index: {scenario['heat_index']}°C")
        print(f"   Risk Level: {assessment['risk_level']}/4 ({assessment['risk_description']})")
        print(f"   Probability: {assessment['probability']:.0%}")
        print(f"   Assessment: {assessment['assessment_method']}")
        print(f"   Poor Cooling: {assessment['poor_cooling']}")


if __name__ == "__main__":
    main()
