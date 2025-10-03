"""
Database OOP Interface for Air Quality Data
Handles PostgreSQL + PostGIS + TimescaleDB operations using Prisma
"""

import asyncio
from prisma import Prisma
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import os
import sys

# Add the shared directory to the path to import AQI calculator
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))
from calculator import AQICalculator


class AirQualityDatabase:
    """
    OOP interface for air quality database operations
    Handles connection, insertion, and queries for PostgreSQL + PostGIS + TimescaleDB
    """
    
    def __init__(self, database_url: Optional[str] = None):
        """
        Initialize database connection
        
        Args:
            database_url: PostgreSQL connection string (or uses DATABASE_URL env var)
        """
        if database_url:
            os.environ['DATABASE_URL'] = database_url
        
        self.db = Prisma()
        self.is_connected = False
    
    async def connect(self):
        """Establish database connection"""
        if not self.is_connected:
            print("🔌 Connecting to PostgreSQL database...")
            await self.db.connect()
            self.is_connected = True
            print("✅ Database connected")
    
    async def disconnect(self):
        """Close database connection"""
        if self.is_connected:
            await self.db.disconnect()
            self.is_connected = False
            print("🔌 Database disconnected")
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.disconnect()
    
    async def insert_data_point(self, data_point: Dict) -> Optional[int]:
        """
        Insert a single air quality data point with calculated AQI
        
        Args:
            data_point: Dictionary with keys: timestamp, forecastInitTime, latitude, 
                       longitude, level, pm25, no2, o3, so2, co, hcho
        
        Returns:
            Inserted record ID or None if failed
        """
        try:
            # Calculate AQI if pollutant data is available
            pollutants = {
                'pm25': data_point.get('pm25'),
                'no2': data_point.get('no2'),
                'o3': data_point.get('o3'),
                'so2': data_point.get('so2'),
                'co': data_point.get('co')
            }
            
            # Filter out None values
            pollutants = {k: v for k, v in pollutants.items() if v is not None}
            
            if pollutants:
                # Calculate individual AQI values
                aqi_values = AQICalculator.calculate_all_aqi(pollutants)
                
                # Get overall AQI (highest of all pollutants)
                overall_aqi, dominant_pollutant = AQICalculator.get_overall_aqi(aqi_values)
                
                # Add AQI to data point
                data_point['aqi'] = float(overall_aqi)
            else:
                data_point['aqi'] = None
            
            result = await self.db.airqualityforecast.create(
                data=data_point
            )
            return result.id
        except Exception as e:
            print(f"❌ Error inserting data point: {e}")
            return None
    
    async def insert_batch(self, data_points: List[Dict], batch_size: int = 1000) -> int:
        """
        Insert multiple data points in batches for better performance with AQI calculation
        
        Args:
            data_points: List of data point dictionaries
            batch_size: Number of records to insert per batch
        
        Returns:
            Number of successfully inserted records
        """
        total = len(data_points)
        inserted = 0
        
        print(f"\n💾 Inserting {total:,} records in batches of {batch_size}...")
        
        for i in range(0, total, batch_size):
            batch = data_points[i:i + batch_size]
            
            # Calculate AQI for each data point in the batch
            for data_point in batch:
                pollutants = {
                    'pm25': data_point.get('pm25'),
                    'no2': data_point.get('no2'),
                    'o3': data_point.get('o3'),
                    'so2': data_point.get('so2'),
                    'co': data_point.get('co')
                }
                
                # Filter out None values
                pollutants = {k: v for k, v in pollutants.items() if v is not None}
                
                if pollutants:
                    # Calculate individual AQI values
                    aqi_values = AQICalculator.calculate_all_aqi(pollutants)
                    
                    # Get overall AQI (highest of all pollutants)
                    overall_aqi, dominant_pollutant = AQICalculator.get_overall_aqi(aqi_values)
                    
                    # Add AQI to data point
                    data_point['aqi'] = float(overall_aqi)
                else:
                    data_point['aqi'] = None
            
            try:
                # Prisma doesn't have native createMany for all databases,
                # so we use transaction with multiple creates
                self.db.airqualityforecast.create_many(
                    data=batch,
                    skip_duplicates=True  # Skip if timestamp+location already exists
                )
                
                inserted += len(batch)
                progress = (inserted / total) * 100
                print(f"\r   Progress: {progress:.1f}% ({inserted:,}/{total:,})", end='')
                
            except Exception as e:
                print(f"\n⚠️ Batch {i//batch_size + 1} failed: {e}")
        
        print(f"\n✅ Inserted {inserted:,} records successfully")
        return inserted
    
    async def get_nearest_location(self, latitude: float, longitude: float, 
                                   timestamp: Optional[datetime] = None,
                                   limit: int = 1) -> List[Dict]:
        """
        Find the nearest location(s) to given coordinates
        
        Args:
            latitude: Target latitude
            longitude: Target longitude
            timestamp: Optional timestamp to filter by
            limit: Number of nearest points to return
        
        Returns:
            List of nearest data points with distance
        """
        # Note: For true PostGIS distance calculations, we'll need raw SQL
        # This is a simplified version using Prisma
        
        where_clause = {}
        if timestamp:
            # Get data within ±1 hour of timestamp
            time_window = timedelta(hours=1)
            where_clause['timestamp'] = {
                'gte': timestamp - time_window,
                'lte': timestamp + time_window
            }
        
        # Find nearby points (simplified - in production use PostGIS ST_Distance)
        results = await self.db.airqualityforecast.find_many(
            where=where_clause,
            take=limit * 100  # Get more to filter by distance
        )
        
        # Calculate simple euclidean distance and sort
        for result in results:
            lat_diff = result.latitude - latitude
            lon_diff = result.longitude - longitude
            result.distance = (lat_diff ** 2 + lon_diff ** 2) ** 0.5
        
        # Sort by distance and take top N
        results.sort(key=lambda x: x.distance)
        return results[:limit]
    
    async def get_last_24h_trends(self, latitude: float, longitude: float,
                                  tolerance: float = 0.5) -> List[Dict]:
        """
        Get last 24 hours of air quality trends for a location
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            tolerance: Coordinate tolerance (degrees)
        
        Returns:
            List of data points from last 24 hours
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        
        results = await self.db.airqualityforecast.find_many(
            where={
                'timestamp': {'gte': cutoff_time},
                'latitude': {'gte': latitude - tolerance, 'lte': latitude + tolerance},
                'longitude': {'gte': longitude - tolerance, 'lte': longitude + tolerance}
            }
        )
        
        # Sort manually since order_by is not supported
        results.sort(key=lambda x: x.timestamp)
        return results
    
    async def get_next_24h_forecast(self, latitude: float, longitude: float,
                                    tolerance: float = 0.5) -> List[Dict]:
        """
        Get next 24 hours forecast for a location
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            tolerance: Coordinate tolerance (degrees)
        
        Returns:
            List of forecast data points for next 24 hours
        """
        now = datetime.utcnow()
        future_time = now + timedelta(hours=24)
        
        results = await self.db.airqualityforecast.find_many(
            where={
                'timestamp': {'gte': now, 'lte': future_time},
                'latitude': {'gte': latitude - tolerance, 'lte': latitude + tolerance},
                'longitude': {'gte': longitude - tolerance, 'lte': longitude + tolerance}
            }
        )
        
        # Sort manually since order_by is not supported
        results.sort(key=lambda x: x.timestamp)
        return results
    
    async def get_realtime_data(self, latitude: float, longitude: float,
                               tolerance: float = 0.5) -> Optional[Dict]:
        """
        Get most recent air quality data for a location
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            tolerance: Coordinate tolerance (degrees)
        
        Returns:
            Most recent data point or None
        """
        results = await self.db.airqualityforecast.find_many(
            where={
                'latitude': {'gte': latitude - tolerance, 'lte': latitude + tolerance},
                'longitude': {'gte': longitude - tolerance, 'lte': longitude + tolerance}
            },
            take=100  # Get more records to sort manually
        )
        
        if not results:
            return None
        
        # Sort by timestamp descending and return the most recent
        results.sort(key=lambda x: x.timestamp, reverse=True)
        return results[0]
    
    async def get_latest_forecast_timestamp(self) -> Optional[datetime]:
        """
        Get the timestamp of the most recent forecast data
        
        Returns:
            Latest timestamp or None if no data exists
        """
        try:
            # Get the most recent record
            latest = await self.db.airqualityforecast.find_first(
                order_by=[{'timestamp': 'desc'}]
            )
            
            return latest.timestamp if latest else None
            
        except Exception as e:
            print(f"Error getting latest forecast timestamp: {e}")
            return None
    
    async def check_forecast_exists(self, forecast_init_time: datetime, data_timestamp: datetime) -> bool:
        """
        Check if forecast data already exists for a specific init time and data timestamp
        
        Args:
            forecast_init_time: The forecast initialization time
            data_timestamp: The data timestamp
        
        Returns:
            True if data exists, False otherwise
        """
        try:
            existing = await self.db.airqualityforecast.find_first(
                where={
                    'forecastInitTime': forecast_init_time,
                    'timestamp': data_timestamp
                }
            )
            return existing is not None
            
        except Exception as e:
            print(f"Error checking forecast existence: {e}")
            return False
    
    async def get_statistics(self) -> Dict:
        """Get database statistics"""
        total_records = await self.db.airqualityforecast.count()
        
        if total_records == 0:
            return {
                'total_records': 0,
                'oldest_record': 'N/A',
                'newest_record': 'N/A'
            }
        
        # Get oldest and newest records by fetching all and sorting manually
        # (since Prisma doesn't support order_by in find_first)
        all_records = await self.db.airqualityforecast.find_many(
            take=1000  # Get a reasonable sample to find min/max
        )
        
        if not all_records:
            return {
                'total_records': total_records,
                'oldest_record': 'N/A',
                'newest_record': 'N/A'
            }
        
        # Sort by timestamp to find oldest and newest
        all_records.sort(key=lambda x: x.timestamp)
        oldest = all_records[0].timestamp
        newest = all_records[-1].timestamp
        
        return {
            'total_records': total_records,
            'oldest_record': oldest.strftime('%Y-%m-%d %H:%M:%S UTC'),
            'newest_record': newest.strftime('%Y-%m-%d %H:%M:%S UTC')
        }


# Example usage
async def main():
    """Example usage of the database interface"""
    
    # Initialize database
    db = AirQualityDatabase()
    
    async with db:
        # Get statistics
        stats = await db.get_statistics()
        print(f"\n📊 Database Statistics:")
        print(f"   Total records: {stats['total_records']:,}")
        print(f"   Oldest: {stats['oldest_record']}")
        print(f"   Newest: {stats['newest_record']}")
        
        # Example: Get realtime data for a location (e.g., New York City)
        nyc_lat, nyc_lon = 40.7128, -74.0060
        realtime = await db.get_realtime_data(nyc_lat, nyc_lon)
        
        if realtime:
            print(f"\n🌍 Realtime data for NYC ({nyc_lat}, {nyc_lon}):")
            print(f"   PM2.5: {realtime.pm25:.4f} μg/m³")
            print(f"   Timestamp: {realtime.timestamp}")


if __name__ == "__main__":
    asyncio.run(main())

