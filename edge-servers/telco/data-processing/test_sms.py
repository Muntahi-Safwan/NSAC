#!/usr/bin/env python3
"""
Test script for Gemini AI SMS Alert Service
Run this standalone to test SMS generation without running the full edge server
"""

import asyncio
import sys
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from gemini_sms_service import main

if __name__ == "__main__":
    print("\n📱 TESTING GEMINI AI SMS ALERT SERVICE")
    print("=" * 80)
    print("This script will check registered users and generate personalized SMS alerts")
    print("SMS messages are tailored based on user profiles and environmental hazards")
    print("=" * 80 + "\n")

    asyncio.run(main())
