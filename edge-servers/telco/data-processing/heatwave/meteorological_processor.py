"""
Meteorological Data Processor for Heatwave Prediction
Processes NASA GEOS-CF meteorological NetCDF files to extract temperature and humidity data
"""

import netCDF4 as nc
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import os
from dataclasses import dataclass
from geographic_filters import TempoGeographicFilter
from temperature_thresholds import SimpleHeatwaveThresholds


@dataclass
class HourlyMetData:
    """Single hour of meteorological data for one location"""
    timestamp: datetime
    forecast_init_time: datetime
    latitude: float
    longitude: float
    temperature: float      # °C
    humidity: float         # %
    wind_speed: float       # m/s
    pressure: float         # Pa
    heat_index: float       # °C (calculated)


@dataclass
class DailyHeatwaveData:
    """Daily heatwave assessment aggregated from 24 hourly readings"""
    date: datetime
    forecast_init_time: datetime
    latitude: float
    longitude: float
    
    # Daily temperature aggregates
    daily_max_temp: float
    daily_min_temp: float
    daily_avg_temp: float
    
    # Heat index aggregates
    max_heat_index: float
    avg_heat_index: float
    
    # Heatwave indicators
    heatwave_risk_level: int
    heatwave_probability: float
    consecutive_hot_hours: int
    nighttime_cooling: float
    
    # Environmental factors
    avg_humidity: float
    avg_wind_speed: float
    total_precipitation: float


class MeteorologicalProcessor:
    """
    Processes GEOS-CF meteorological NetCDF files for heatwave prediction
    """
    
    def __init__(self):
        self.temp_filter = TempoGeographicFilter()
        self.threshold_system = SimpleHeatwaveThresholds()
    
    def calculate_heat_index(self, temp_c: float, humidity: float) -> float:
        """
        Calculate heat index from temperature and humidity
        
        Args:
            temp_c: Temperature in Celsius
            humidity: Relative humidity (%)
            
        Returns:
            Heat index in Celsius
        """
        # Convert to Fahrenheit for calculation
        temp_f = temp_c * 9/5 + 32
        
        # Only calculate heat index for temperatures above 80°F (27°C)
        if temp_f < 80:
            return temp_c
        
        # Rothfusz heat index equation
        hi_f = (-42.379 + 
                2.04901523 * temp_f + 
                10.14333127 * humidity - 
                0.22475541 * temp_f * humidity - 
                6.83783e-3 * temp_f**2 - 
                5.481717e-2 * humidity**2 + 
                1.22874e-3 * temp_f**2 * humidity + 
                8.5282e-4 * temp_f * humidity**2 - 
                1.99e-6 * temp_f**2 * humidity**2)
        
        # Convert back to Celsius
        return (hi_f - 32) * 5/9
    
    def extract_timestamp_from_filename(self, file_path: str) -> Tuple[datetime, datetime]:
        """
        Extract forecast init time and data timestamp from filename
        
        Args:
            file_path: Path to NetCDF file
            
        Returns:
            Tuple of (forecast_init_time, data_timestamp)
        """
        filename = os.path.basename(file_path)
        
        try:
            # Filename format: GEOS-CF.v01.fcst.met_tavg_1hr_g1440x721_x1.20251001_12z+20251002_0330z.nc4
            parts = filename.split('.')
            time_part = parts[-2]  # e.g., "20251001_12z+20251002_0330z"
            
            init_part, data_part = time_part.split('+')
            
            # Parse init time: "20251001_12z"
            init_date = init_part.split('_')[0]
            init_hour = init_part.split('_')[1].replace('z', '')
            forecast_init_time = datetime.strptime(f"{init_date}{init_hour}", "%Y%m%d%H")
            
            # Parse data time: "20251002_0330z"
            data_datetime = data_part.replace('z', '')
            data_timestamp = datetime.strptime(data_datetime, "%Y%m%d_%H%M")
            
            return forecast_init_time, data_timestamp
            
        except Exception as e:
            print(f"⚠️ Warning: Could not parse timestamp from filename: {e}")
            return datetime.utcnow(), datetime.utcnow()
    
    def process_hourly_file(self, file_path: str, sample_rate: int = 5) -> List[HourlyMetData]:
        """
        Process a single hourly meteorological NetCDF file
        
        Args:
            file_path: Path to NetCDF file
            sample_rate: Sample every Nth grid point (default: 5)
            
        Returns:
            List of hourly meteorological data points
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        print(f"🌡️ Processing: {os.path.basename(file_path)}")
        
        # Extract timestamps
        forecast_init_time, data_timestamp = self.extract_timestamp_from_filename(file_path)
        print(f"   Forecast Init: {forecast_init_time} UTC")
        print(f"   Data Time: {data_timestamp} UTC")
        
        hourly_data = []
        
        try:
            with nc.Dataset(file_path, 'r') as dataset:
                print(f"   Dataset dimensions: {dict(dataset.dimensions)}")
                
                # Read coordinate arrays
                lev = dataset.variables['lev'][:]
                lat = dataset.variables['lat'][:]
                lon = dataset.variables['lon'][:]
                
                # Read meteorological variables
                # T2M: 2-meter temperature (K)
                temp_k = dataset.variables['T2M'][:]  # [time, lat, lon]
                
                # RH: Relative humidity (%)
                humidity = dataset.variables['RH'][:]  # [time, lev, lat, lon] - use surface level
                
                # Wind components for wind speed calculation
                u2m = dataset.variables['U2M'][:]  # [time, lat, lon]
                v2m = dataset.variables['V2M'][:]  # [time, lat, lon]
                
                # Surface pressure
                ps = dataset.variables['PS'][:]  # [time, lat, lon]
                
                print(f"   Processing with sample rate: {sample_rate}")
                
                # Sample the grid (surface level only)
                for i in range(0, len(lat), sample_rate):
                    for j in range(0, len(lon), sample_rate):
                        latitude = float(lat[i])
                        longitude = float(lon[j])
                        
                        # Apply TEMPO coverage filter
                        if not self.temp_filter.is_in_tempo_coverage(latitude, longitude):
                            continue
                        
                        # Extract meteorological values
                        temp_kelvin = float(temp_k[0, i, j])  # [time, lat, lon]
                        temperature = temp_kelvin - 273.15  # Convert K to C
                        
                        # Get surface humidity (level 0)
                        rel_humidity = float(humidity[0, 0, i, j])  # [time, lev, lat, lon]
                        
                        # Calculate wind speed from components
                        u_wind = float(u2m[0, i, j])
                        v_wind = float(v2m[0, i, j])
                        wind_speed = np.sqrt(u_wind**2 + v_wind**2)
                        
                        # Surface pressure
                        pressure = float(ps[0, i, j])
                        
                        # Skip if any values are invalid
                        if (np.isnan(temperature) or np.isnan(rel_humidity) or 
                            np.isnan(wind_speed) or np.isnan(pressure)):
                            continue
                        
                        # Calculate heat index
                        heat_index = self.calculate_heat_index(temperature, rel_humidity)
                        
                        # Create hourly data point
                        hourly_point = HourlyMetData(
                            timestamp=data_timestamp,
                            forecast_init_time=forecast_init_time,
                            latitude=latitude,
                            longitude=longitude,
                            temperature=temperature,
                            humidity=rel_humidity,
                            wind_speed=wind_speed,
                            pressure=pressure,
                            heat_index=heat_index
                        )
                        
                        hourly_data.append(hourly_point)
                
                print(f"   ✅ Extracted {len(hourly_data):,} hourly data points")
                
        except Exception as e:
            print(f"   ❌ Error processing file: {e}")
            raise
        
        return hourly_data
    
    def aggregate_daily_data(self, hourly_data_24h: List[HourlyMetData]) -> List[DailyHeatwaveData]:
        """
        Aggregate 24 hours of data into daily heatwave assessments
        
        Args:
            hourly_data_24h: List of 24 hourly data points for each location
            
        Returns:
            List of daily heatwave assessments
        """
        if not hourly_data_24h:
            return []
        
        print(f"🔄 Aggregating {len(hourly_data_24h)} hourly points into daily assessments...")
        
        # Group by location
        location_groups = {}
        for point in hourly_data_24h:
            key = (point.latitude, point.longitude)
            if key not in location_groups:
                location_groups[key] = []
            location_groups[key].append(point)
        
        daily_assessments = []
        
        for (lat, lon), hourly_points in location_groups.items():
            if len(hourly_points) < 12:  # Need at least half a day of data
                continue
            
            # Sort by timestamp
            hourly_points.sort(key=lambda x: x.timestamp)
            
            # Calculate daily aggregates
            temperatures = [p.temperature for p in hourly_points]
            heat_indices = [p.heat_index for p in hourly_points]
            humidities = [p.humidity for p in hourly_points]
            wind_speeds = [p.wind_speed for p in hourly_points]
            
            daily_max_temp = max(temperatures)
            daily_min_temp = min(temperatures)
            daily_avg_temp = np.mean(temperatures)
            
            max_heat_index = max(heat_indices)
            avg_heat_index = np.mean(heat_indices)
            
            avg_humidity = np.mean(humidities)
            avg_wind_speed = np.mean(wind_speeds)
            
            nighttime_cooling = daily_max_temp - daily_min_temp
            
            # Count consecutive hot hours (above moderate risk threshold)
            consecutive_hot_hours = 0
            max_consecutive = 0
            for heat_idx in heat_indices:
                if heat_idx >= self.threshold_system.MODERATE_RISK_TEMP:
                    consecutive_hot_hours += 1
                    max_consecutive = max(max_consecutive, consecutive_hot_hours)
                else:
                    consecutive_hot_hours = 0
            
            # Assess heatwave risk
            risk_assessment = self.threshold_system.assess_heatwave_risk(
                daily_max_temp=daily_max_temp,
                daily_min_temp=daily_min_temp,
                max_heat_index=max_heat_index,
                consecutive_hot_hours=max_consecutive,
                avg_humidity=avg_humidity
            )
            
            # Create daily assessment
            daily_data = DailyHeatwaveData(
                date=hourly_points[0].timestamp.date(),
                forecast_init_time=hourly_points[0].forecast_init_time,
                latitude=lat,
                longitude=lon,
                daily_max_temp=daily_max_temp,
                daily_min_temp=daily_min_temp,
                daily_avg_temp=daily_avg_temp,
                max_heat_index=max_heat_index,
                avg_heat_index=avg_heat_index,
                heatwave_risk_level=risk_assessment['risk_level'],
                heatwave_probability=risk_assessment['probability'],
                consecutive_hot_hours=max_consecutive,
                nighttime_cooling=nighttime_cooling,
                avg_humidity=avg_humidity,
                avg_wind_speed=avg_wind_speed,
                total_precipitation=0.0  # Would need TPREC variable
            )
            
            daily_assessments.append(daily_data)
        
        print(f"   ✅ Created {len(daily_assessments):,} daily heatwave assessments")
        return daily_assessments


def main():
    """Test the meteorological processor"""
    print("🧪 Testing Meteorological Processor")
    print("=" * 50)
    
    processor = MeteorologicalProcessor()
    
    # Test file (would need actual NetCDF file)
    test_file = "heatwave/downloads/test_met_file.nc4"
    
    if os.path.exists(test_file):
        try:
            hourly_data = processor.process_hourly_file(test_file)
            print(f"✅ Processed {len(hourly_data)} hourly data points")
            
            if hourly_data:
                # Show sample data
                sample = hourly_data[0]
                print(f"\nSample data point:")
                print(f"   Location: {sample.latitude:.2f}, {sample.longitude:.2f}")
                print(f"   Temperature: {sample.temperature:.1f}°C")
                print(f"   Heat Index: {sample.heat_index:.1f}°C")
                print(f"   Humidity: {sample.humidity:.1f}%")
                print(f"   Wind Speed: {sample.wind_speed:.1f} m/s")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print(f"⚠️ Test file not found: {test_file}")
        print("   This is expected - need to download actual meteorological data first")


if __name__ == "__main__":
    main()

