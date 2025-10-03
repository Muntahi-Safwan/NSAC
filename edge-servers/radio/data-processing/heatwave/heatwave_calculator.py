#!/usr/bin/env python3
"""
Heatwave Detection and Calculation Module
Analyzes meteorological data to detect and classify heatwaves
"""

import asyncio
import logging
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import math

import sys
import os
# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SimplifiedHeatwaveDatabase, HeatwaveAlert


@dataclass
class HeatwaveAnalysis:
    """Results of heatwave analysis for a location"""
    latitude: float
    longitude: float
    analysis_date: date
    
    # Temperature metrics
    max_temp: float
    min_temp: float
    avg_temp: float
    max_heat_index: float
    
    # Heatwave indicators
    alert_level: int  # 0=None, 1=Watch, 2=Warning, 3=Emergency
    alert_message: str
    risk_score: float  # 0.0-1.0
    
    # Supporting data
    consecutive_hot_hours: int
    nighttime_cooling: float
    humidity_factor: float


class HeatwaveCalculator:
    """
    Real-time heatwave detection and analysis
    Processes meteorological data to identify heatwave conditions
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Regional temperature thresholds (°C)
        self.regional_thresholds = {
            'default': {'watch': 32, 'warning': 38, 'emergency': 43},
            'southwest': {'watch': 38, 'warning': 43, 'emergency': 48},  # Desert regions
            'southeast': {'watch': 32, 'warning': 37, 'emergency': 42},  # Humid regions
            'northwest': {'watch': 28, 'warning': 33, 'emergency': 38},  # Cooler regions
        }
    
    def calculate_heat_index(self, temp_c: float, humidity: float) -> float:
        """
        Calculate heat index (apparent temperature) in Celsius
        
        Args:
            temp_c: Temperature in Celsius
            humidity: Relative humidity (0-100%)
            
        Returns:
            Heat index in Celsius
        """
        # Convert to Fahrenheit for calculation
        temp_f = (temp_c * 9/5) + 32
        
        # Heat index formula (Rothfusz equation)
        if temp_f < 80:
            return temp_c  # No heat index adjustment needed
        
        rh = humidity
        
        # Coefficients for heat index calculation
        c1 = -42.379
        c2 = 2.04901523
        c3 = 10.14333127
        c4 = -0.22475541
        c5 = -6.83783e-3
        c6 = -5.481717e-2
        c7 = 1.22874e-3
        c8 = 8.5282e-4
        c9 = -1.99e-6
        
        # Calculate heat index in Fahrenheit
        hi_f = (c1 + (c2 * temp_f) + (c3 * rh) + (c4 * temp_f * rh) + 
                (c5 * temp_f * temp_f) + (c6 * rh * rh) + 
                (c7 * temp_f * temp_f * rh) + (c8 * temp_f * rh * rh) + 
                (c9 * temp_f * temp_f * rh * rh))
        
        # Convert back to Celsius
        return (hi_f - 32) * 5/9
    
    def get_regional_thresholds(self, latitude: float, longitude: float) -> Dict[str, float]:
        """
        Get temperature thresholds based on geographic region
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            
        Returns:
            Dictionary with watch, warning, emergency thresholds
        """
        # Simple regional classification for North America
        if latitude < 35 and longitude < -100:  # Southwest US
            return self.regional_thresholds['southwest']
        elif latitude < 35 and longitude > -90:  # Southeast US
            return self.regional_thresholds['southeast']
        elif latitude > 45:  # Northern regions
            return self.regional_thresholds['northwest']
        else:
            return self.regional_thresholds['default']
    
    def analyze_location_heatwave(self, hourly_data: List[Dict]) -> Optional[HeatwaveAnalysis]:
        """
        Analyze hourly meteorological data for heatwave conditions at a single location
        
        Args:
            hourly_data: List of hourly meteorological records for one location
            
        Returns:
            HeatwaveAnalysis object or None if insufficient data
        """
        if not hourly_data or len(hourly_data) < 6:  # Need at least 6 hours of data
            return None
        
        # Extract location info
        first_record = hourly_data[0]
        latitude = first_record['latitude']
        longitude = first_record['longitude']
        analysis_date = first_record['forecastHour'].date()
        
        # Get regional thresholds
        thresholds = self.get_regional_thresholds(latitude, longitude)
        
        # Calculate temperature metrics
        temperatures = [r['temperature'] for r in hourly_data]
        humidities = [r['humidity'] for r in hourly_data]
        
        max_temp = max(temperatures)
        min_temp = min(temperatures)
        avg_temp = sum(temperatures) / len(temperatures)
        
        # Calculate heat indices
        heat_indices = []
        for temp, humidity in zip(temperatures, humidities):
            hi = self.calculate_heat_index(temp, humidity)
            heat_indices.append(hi)
        
        max_heat_index = max(heat_indices)
        
        # Count consecutive hot hours
        consecutive_hot_hours = 0
        current_streak = 0
        for hi in heat_indices:
            if hi >= thresholds['watch']:
                current_streak += 1
                consecutive_hot_hours = max(consecutive_hot_hours, current_streak)
            else:
                current_streak = 0
        
        # Calculate nighttime cooling (temperature drop from day to night)
        if len(temperatures) >= 12:
            day_temps = temperatures[6:18] if len(temperatures) >= 18 else temperatures[6:]
            night_temps = temperatures[:6] + temperatures[18:] if len(temperatures) >= 18 else temperatures[:6]
            
            if day_temps and night_temps:
                avg_day_temp = sum(day_temps) / len(day_temps)
                avg_night_temp = sum(night_temps) / len(night_temps)
                nighttime_cooling = avg_day_temp - avg_night_temp
            else:
                nighttime_cooling = max_temp - min_temp
        else:
            nighttime_cooling = max_temp - min_temp
        
        # Calculate humidity factor (higher humidity = more dangerous)
        avg_humidity = sum(humidities) / len(humidities)
        humidity_factor = min(avg_humidity / 100.0, 1.0)
        
        # Determine alert level and risk score
        alert_level = 0
        risk_score = 0.0
        alert_message = "No heat risk"
        
        # Base risk on heat index
        if max_heat_index >= thresholds['emergency']:
            alert_level = 3
            risk_score = 0.9 + min(0.1, (max_heat_index - thresholds['emergency']) / 10)
            alert_message = "EMERGENCY: Extreme heat danger - seek immediate shelter"
        elif max_heat_index >= thresholds['warning']:
            alert_level = 2
            risk_score = 0.6 + (max_heat_index - thresholds['warning']) / (thresholds['emergency'] - thresholds['warning']) * 0.3
            alert_message = "WARNING: Dangerous heat conditions - avoid outdoor activities"
        elif max_heat_index >= thresholds['watch']:
            alert_level = 1
            risk_score = 0.3 + (max_heat_index - thresholds['watch']) / (thresholds['warning'] - thresholds['watch']) * 0.3
            alert_message = "WATCH: Hot conditions - limit outdoor exposure"
        
        # Adjust risk based on duration and nighttime cooling
        if consecutive_hot_hours >= 6:
            risk_score = min(1.0, risk_score + 0.1)
        if nighttime_cooling < 5:  # Poor nighttime cooling
            risk_score = min(1.0, risk_score + 0.1)
        if humidity_factor > 0.7:  # High humidity
            risk_score = min(1.0, risk_score + 0.1)
        
        return HeatwaveAnalysis(
            latitude=latitude,
            longitude=longitude,
            analysis_date=analysis_date,
            max_temp=max_temp,
            min_temp=min_temp,
            avg_temp=avg_temp,
            max_heat_index=max_heat_index,
            alert_level=alert_level,
            alert_message=alert_message,
            risk_score=risk_score,
            consecutive_hot_hours=consecutive_hot_hours,
            nighttime_cooling=nighttime_cooling,
            humidity_factor=humidity_factor
        )
    
    async def process_daily_heatwave_detection(self, target_date: date, forecast_init_time: datetime) -> List[HeatwaveAlert]:
        """
        Process all meteorological data for a date and detect heatwaves
        
        Args:
            target_date: Date to analyze
            forecast_init_time: Forecast initialization time
            
        Returns:
            List of heatwave alerts
        """
        self.logger.info(f"🔥 Processing heatwave detection for {target_date}")
        
        alerts = []
        
        async with SimplifiedHeatwaveDatabase() as db:
            # Get all meteorological data for the target date
            start_time = datetime.combine(target_date, datetime.min.time())
            end_time = start_time + timedelta(days=1)
            
            # Query meteorological data using raw SQL
            met_data = await db.prisma.query_raw(
                """
                SELECT latitude, longitude, "forecastHour", temperature, humidity, "windSpeed", pressure
                FROM meteorological_data 
                WHERE "forecastHour" >= $1::timestamp AND "forecastHour" < $2::timestamp
                ORDER BY latitude, longitude, "forecastHour"
                """,
                start_time.isoformat(),
                end_time.isoformat()
            )
            
            if not met_data:
                self.logger.warning(f"No meteorological data found for {target_date}")
                return alerts
            
            # Group data by location
            location_data = {}
            for record in met_data:
                key = (record['latitude'], record['longitude'])
                if key not in location_data:
                    location_data[key] = []
                location_data[key].append(record)
            
            self.logger.info(f"Analyzing {len(location_data)} locations for heatwave conditions")
            
            # Analyze each location
            for (lat, lon), hourly_records in location_data.items():
                analysis = self.analyze_location_heatwave(hourly_records)
                
                if analysis and analysis.alert_level > 0:  # Only create alerts for actual risks
                    alert = HeatwaveAlert(
                        latitude=lat,
                        longitude=lon,
                        alert_date=target_date,
                        forecast_init_time=forecast_init_time,
                        max_temperature=analysis.max_temp,
                        min_temperature=analysis.min_temp,
                        max_heat_index=analysis.max_heat_index,
                        alert_level=analysis.alert_level,
                        alert_message=analysis.alert_message
                    )
                    alerts.append(alert)
            
            # Show analysis summary
            if alerts:
                alert_counts = {}
                for alert in alerts:
                    level = alert.alert_level
                    alert_counts[level] = alert_counts.get(level, 0) + 1
                
                self.logger.info(f"🚨 Heatwave detection results:")
                level_names = {1: "Watch", 2: "Warning", 3: "Emergency"}
                for level in sorted(alert_counts.keys()):
                    count = alert_counts[level]
                    percentage = (count / len(alerts)) * 100
                    self.logger.info(f"   Level {level} ({level_names[level]}): {count:,} locations ({percentage:.1f}%)")
            else:
                self.logger.info("✅ No heatwave conditions detected")
        
        return alerts


async def main():
    """Test the heatwave calculator"""
    print("🔥 Testing Heatwave Calculator")
    
    calculator = HeatwaveCalculator()
    
    # Test with today's date
    today = date.today()
    forecast_time = datetime.utcnow()
    
    alerts = await calculator.process_daily_heatwave_detection(today, forecast_time)
    print(f"Generated {len(alerts)} heatwave alerts")


if __name__ == "__main__":
    asyncio.run(main())
