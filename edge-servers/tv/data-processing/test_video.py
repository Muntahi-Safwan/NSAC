#!/usr/bin/env python3
"""
Test script for Gemini AI TV Video Generation Service
Run this standalone to test video generation without running the full edge server
"""

import asyncio
import sys
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from gemini_video_service import main

if __name__ == "__main__":
    print("\n📺 TESTING GEMINI AI TV VIDEO GENERATION SERVICE")
    print("=" * 80)
    print("This script will check for hazards and generate emergency TV video if needed")
    print("If no hazards are detected, normal TV programming continues")
    print("=" * 80 + "\n")

    asyncio.run(main())
