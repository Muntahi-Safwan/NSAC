#!/usr/bin/env python3
"""
Test script for Gemini AI Radio Broadcast Service
Run this standalone to test broadcast generation without running the full edge server
"""

import asyncio
import sys
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from gemini_broadcast_service import main

if __name__ == "__main__":
    print("\n🎙️  TESTING GEMINI AI RADIO BROADCAST SERVICE")
    print("=" * 80)
    print("This script will generate two broadcast scenarios:")
    print("1. Current conditions based on database data")
    print("2. Another broadcast to show different scenarios")
    print("=" * 80 + "\n")

    asyncio.run(main())
