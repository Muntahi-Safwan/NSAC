#!/usr/bin/env python3
"""
Simple script to view air quality data from the database
"""

import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import AirQualityDatabase


async def view_data():
    """View air quality data from the database"""
    
    print("🔍 Viewing Air Quality Data from Database")
    print("=" * 50)
    
    async with AirQualityDatabase() as db:
        # Get basic statistics
        stats = await db.get_statistics()
        print(f"\n📊 Database Statistics:")
        print(f"   Total records: {stats['total_records']:,}")
        print(f"   Date range: {stats['oldest_record']} to {stats['newest_record']}")
        
        # Get some sample data
        print(f"\n📋 Sample Data (First 10 records):")
        print("-" * 80)
        
        # Get all records (limited to 10 for display)
        all_records = await db.db.airqualityforecast.find_many(take=10)
        
        if all_records:
            print(f"{'ID':<4} {'Timestamp':<20} {'Lat':<8} {'Lon':<9} {'PM2.5':<8} {'NO2':<8} {'O3':<8} {'SO2':<8} {'CO':<8}")
            print("-" * 80)
            
            for record in all_records:
                print(f"{record.id:<4} {str(record.timestamp):<20} {record.latitude:<8.2f} {record.longitude:<9.2f} "
                      f"{record.pm25:<8.2f} {record.no2:<8.2f} {record.o3:<8.2f} {record.so2:<8.2f} {record.co:<8.2f}")
        else:
            print("No data found in database")
        
        # Get data for a specific location (e.g., New York City area)
        print(f"\n🌍 Data for New York City Area (40.7°N, -74.0°W ±0.5°):")
        print("-" * 80)
        
        nyc_data = await db.get_realtime_data(40.7128, -74.0060, tolerance=0.5)
        if nyc_data:
            print(f"Most recent data point:")
            print(f"  Timestamp: {nyc_data.timestamp}")
            print(f"  Location: {nyc_data.latitude:.4f}°N, {nyc_data.longitude:.4f}°W")
            print(f"  PM2.5: {nyc_data.pm25:.2f} μg/m³")
            print(f"  NO2: {nyc_data.no2:.2f} μg/m³")
            print(f"  O3: {nyc_data.o3:.2f} μg/m³")
            print(f"  SO2: {nyc_data.so2:.2f} μg/m³")
            print(f"  CO: {nyc_data.co:.2f} μg/m³")
        else:
            print("No data found for NYC area")
        
        # Get data summary by pollutant
        print(f"\n📈 Data Summary by Pollutant:")
        print("-" * 50)
        
        # Get all records to calculate statistics
        all_data = await db.db.airqualityforecast.find_many()
        
        if all_data:
            pollutants = ['pm25', 'no2', 'o3', 'so2', 'co']
            
            for pollutant in pollutants:
                values = [getattr(record, pollutant) for record in all_data if getattr(record, pollutant) is not None]
                if values:
                    min_val = min(values)
                    max_val = max(values)
                    avg_val = sum(values) / len(values)
                    print(f"  {pollutant.upper():<4}: Min={min_val:8.2f}, Max={max_val:8.2f}, Avg={avg_val:8.2f} μg/m³")
                else:
                    print(f"  {pollutant.upper():<4}: No data available")


if __name__ == "__main__":
    asyncio.run(view_data())

