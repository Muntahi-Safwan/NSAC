#!/usr/bin/env python3
"""
Clean up CSV files to keep only the original 1-hour data.
This removes all generated historical data.
"""

import csv
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).parent / "data"

def cleanup_air_quality_forecasts():
    """Keep only the first timestamp's data"""
    input_file = DATA_DIR / "air_quality_forecasts.csv"

    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        all_rows = list(reader)

    print(f"Found {len(all_rows)} total records")

    if not all_rows:
        print("No data to clean")
        return

    # Get the first timestamp
    first_timestamp = all_rows[0]['timestamp']

    # Keep only rows with the first timestamp
    original_rows = [row for row in all_rows if row['timestamp'] == first_timestamp]

    print(f"Keeping {len(original_rows)} records with timestamp: {first_timestamp}")

    # Rewrite the file with only original data
    with open(input_file, 'w', encoding='utf-8', newline='') as f:
        if original_rows:
            # Reset IDs to sequential starting from 1
            for i, row in enumerate(original_rows, 1):
                row['id'] = str(i)

            writer = csv.DictWriter(f, fieldnames=original_rows[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            writer.writeheader()
            writer.writerows(original_rows)

    print(f"[OK] Cleaned {input_file}")

def cleanup_air_quality_realtime():
    """Keep only the first timestamp's data"""
    input_file = DATA_DIR / "air_quality_realtime.csv"

    print(f"\nReading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        all_rows = list(reader)

    print(f"Found {len(all_rows)} total records")

    if not all_rows:
        print("No data to clean")
        return

    # Get the first timestamp
    first_timestamp = all_rows[0]['timestamp']

    # Keep only rows with the first timestamp
    original_rows = [row for row in all_rows if row['timestamp'] == first_timestamp]

    print(f"Keeping {len(original_rows)} records with timestamp: {first_timestamp}")

    # Rewrite the file with only original data
    with open(input_file, 'w', encoding='utf-8', newline='') as f:
        if original_rows:
            # Reset IDs to sequential starting from 1030 (original starting ID)
            for i, row in enumerate(original_rows, 1030):
                row['id'] = str(i)

            writer = csv.DictWriter(f, fieldnames=original_rows[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            writer.writeheader()
            writer.writerows(original_rows)

    print(f"[OK] Cleaned {input_file}")

def cleanup_fire_detections():
    """Keep only the first date's data"""
    input_file = DATA_DIR / "fire_detections.csv"

    print(f"\nReading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        all_rows = list(reader)

    print(f"Found {len(all_rows)} total records")

    if not all_rows:
        print("No data to clean")
        return

    # Get the first date
    first_date = all_rows[0]['acqDate']

    # Keep only rows with the first date
    original_rows = [row for row in all_rows if row['acqDate'] == first_date]

    print(f"Keeping {len(original_rows)} records with date: {first_date}")

    # Rewrite the file with only original data
    with open(input_file, 'w', encoding='utf-8', newline='') as f:
        if original_rows:
            # Reset IDs to sequential starting from 902 (original starting ID)
            for i, row in enumerate(original_rows, 902):
                row['id'] = str(i)

            writer = csv.DictWriter(f, fieldnames=original_rows[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            writer.writeheader()
            writer.writerows(original_rows)

    print(f"[OK] Cleaned {input_file}")

def main():
    print("=" * 60)
    print("Cleaning CSV Files - Removing Generated Data")
    print("=" * 60)

    cleanup_air_quality_forecasts()
    cleanup_air_quality_realtime()
    cleanup_fire_detections()

    print("\n" + "=" * 60)
    print("[OK] All CSV files cleaned successfully!")
    print("=" * 60)
    print("\nFiles restored to original state (1 hour/day of data)")

if __name__ == "__main__":
    main()
