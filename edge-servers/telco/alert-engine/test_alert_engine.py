#!/usr/bin/env python3
"""
Test script for Alert Engine
Run this to test the alert engine functionality
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from alert_engine.alert_engine import main

if __name__ == "__main__":
    print("\n🚨 TESTING ALERT ENGINE")
    print("=" * 80)
    print("This script will:")
    print("1. Connect to the database")
    print("2. Analyze air quality and wildfire hazards")
    print("3. Identify vulnerable users")
    print("4. Generate personalized and general alerts")
    print("5. Display phone numbers and messages to send")
    print("=" * 80 + "\n")

    asyncio.run(main())
