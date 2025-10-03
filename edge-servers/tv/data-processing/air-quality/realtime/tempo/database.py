"""
Database operations for TEMPO real-time air quality data.

Handles storage and retrieval of TEMPO satellite measurements.
Uses Prisma ORM for database interactions.

Author: NSAC Team
Date: 2025-01-30
"""

import os
import sys
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import logging
from prisma import Prisma
from prisma.models import AirQualityRealtime

# Add parent directories to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from tempo_processor import TempoDataPoint
from shared.calculator import AQICalculator
from dataclasses import dataclass
from typing import Optional

@dataclass
class RealtimeDataPoint:
    """Represents a combined real-time air quality measurement."""
    timestamp: datetime
    latitude: float
    longitude: float
    level: float = 0.0  # Surface level
    
    # Real-time pollutants (NO2 and O3 from TEMPO, PM2.5 from AirNOW)
    pm25: Optional[float] = None  # μg/m³ (AirNOW ground)
    no2: Optional[float] = None   # μg/m³ (TEMPO satellite)
    o3: Optional[float] = None    # μg/m³ (TEMPO satellite)
    so2: Optional[float] = None   # μg/m³ (not available in real-time)
    co: Optional[float] = None    # μg/m³ (not available in real-time)
    
    # Calculated AQI (same method as forecast)
    aqi: Optional[float] = None   # Overall Air Quality Index (0-500)
    
    # Metadata
    source: str = "REALTIME"

class TempoDatabase:
    """
    Database operations for TEMPO real-time air quality data.
    
    Handles:
    - Storing TEMPO measurements
    - Calculating partial AQI (NO2, O3, HCHO only)
    - Retrieving real-time data
    - Data quality management
    """
    
    def __init__(self):
        """Initialize TEMPO database connection."""
        self.prisma = Prisma()
        self.logger = logging.getLogger(__name__)
        self.aqi_calculator = AQICalculator()
        
    async def connect(self):
        """Connect to database."""
        await self.prisma.connect()
        self.logger.info("Connected to database")
        
    async def disconnect(self):
        """Disconnect from database."""
        await self.prisma.disconnect()
        self.logger.info("Disconnected from database")
    
    async def insert_realtime_data_point(self, data_point: RealtimeDataPoint) -> bool:
        """
        Insert a single real-time data point into the database.
        
        Args:
            data_point: RealtimeDataPoint object
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Insert into database (same structure as forecast)
            await self.prisma.airqualityrealtime.create({
                'timestamp': data_point.timestamp,
                'latitude': data_point.latitude,
                'longitude': data_point.longitude,
                'level': data_point.level,
                'pm25': data_point.pm25,
                'no2': data_point.no2,
                'o3': data_point.o3,
                'so2': data_point.so2,
                'co': data_point.co,
                'hcho': data_point.hcho,
                'aqi': data_point.aqi,
                'source': data_point.source
            })
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error inserting real-time data point: {e}")
            return False
    
    async def insert_tempo_data_point(self, data_point: TempoDataPoint) -> bool:
        """
        Insert a single TEMPO data point into the database (legacy method).
        
        Args:
            data_point: TempoDataPoint object
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Calculate partial AQI (NO2, O3, HCHO only)
            aqi_data = {}
            if data_point.no2 is not None:
                aqi_data['no2'] = data_point.no2
            if data_point.o3 is not None:
                aqi_data['o3'] = data_point.o3
            if data_point.hcho is not None:
                aqi_data['hcho'] = data_point.hcho
            
            # Calculate individual AQIs
            individual_aqis = {}
            for pollutant, concentration in aqi_data.items():
                try:
                    aqi_value = self.aqi_calculator.calculate_aqi(pollutant, concentration)
                    individual_aqis[pollutant] = aqi_value
                except Exception as e:
                    self.logger.warning(f"Could not calculate AQI for {pollutant}: {e}")
            
            # Get overall AQI (highest individual AQI)
            overall_aqi = max(individual_aqis.values()) if individual_aqis else None
            
            # Prepare data quality string
            data_quality = data_point.data_quality or "TEMPO_L2"
            
            # Insert into database
            await self.prisma.airqualityrealtime.create({
                'timestamp': data_point.timestamp,
                'latitude': data_point.latitude,
                'longitude': data_point.longitude,
                'no2': data_point.no2,
                'o3': data_point.o3,
                'hcho': data_point.hcho,
                'no2Aqi': individual_aqis.get('no2'),
                'o3Aqi': individual_aqis.get('o3'),
                'hchoAqi': individual_aqis.get('hcho'),
                'overallAqi': overall_aqi,
                'primaryPollutant': max(individual_aqis, key=individual_aqis.get) if individual_aqis else None,
                'tempoQuality': data_quality,
                'dataQualityScore': 0.7,  # Default TEMPO quality score
                'source': 'TEMPO'
            })
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error inserting TEMPO data point: {e}")
            return False
    
    async def insert_tempo_batch(self, data_points: List[TempoDataPoint]) -> int:
        """
        Insert multiple TEMPO data points in batch.
        
        Args:
            data_points: List of TempoDataPoint objects
            
        Returns:
            Number of successfully inserted records
        """
        if not data_points:
            return 0
            
        successful_inserts = 0
        
        for data_point in data_points:
            if await self.insert_tempo_data_point(data_point):
                successful_inserts += 1
                
        self.logger.info(f"Inserted {successful_inserts}/{len(data_points)} TEMPO data points")
        return successful_inserts
    
    async def get_latest_tempo_data(self, hours: int = 24) -> List[Dict]:
        """
        Get latest TEMPO data within specified hours.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            List of latest TEMPO records
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            # Get latest records
            records = await self.prisma.airqualityrealtime.find_many(
                where={
                    'timestamp': {'gte': cutoff_time},
                    'source': 'TEMPO'
                }
            )
            
            # Sort by timestamp (newest first)
            records.sort(key=lambda x: x.timestamp, reverse=True)
            
            return [self._record_to_dict(record) for record in records]
            
        except Exception as e:
            self.logger.error(f"Error getting latest TEMPO data: {e}")
            return []
    
    async def get_tempo_data_by_location(self, lat: float, lon: float, 
                                       radius_km: float = 50.0, 
                                       hours: int = 24) -> List[Dict]:
        """
        Get TEMPO data near a specific location.
        
        Args:
            lat: Latitude
            lon: Longitude
            radius_km: Search radius in kilometers
            hours: Number of hours to look back
            
        Returns:
            List of TEMPO records near the location
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            # Approximate lat/lon bounds (rough conversion from km)
            lat_delta = radius_km / 111.0  # ~111 km per degree latitude
            lon_delta = radius_km / (111.0 * abs(np.cos(np.radians(lat))))  # Adjust for longitude
            
            records = await self.prisma.airqualityrealtime.find_many(
                where={
                    'timestamp': {'gte': cutoff_time},
                    'source': 'TEMPO',
                    'latitude': {'gte': lat - lat_delta, 'lte': lat + lat_delta},
                    'longitude': {'gte': lon - lon_delta, 'lte': lon + lon_delta}
                }
            )
            
            # Sort by distance (closest first)
            records.sort(key=lambda x: self._calculate_distance(lat, lon, x.latitude, x.longitude))
            
            return [self._record_to_dict(record) for record in records]
            
        except Exception as e:
            self.logger.error(f"Error getting TEMPO data by location: {e}")
            return []
    
    async def get_tempo_statistics(self, hours: int = 24) -> Dict:
        """
        Get statistics for TEMPO data.
        
        Args:
            hours: Number of hours to analyze
            
        Returns:
            Dictionary with statistics
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            # Get all records in time range
            records = await self.prisma.airqualityrealtime.find_many(
                where={
                    'timestamp': {'gte': cutoff_time},
                    'source': 'TEMPO'
                }
            )
            
            if not records:
                return {
                    'total_records': 0,
                    'date_range': 'N/A to N/A',
                    'pollutants': {}
                }
            
            # Basic stats
            total_records = len(records)
            timestamps = [r.timestamp for r in records]
            date_range = f"{min(timestamps).strftime('%Y-%m-%d %H:%M')} to {max(timestamps).strftime('%Y-%m-%d %H:%M')}"
            
            # Pollutant statistics
            pollutants = {}
            for pollutant in ['no2', 'o3', 'hcho']:
                values = [getattr(r, pollutant) for r in records if getattr(r, pollutant) is not None]
                if values:
                    pollutants[pollutant] = {
                        'count': len(values),
                        'min': min(values),
                        'max': max(values),
                        'mean': sum(values) / len(values)
                    }
            
            # AQI statistics
            aqi_values = [r.aqi for r in records if r.aqi is not None]
            aqi_stats = {}
            if aqi_values:
                aqi_stats = {
                    'count': len(aqi_values),
                    'min': min(aqi_values),
                    'max': max(aqi_values),
                    'mean': sum(aqi_values) / len(aqi_values)
                }
            
            return {
                'total_records': total_records,
                'date_range': date_range,
                'pollutants': pollutants,
                'aqi': aqi_stats
            }
            
        except Exception as e:
            self.logger.error(f"Error getting TEMPO statistics: {e}")
            return {}
    
    async def cleanup_old_tempo_data(self, days_to_keep: int = 30):
        """
        Clean up old TEMPO data to manage database size.
        
        Args:
            days_to_keep: Number of days of data to keep
        """
        try:
            cutoff_time = datetime.now() - timedelta(days=days_to_keep)
            
            # Delete old records
            result = await self.prisma.airqualityrealtime.delete_many(
                where={
                    'timestamp': {'lt': cutoff_time},
                    'source': 'TEMPO'
                }
            )
            
            self.logger.info(f"Cleaned up {result.count} old TEMPO records")
            
        except Exception as e:
            self.logger.error(f"Error cleaning up old TEMPO data: {e}")
    
    def _record_to_dict(self, record) -> Dict:
        """Convert Prisma record to dictionary."""
        return {
            'id': record.id,
            'timestamp': record.timestamp,
            'latitude': record.latitude,
            'longitude': record.longitude,
            'no2': record.no2,
            'o3': record.o3,
            'hcho': record.hcho,
            'cloud_fraction': record.cloudFraction,
            'cloud_pressure': record.cloudPressure,
            'solar_zenith_angle': record.solarZenithAngle,
            'aqi': record.aqi,
            'aqi_components': json.loads(record.aqiComponents) if record.aqiComponents else None,
            'data_quality': record.dataQuality,
            'source': record.source,
            'created_at': record.createdAt
        }
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in kilometers."""
        import math
        
        # Haversine formula
        R = 6371  # Earth's radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlon/2) * math.sin(dlon/2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c


async def main():
    """Test the TEMPO database operations."""
    db = TempoDatabase()
    
    try:
        await db.connect()
        
        # Test getting latest data
        print("Getting latest TEMPO data...")
        latest_data = await db.get_latest_tempo_data(hours=24)
        print(f"Found {len(latest_data)} recent records")
        
        # Test getting statistics
        print("Getting TEMPO statistics...")
        stats = await db.get_tempo_statistics(hours=24)
        print(f"Statistics: {stats}")
        
    finally:
        await db.disconnect()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
