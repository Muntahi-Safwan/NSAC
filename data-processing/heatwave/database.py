#!/usr/bin/env python3
"""
Simplified Heatwave Database Handler
Uses only meteorological_data and heatwave_alerts tables
"""

import asyncio
import logging
from datetime import datetime, date
from typing import List, Dict, Optional
from dataclasses import dataclass
from prisma import Prisma


@dataclass
class HeatwaveAlert:
    """Simple daily heatwave alert"""
    
    # Location
    latitude: float
    longitude: float
    
    # Temporal
    alert_date: date
    forecast_init_time: datetime
    
    # Temperature data
    max_temperature: float      # °C
    min_temperature: float      # °C
    max_heat_index: float       # °C
    
    # Alert classification
    alert_level: int           # 0=None, 1=Watch, 2=Warning, 3=Emergency
    alert_message: str = ""    # Human-readable message
    
    source: str = "GEOS-CF"


@dataclass
class MeteorologicalData:
    """Hourly meteorological data point"""
    
    # Location
    latitude: float
    longitude: float
    
    # Temporal
    forecast_hour: datetime
    forecast_init_time: datetime
    
    # Weather data
    temperature: float         # °C
    humidity: float           # %
    wind_speed: float         # m/s
    pressure: float           # Pa
    
    source: str = "GEOS-CF"


class SimplifiedHeatwaveDatabase:
    """
    Simplified database handler for heatwave system
    Uses only meteorological_data and heatwave_alerts tables
    """
    
    def __init__(self):
        self.prisma = Prisma()
        self.logger = logging.getLogger(__name__)
    
    async def connect(self):
        """Connect to database"""
        await self.prisma.connect()
        self.logger.info("Connected to simplified heatwave database")
    
    async def disconnect(self):
        """Disconnect from database"""
        await self.prisma.disconnect()
    
    async def __aenter__(self):
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()
    
    async def insert_meteorological_data(self, met_data: List[MeteorologicalData]) -> Dict[str, int]:
        """Insert hourly meteorological data"""
        if not met_data:
            return {"inserted": 0, "skipped": 0}
        
        inserted_count = 0
        skipped_count = 0
        
        try:
            batch_data = []
            for data in met_data:
                # Apply TEMPO coverage filter
                if not (25.0 <= data.latitude <= 50.0 and -125.0 <= data.longitude <= -65.0):
                    skipped_count += 1
                    continue
                
                batch_data.append({
                    'latitude': data.latitude,
                    'longitude': data.longitude,
                    'forecastHour': data.forecast_hour,
                    'forecastInitTime': data.forecast_init_time,
                    'temperature': data.temperature,
                    'humidity': data.humidity,
                    'windSpeed': data.wind_speed,
                    'pressure': data.pressure,
                    'source': data.source
                })
            
            if batch_data:
                # Use raw SQL for reliable database insertion
                try:
                    # Insert using raw SQL to avoid Prisma model issues
                    for data_point in batch_data:
                        await self.prisma.execute_raw(
                            """
                            INSERT INTO meteorological_data 
                            (latitude, longitude, "forecastHour", "forecastInitTime", temperature, humidity, "windSpeed", pressure, source)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                            ON CONFLICT (latitude, longitude, "forecastHour", "forecastInitTime") DO NOTHING
                            """,
                            data_point['latitude'],
                            data_point['longitude'], 
                            data_point['forecastHour'],
                            data_point['forecastInitTime'],
                            data_point['temperature'],
                            data_point['humidity'],
                            data_point['windSpeed'],
                            data_point['pressure'],
                            data_point['source']
                        )
                    inserted_count = len(batch_data)
                except Exception as e:
                    self.logger.error(f"Raw SQL insertion error: {e}")
                    return {"inserted": 0, "skipped": len(met_data)}
            
            self.logger.info(f"Meteorological data: {inserted_count} inserted, {skipped_count} skipped")
            
        except Exception as e:
            self.logger.error(f"Error inserting meteorological data: {e}")
            return {"inserted": 0, "skipped": len(met_data)}
        
        return {"inserted": inserted_count, "skipped": skipped_count}
    
    async def insert_heatwave_alerts(self, alerts: List[HeatwaveAlert]) -> Dict[str, int]:
        """Insert daily heatwave alerts"""
        if not alerts:
            return {"inserted": 0, "skipped": 0}
        
        inserted_count = 0
        skipped_count = 0
        
        try:
            batch_data = []
            for alert in alerts:
                # Apply TEMPO coverage filter
                if not (25.0 <= alert.latitude <= 50.0 and -125.0 <= alert.longitude <= -65.0):
                    skipped_count += 1
                    continue
                
                # Only store alerts with actual risk (level > 0)
                if alert.alert_level > 0:
                    batch_data.append({
                        'latitude': alert.latitude,
                        'longitude': alert.longitude,
                        'alertDate': alert.alert_date,
                        'forecastInitTime': alert.forecast_init_time,
                        'maxTemperature': alert.max_temperature,
                        'minTemperature': alert.min_temperature,
                        'maxHeatIndex': alert.max_heat_index,
                        'alertLevel': alert.alert_level,
                        'alertMessage': alert.alert_message,
                        'source': alert.source
                    })
                else:
                    skipped_count += 1
            
            if batch_data:
                try:
                    # Use raw SQL for reliable heatwave alerts insertion
                    for alert_data in batch_data:
                        await self.prisma.execute_raw(
                            """
                            INSERT INTO heatwave_alerts 
                            (latitude, longitude, "alertDate", "forecastInitTime", "maxTemperature", "minTemperature", "maxHeatIndex", "alertLevel", "alertMessage", source)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                            ON CONFLICT (latitude, longitude, "alertDate", "forecastInitTime") DO NOTHING
                            """,
                            alert_data['latitude'],
                            alert_data['longitude'],
                            alert_data['alertDate'],
                            alert_data['forecastInitTime'],
                            alert_data['maxTemperature'],
                            alert_data['minTemperature'],
                            alert_data['maxHeatIndex'],
                            alert_data['alertLevel'],
                            alert_data['alertMessage'],
                            alert_data['source']
                        )
                    inserted_count = len(batch_data)
                except Exception as e:
                    self.logger.error(f"Heatwave alerts insertion error: {e}")
                    return {"inserted": 0, "skipped": len(alerts)}
            
            self.logger.info(f"Heatwave alerts: {inserted_count} inserted, {skipped_count} skipped")
            
        except Exception as e:
            self.logger.error(f"Error inserting heatwave alerts: {e}")
            return {"inserted": 0, "skipped": len(alerts)}
        
        return {"inserted": inserted_count, "skipped": skipped_count}
    
    async def get_statistics(self) -> Dict:
        """Get database statistics"""
        try:
            met_count = await self.prisma.meteorologicaldata.count()
            alert_count = await self.prisma.heatwavealerts.count()
            
            return {
                'meteorological_records': met_count,
                'heatwave_alerts': alert_count,
                'total_records': met_count + alert_count
            }
        except Exception as e:
            self.logger.error(f"Error getting statistics: {e}")
            return {'error': str(e)}
    
    async def cleanup_old_data(self, hours_to_keep: int = 120):  # 5 days
        """Clean up old meteorological data"""
        from datetime import timedelta
        
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_to_keep)
        
        try:
            # Clean meteorological data
            met_result = await self.prisma.meteorologicaldata.delete_many(
                where={'forecastHour': {'lt': cutoff_time}}
            )
            
            # Clean old alerts (keep 7 days)
            alert_cutoff = datetime.utcnow().date() - timedelta(days=7)
            alert_result = await self.prisma.heatwavealerts.delete_many(
                where={'alertDate': {'lt': alert_cutoff}}
            )
            
            self.logger.info(f"Cleanup: {met_result.count} met records, {alert_result.count} alerts removed")
            
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}")


async def main():
    """Test the simplified database"""
    print("🧪 Testing Simplified Heatwave Database")
    
    async with SimplifiedHeatwaveDatabase() as db:
        stats = await db.get_statistics()
        print(f"Database statistics: {stats}")


if __name__ == "__main__":
    asyncio.run(main())

