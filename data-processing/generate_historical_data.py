#!/usr/bin/env python3
"""
Generate historical mock data for the last 3 days and append to existing CSV files.
This script creates realistic variations of air quality data across time.
"""

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
DAYS_TO_GENERATE = 3  # Changed from 5 to 3 days
HOURS_PER_DAY = 24
DATA_DIR = Path(__file__).parent / "data"

def add_variation(value, variation_percent=0.15):
    """Add random variation to a value (+/- variation_percent)"""
    if value is None or value == 'NULL' or value == '':
        return None
    try:
        val = float(value)
        variation = val * variation_percent
        new_val = val + random.uniform(-variation, variation)
        return max(0, new_val)  # Ensure non-negative
    except (ValueError, TypeError):
        return value

def add_time_of_day_variation(value, hour):
    """Add time-of-day variations (higher pollution during rush hours)"""
    if value is None or value == 'NULL' or value == '':
        return None
    try:
        val = float(value)
        # Rush hour multipliers (7-9 AM and 5-7 PM)
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            multiplier = random.uniform(1.1, 1.3)
        # Night time (lower pollution)
        elif 22 <= hour or hour <= 5:
            multiplier = random.uniform(0.7, 0.9)
        else:
            multiplier = random.uniform(0.9, 1.1)

        return val * multiplier
    except (ValueError, TypeError):
        return value

def generate_air_quality_forecasts():
    """Generate and append historical forecast data"""
    input_file = DATA_DIR / "air_quality_forecasts.csv"

    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        existing_rows = list(reader)

    print(f"Found {len(existing_rows)} existing records")

    # Find max ID
    max_id = max(int(row['id']) for row in existing_rows)
    current_id = max_id + 1

    # Parse the timestamp from the first row
    base_timestamp = datetime.strptime(existing_rows[0]['timestamp'], '%Y-%m-%d %H:%M:%S')

    # Get unique locations (sample of rows with same timestamp)
    base_rows = [row for row in existing_rows if row['timestamp'] == existing_rows[0]['timestamp']]
    print(f"Found {len(base_rows)} unique locations")

    new_rows = []

    # Generate data for each hour in the past 5 days
    for day in range(DAYS_TO_GENERATE):
        for hour in range(HOURS_PER_DAY):
            # Calculate timestamp (going backwards from base_timestamp)
            hours_back = (DAYS_TO_GENERATE - day) * 24 - hour
            timestamp = base_timestamp - timedelta(hours=hours_back)
            forecast_init_time = timestamp - timedelta(hours=random.randint(6, 12))
            created_at = datetime.now()

            # Generate variations for each location
            for base_row in base_rows:
                new_row = base_row.copy()
                new_row['id'] = str(current_id)
                current_id += 1

                new_row['timestamp'] = timestamp.strftime('%Y-%m-%d %H:%M:%S')
                new_row['forecastInitTime'] = forecast_init_time.strftime('%Y-%m-%d %H:%M:%S')
                new_row['createdAt'] = created_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

                # Add variations to pollutant values
                for field in ['pm25', 'no2', 'o3', 'so2', 'co', 'hcho', 'aqi']:
                    if field in new_row and new_row[field] and new_row[field] != 'NULL':
                        # Add base variation
                        value = add_variation(new_row[field], 0.2)
                        # Add time-of-day variation for relevant pollutants
                        if field in ['pm25', 'no2', 'co']:
                            value = add_time_of_day_variation(value, timestamp.hour)
                        new_row[field] = value if value is not None else 'NULL'

                new_rows.append(new_row)

    print(f"Generated {len(new_rows)} new records")

    # Append new data to existing file
    print(f"Appending to {input_file}...")
    with open(input_file, 'a', encoding='utf-8', newline='') as f:
        if new_rows:
            writer = csv.DictWriter(f, fieldnames=new_rows[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            writer.writerows(new_rows)

    print(f"[OK] Total records now: {len(existing_rows) + len(new_rows)}")

def generate_air_quality_realtime():
    """Generate and append historical realtime data"""
    input_file = DATA_DIR / "air_quality_realtime.csv"

    print(f"\nReading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        existing_rows = list(reader)

    print(f"Found {len(existing_rows)} existing records")

    # Find max ID
    max_id = max(int(row['id']) for row in existing_rows)
    current_id = max_id + 1

    # Parse the timestamp from the first row
    base_timestamp = datetime.strptime(existing_rows[0]['timestamp'], '%Y-%m-%d %H:%M:%S')

    # Get unique locations (sample of rows with same timestamp)
    base_rows = [row for row in existing_rows if row['timestamp'] == existing_rows[0]['timestamp']]
    print(f"Found {len(base_rows)} unique locations")

    new_rows = []

    # Generate data for each hour in the past 5 days
    for day in range(DAYS_TO_GENERATE):
        for hour in range(HOURS_PER_DAY):
            # Calculate timestamp (going backwards from base_timestamp)
            hours_back = (DAYS_TO_GENERATE - day) * 24 - hour
            timestamp = base_timestamp - timedelta(hours=hours_back)
            created_at = datetime.now()

            # Generate variations for each location
            for base_row in base_rows:
                new_row = base_row.copy()
                new_row['id'] = str(current_id)
                current_id += 1

                new_row['timestamp'] = timestamp.strftime('%Y-%m-%d %H:%M:%S')
                new_row['createdAt'] = created_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

                # Add variations to pollutant values (realtime data has less variation)
                for field in ['pm25', 'no2', 'o3', 'so2', 'co', 'hcho', 'aqi']:
                    if field in new_row and new_row[field] and new_row[field] != 'NULL':
                        # Add base variation (smaller for realtime)
                        value = add_variation(new_row[field], 0.15)
                        # Add time-of-day variation
                        if field in ['pm25', 'no2', 'co']:
                            value = add_time_of_day_variation(value, timestamp.hour)
                        new_row[field] = value if value is not None else 'NULL'

                new_rows.append(new_row)

    print(f"Generated {len(new_rows)} new records")

    # Append new data to existing file
    print(f"Appending to {input_file}...")
    with open(input_file, 'a', encoding='utf-8', newline='') as f:
        if new_rows:
            writer = csv.DictWriter(f, fieldnames=new_rows[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            writer.writerows(new_rows)

    print(f"[OK] Total records now: {len(existing_rows) + len(new_rows)}")

def generate_fire_detections():
    """Generate and append historical fire detection data"""
    input_file = DATA_DIR / "fire_detections.csv"

    print(f"\nReading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        existing_rows = list(reader)

    print(f"Found {len(existing_rows)} existing records")

    # Find max ID
    max_id = max(int(row['id']) for row in existing_rows)
    current_id = max_id + 1

    # Parse the date from the first row
    base_date = datetime.strptime(existing_rows[0]['acqDate'], '%Y-%m-%d')

    # Get all base fires
    base_rows = existing_rows

    new_rows = []

    # Generate data for each day in the past 5 days
    for day in range(DAYS_TO_GENERATE):
        # Calculate date (going backwards from base_date)
        days_back = DAYS_TO_GENERATE - day
        acq_date = base_date - timedelta(days=days_back)
        created_at = datetime.now()

        # Randomly select 60-80% of base fires for each day (fires don't persist every day)
        num_fires = int(len(base_rows) * random.uniform(0.6, 0.8))
        selected_fires = random.sample(base_rows, num_fires)

        for base_row in selected_fires:
            new_row = base_row.copy()
            new_row['id'] = str(current_id)
            current_id += 1

            new_row['acqDate'] = acq_date.strftime('%Y-%m-%d')
            new_row['createdAt'] = created_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

            # Add slight variations to fire properties
            for field in ['latitude', 'longitude', 'brightness', 'brightT31', 'frp']:
                if field in new_row and new_row[field]:
                    # Very small variation for coordinates
                    variation = 0.02 if field in ['latitude', 'longitude'] else 0.15
                    new_row[field] = add_variation(new_row[field], variation)

            # Randomly vary acquisition time
            new_row['acqTime'] = str(random.randint(0, 2359)).zfill(4)

            new_rows.append(new_row)

    print(f"Generated {len(new_rows)} new records")

    # Append new data to existing file
    print(f"Appending to {input_file}...")
    with open(input_file, 'a', encoding='utf-8', newline='') as f:
        if new_rows:
            writer = csv.DictWriter(f, fieldnames=new_rows[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            writer.writerows(new_rows)

    print(f"[OK] Total records now: {len(existing_rows) + len(new_rows)}")

def generate_heatwave_alerts():
    """Generate and append historical heatwave alert data"""
    input_file = DATA_DIR / "heatwave_alerts.csv"

    print(f"\nReading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        existing_rows = list(reader)

    print(f"Found {len(existing_rows)} existing records")

    if not existing_rows:
        print("No base data to work with, skipping...")
        return

    # Find max ID
    max_id = max(int(row['id']) for row in existing_rows)
    current_id = max_id + 1

    # Parse the date from the first row
    base_date = datetime.strptime(existing_rows[0]['alertDate'], '%Y-%m-%d')

    # Get unique locations (sample of rows with same date)
    base_rows = [row for row in existing_rows if row['alertDate'] == existing_rows[0]['alertDate']]
    print(f"Found {len(base_rows)} unique locations")

    new_rows = []

    # Generate data for each day in the past 3 days
    for day in range(DAYS_TO_GENERATE):
        # Calculate date (going backwards from base_date)
        days_back = DAYS_TO_GENERATE - day
        alert_date = base_date - timedelta(days=days_back)
        forecast_init_time = alert_date - timedelta(hours=12)
        created_at = datetime.now()

        for base_row in base_rows:
            new_row = base_row.copy()
            new_row['id'] = str(current_id)
            current_id += 1

            new_row['alertDate'] = alert_date.strftime('%Y-%m-%d')
            new_row['forecastInitTime'] = forecast_init_time.strftime('%Y-%m-%d %H:%M:%S')
            new_row['createdAt'] = created_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

            # Add slight variations to temperature values
            for field in ['maxTemperature', 'minTemperature', 'maxHeatIndex']:
                if field in new_row and new_row[field] and new_row[field] != 'NULL':
                    value = add_variation(new_row[field], 0.1)  # 10% variation
                    new_row[field] = value if value is not None else 'NULL'

            new_rows.append(new_row)

    print(f"Generated {len(new_rows)} new records")

    # Append new data to existing file
    print(f"Appending to {input_file}...")
    with open(input_file, 'a', encoding='utf-8', newline='') as f:
        if new_rows:
            writer = csv.DictWriter(f, fieldnames=new_rows[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            writer.writerows(new_rows)

    print(f"[OK] Total records now: {len(existing_rows) + len(new_rows)}")

def main():
    """Main function to generate all historical data"""
    print("=" * 60)
    print("Generating Historical Mock Data for Last 3 Days")
    print("=" * 60)

    # Generate data for each type
    generate_air_quality_forecasts()
    generate_air_quality_realtime()
    generate_fire_detections()
    generate_heatwave_alerts()

    print("\n" + "=" * 60)
    print("[OK] All historical data appended successfully!")
    print("=" * 60)
    print("\nUpdated files:")
    print("  - air_quality_forecasts.csv")
    print("  - air_quality_realtime.csv")
    print("  - fire_detections.csv")
    print("  - heatwave_alerts.csv")

if __name__ == "__main__":
    main()
