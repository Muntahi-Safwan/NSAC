#!/usr/bin/env python3
"""
Fire Database Handler - Simplified for Alerts Only
Handles database operations for fire detection data and alerts
"""

import asyncio
import logging
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from prisma import Prisma


@dataclass
class FireDetection:
    """Fire detection data for database storage and alerts"""
    latitude: float
    longitude: float
    brightness: float
    scan: float
    track: float
    acq_date: date
    acq_time: str
    satellite: str
    confidence: str
    version: str
    bright_t31: float
    frp: float
    daynight: str
    alert_level: Optional[int] = None  # 1=Watch, 2=Warning, 3=Emergency
    alert_sent: bool = False


class FireDatabase:
    """
    Database operations for fire detection data and alerts
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.prisma = Prisma()
    
    async def __aenter__(self):
        await self.prisma.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.prisma.disconnect()
    
    async def insert_fire_detections(self, fire_detections: List[FireDetection]) -> Dict[str, int]:
        """
        Insert fire detection data into the database
        
        Args:
            fire_detections: List of fire detection objects
            
        Returns:
            Dictionary with insertion results
        """
        if not fire_detections:
            return {"inserted": 0, "skipped": 0}
        
        inserted_count = 0
        skipped_count = 0
        
        try:
            for detection in fire_detections:
                try:
                    await self.prisma.execute_raw(
                        """
                        INSERT INTO fire_detections 
                        (latitude, longitude, brightness, scan, track, "brightT31", frp,
                         "acqDate", "acqTime", daynight, satellite, confidence, version,
                         "alertLevel", "alertSent", source)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9, $10, $11, $12, $13, $14, $15, $16)
                        ON CONFLICT (latitude, longitude, "acqDate", "acqTime", satellite) DO NOTHING
                        """,
                        detection.latitude,
                        detection.longitude,
                        detection.brightness,
                        detection.scan,
                        detection.track,
                        detection.bright_t31,
                        detection.frp,
                        detection.acq_date.isoformat(),
                        detection.acq_time,
                        detection.daynight,
                        detection.satellite,
                        detection.confidence,
                        detection.version,
                        detection.alert_level,
                        detection.alert_sent,
                        "NASA-FIRMS"
                    )
                    inserted_count += 1
                    
                except Exception as e:
                    self.logger.warning(f"Error inserting fire detection: {e}")
                    skipped_count += 1
            
            self.logger.info(f"Fire detections: {inserted_count} inserted, {skipped_count} skipped")
            
        except Exception as e:
            self.logger.error(f"Error inserting fire detections: {e}")
            return {"inserted": 0, "skipped": len(fire_detections)}
        
        return {"inserted": inserted_count, "skipped": skipped_count}
    
    async def get_fire_statistics(self) -> Dict[str, any]:
        """
        Get fire detection statistics from the database
        
        Returns:
            Dictionary with fire detection statistics
        """
        try:
            # Get total fire detections using a more reliable approach
            count_result = await self.prisma.execute_raw("SELECT COUNT(*) as count FROM fire_detections")
            
            # Handle different result formats from Prisma
            if isinstance(count_result, int):
                total_detections = count_result
            elif isinstance(count_result, list) and len(count_result) > 0:
                # Check if it's a list of tuples or a list of dicts
                first_result = count_result[0]
                if isinstance(first_result, (list, tuple)):
                    total_detections = first_result[0] if len(first_result) > 0 else 0
                elif isinstance(first_result, dict):
                    total_detections = first_result.get('count', 0)
                else:
                    total_detections = first_result if isinstance(first_result, (int, float)) else 0
            else:
                total_detections = 0
            
            # Get latest detection date
            latest_result = await self.prisma.execute_raw("SELECT MAX(\"acqDate\") as latest_date FROM fire_detections")
            latest_date = None
            
            if isinstance(latest_result, list) and len(latest_result) > 0:
                first_result = latest_result[0]
                if isinstance(first_result, (list, tuple)):
                    latest_date = first_result[0] if len(first_result) > 0 else None
                elif isinstance(first_result, dict):
                    latest_date = first_result.get('latest_date')
                else:
                    latest_date = first_result
            
            return {
                "total_detections": total_detections,
                "latest_date": latest_date,
                "fire_detections": total_detections,
                "latest_detection_date": latest_date,
                "total_records": total_detections
            }
            
        except Exception as e:
            self.logger.error(f"Error getting fire statistics: {e}")
            return {
                "total_detections": 0, 
                "latest_date": None,
                "fire_detections": 0, 
                "latest_detection_date": None, 
                "total_records": 0
            }
    
    async def cleanup_old_data(self, days_to_keep: int = 30) -> int:
        """
        Clean up old fire detection data
        
        Args:
            days_to_keep: Number of days of data to keep
            
        Returns:
            Number of records deleted
        """
        try:
            cutoff_date = date.today() - timedelta(days=days_to_keep)
            
            result = await self.prisma.execute_raw(
                "DELETE FROM fire_detections WHERE \"acqDate\" < $1",
                cutoff_date.isoformat()
            )
            
            self.logger.info(f"Cleaned up fire data older than {cutoff_date}")
            return result
            
        except Exception as e:
            self.logger.error(f"Error cleaning up old fire data: {e}")
            return 0
    
    async def get_fire_alerts(self, hours_back: int = 24) -> List[Dict]:
        """
        Get fire detections that should trigger alerts
        
        Args:
            hours_back: Number of hours back to check for new fires
            
        Returns:
            List of fire detections that need alerts
        """
        try:
            # Get recent fire detections that haven't had alerts sent
            cutoff_time = datetime.utcnow() - timedelta(hours=hours_back)
            
            result = await self.prisma.execute_raw(
                """
                SELECT 
                    id, latitude, longitude, brightness, frp, 
                    "acqDate", "acqTime", satellite, confidence,
                    "alertLevel", "alertSent"
                FROM fire_detections 
                WHERE "createdAt" >= $1::timestamp 
                AND "alertSent" = false
                AND confidence IN ('nominal', 'high')
                AND frp >= 0.1
                ORDER BY frp DESC, "createdAt" DESC
                """,
                cutoff_time
            )
            
            alerts = []
            # Handle different result formats from Prisma
            if result is not None:
                if isinstance(result, int):
                    # If result is an integer, it might be an error code or count
                    self.logger.warning(f"Fire alerts query returned integer: {result}")
                    return []
                elif isinstance(result, list) and len(result) > 0:
                    for row in result:
                        # Handle both tuple and dict formats
                        if isinstance(row, (list, tuple)) and len(row) >= 11:
                            alerts.append({
                                'id': row[0],
                                'latitude': row[1],
                                'longitude': row[2],
                                'brightness': row[3],
                                'frp': row[4],
                                'acq_date': row[5],
                                'acq_time': row[6],
                                'satellite': row[7],
                                'confidence': row[8],
                                'alert_level': row[9],
                                'alert_sent': row[10]
                            })
                        elif isinstance(row, dict):
                            alerts.append({
                                'id': row.get('id'),
                                'latitude': row.get('latitude'),
                                'longitude': row.get('longitude'),
                                'brightness': row.get('brightness'),
                                'frp': row.get('frp'),
                                'acq_date': row.get('acqDate'),
                                'acq_time': row.get('acqTime'),
                                'satellite': row.get('satellite'),
                                'confidence': row.get('confidence'),
                                'alert_level': row.get('alertLevel'),
                                'alert_sent': row.get('alertSent')
                            })
            
            self.logger.info(f"Found {len(alerts)} fire detections needing alerts")
            return alerts
            
        except Exception as e:
            self.logger.error(f"Error getting fire alerts: {e}")
            return []
    
    async def mark_alert_sent(self, fire_detection_id: int) -> bool:
        """
        Mark a fire detection alert as sent
        
        Args:
            fire_detection_id: ID of the fire detection
            
        Returns:
            True if successful, False otherwise
        """
        try:
            await self.prisma.execute_raw(
                "UPDATE fire_detections SET \"alertSent\" = true WHERE id = $1",
                fire_detection_id
            )
            return True
        except Exception as e:
            self.logger.error(f"Error marking alert as sent: {e}")
            return False


async def main():
    """Test the fire database"""
    print("🔥 Testing Fire Database")
    
    async with FireDatabase() as db:
        stats = await db.get_fire_statistics()
        print(f"Fire database statistics: {stats}")
        
        # Test fire alerts
        alerts = await db.get_fire_alerts()
        print(f"Fire alerts needed: {len(alerts)}")
    
    print("✅ Fire database tests completed")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
