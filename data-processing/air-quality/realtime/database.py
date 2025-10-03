"""
Database operations for GEOS-CF Analysis real-time air quality data
Handles storing analysis data with duplicate prevention
"""

import os
import sys
import asyncio
from datetime import datetime
from typing import List, Optional
import logging

# Add parent directories to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from data_processor import GeosCfAnalysisDataPoint
from shared.calculator import AQICalculator

class GeosCfAnalysisDatabase:
    """
    Database operations for GEOS-CF analysis real-time air quality data.
    
    Handles:
    - Storing analysis measurements with AQI calculation
    - Preventing duplicate data using unique constraints
    - Efficient batch operations
    """
    
    def __init__(self):
        """Initialize the database connection"""
        self.logger = logging.getLogger(__name__)
        try:
            from prisma import Prisma
            self.prisma = Prisma()
            self.logger.info("✓ Database connection initialized")
        except Exception as e:
            self.logger.error(f"Failed to initialize database: {e}")
            raise
    
    async def connect(self):
        """Connect to the database"""
        try:
            await self.prisma.connect()
            self.logger.info("✓ Connected to database")
        except Exception as e:
            self.logger.error(f"Failed to connect to database: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from the database"""
        try:
            await self.prisma.disconnect()
            self.logger.info("✓ Disconnected from database")
        except Exception as e:
            self.logger.error(f"Failed to disconnect from database: {e}")
    
    async def insert_analysis_data_point(self, data_point: GeosCfAnalysisDataPoint) -> bool:
        """
        Insert a single analysis data point into the database
        
        Args:
            data_point: GeosCfAnalysisDataPoint to insert
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Calculate AQI for this data point
            pollutants = {}
            if data_point.pm25 is not None:
                pollutants['pm25'] = data_point.pm25
            if data_point.no2 is not None:
                pollutants['no2'] = data_point.no2
            if data_point.o3 is not None:
                pollutants['o3'] = data_point.o3
            if data_point.so2 is not None:
                pollutants['so2'] = data_point.so2
            if data_point.co is not None:
                pollutants['co'] = data_point.co
            
            aqi_value = None
            if pollutants:
                individual_aqis = AQICalculator.calculate_all_aqi(pollutants)
                overall_aqi, _ = AQICalculator.get_overall_aqi(individual_aqis)
                aqi_value = float(overall_aqi)
            
            # Check if record already exists
            existing = await self.prisma.airqualityrealtime.find_first(
                where={
                    'timestamp': data_point.timestamp,
                    'latitude': data_point.latitude,
                    'longitude': data_point.longitude,
                    'source': data_point.source
                }
            )
            
            if existing:
                # Update existing record
                await self.prisma.airqualityrealtime.update(
                    where={'id': existing.id},
                    data={
                        'pm25': data_point.pm25,
                        'no2': data_point.no2,
                        'o3': data_point.o3,
                        'so2': data_point.so2,
                        'co': data_point.co,
                        'aqi': aqi_value
                    }
                )
            else:
                # Create new record
                await self.prisma.airqualityrealtime.create(
                    data={
                        'timestamp': data_point.timestamp,
                        'latitude': data_point.latitude,
                        'longitude': data_point.longitude,
                        'level': data_point.level,
                        'pm25': data_point.pm25,
                        'no2': data_point.no2,
                        'o3': data_point.o3,
                        'so2': data_point.so2,
                        'co': data_point.co,
                        'hcho': None,  # Not available in analysis data
                        'aqi': aqi_value,
                        'source': data_point.source
                    }
                )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error inserting analysis data point: {e}")
            return False
    
    async def insert_analysis_data_batch(self, data_points: List[GeosCfAnalysisDataPoint]) -> dict:
        """
        Insert multiple analysis data points in batch
        
        Args:
            data_points: List of GeosCfAnalysisDataPoint objects
            
        Returns:
            Dictionary with insertion results
        """
        if not data_points:
            return {"success": True, "inserted_count": 0, "errors": []}
        
        self.logger.info(f"Inserting {len(data_points)} analysis data points...")
        
        try:
            # Convert data points to batch format for fast insertion
            batch_data = []
            for data_point in data_points:
                # Calculate AQI
                pollutants = {}
                if data_point.pm25 is not None:
                    pollutants['pm25'] = data_point.pm25
                if data_point.no2 is not None:
                    pollutants['no2'] = data_point.no2
                if data_point.o3 is not None:
                    pollutants['o3'] = data_point.o3
                if data_point.so2 is not None:
                    pollutants['so2'] = data_point.so2
                if data_point.co is not None:
                    pollutants['co'] = data_point.co
                
                aqi_value = None
                if pollutants:
                    individual_aqis = AQICalculator.calculate_all_aqi(pollutants)
                    overall_aqi, _ = AQICalculator.get_overall_aqi(individual_aqis)
                    aqi_value = float(overall_aqi)
                
                batch_data.append({
                    'timestamp': data_point.timestamp,
                    'latitude': data_point.latitude,
                    'longitude': data_point.longitude,
                    'level': data_point.level,
                    'pm25': data_point.pm25,
                    'no2': data_point.no2,
                    'o3': data_point.o3,
                    'so2': data_point.so2,
                    'co': data_point.co,
                    'hcho': None,  # Not available in analysis data
                    'aqi': aqi_value,
                    'source': data_point.source
                })
            
            # Use fast batch insertion (like forecast system)
            batch_size = 1000
            total_inserted = 0
            
            print(f"\n💾 Inserting {len(batch_data):,} records in batches of {batch_size}...")
            
            for i in range(0, len(batch_data), batch_size):
                batch = batch_data[i:i + batch_size]
                
                # Fast batch insert (skip duplicates automatically)
                self.prisma.airqualityrealtime.create_many(data=batch, skip_duplicates=True)
                total_inserted += len(batch)
                
                # Progress indicator
                progress = (total_inserted / len(batch_data)) * 100
                print(f"\r   Progress: {progress:.1f}% ({total_inserted:,}/{len(batch_data):,})", end='')
            
            print()  # New line after progress
            
            result = {
                "success": True,
                "inserted_count": total_inserted,
                "total_count": len(data_points),
                "errors": []
            }
            
            self.logger.info(f"✓ Fast batch insertion complete: {total_inserted}/{len(data_points)} data points inserted")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error in batch insertion: {e}")
            return {
                "success": False,
                "inserted_count": 0,
                "total_count": len(data_points),
                "errors": [str(e)]
            }
    
    async def get_latest_analysis_timestamp(self) -> Optional[datetime]:
        """
        Get the timestamp of the latest analysis data in the database
        
        Returns:
            Latest timestamp or None if no data exists
        """
        try:
            latest = await self.prisma.airqualityrealtime.find_first(
                where={
                    'source': 'GEOS-CF-ANALYSIS'
                },
                order_by={
                    'timestamp': 'desc'
                }
            )
            
            return latest.timestamp if latest else None
            
        except Exception as e:
            self.logger.error(f"Error getting latest analysis timestamp: {e}")
            return None
    
    async def check_data_exists(self, timestamp: datetime, latitude: float, longitude: float) -> bool:
        """
        Check if data already exists for a specific timestamp and location
        
        Args:
            timestamp: Data timestamp
            latitude: Latitude
            longitude: Longitude
            
        Returns:
            True if data exists, False otherwise
        """
        try:
            existing = await self.prisma.airqualityrealtime.find_first(
                where={
                    'timestamp': timestamp,
                    'latitude': latitude,
                    'longitude': longitude,
                    'source': 'GEOS-CF-ANALYSIS'
                }
            )
            
            return existing is not None
            
        except Exception as e:
            self.logger.error(f"Error checking data existence: {e}")
            return False
    
    async def check_analysis_exists(self, timestamp: datetime) -> bool:
        """
        Check if analysis data already exists for a specific timestamp
        
        Args:
            timestamp: Analysis timestamp
        
        Returns:
            True if data exists, False otherwise
        """
        try:
            existing = await self.prisma.airqualityrealtime.find_first(
                where={
                    'timestamp': timestamp,
                    'source': 'GEOS-CF-ANALYSIS'
                }
            )
            return existing is not None
            
        except Exception as e:
            self.logger.error(f"Error checking analysis existence: {e}")
            return False


async def main():
    """Test the GEOS-CF Analysis Database"""
    print("🧪 Testing GEOS-CF Analysis Database")
    
    db = GeosCfAnalysisDatabase()
    
    try:
        await db.connect()
        
        # Test getting latest timestamp
        latest = await db.get_latest_analysis_timestamp()
        if latest:
            print(f"✓ Latest analysis data: {latest}")
        else:
            print("✓ No analysis data found in database")
        
        # Test data existence check
        test_timestamp = datetime.utcnow()
        exists = await db.check_data_exists(test_timestamp, 40.0, -74.0)
        print(f"✓ Data existence check: {exists}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
