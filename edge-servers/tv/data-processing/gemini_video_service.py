#!/usr/bin/env python3
"""
Gemini AI Video Generation Service for TV Edge Server
Generates emergency broadcast video scripts and metadata using Google Gemini AI
Only generates videos when hazards are detected
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path
import sys
import json

# Add parent directory to path for prisma imports
sys.path.append(str(Path(__file__).parent))

from prisma import Prisma
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import google-generativeai
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  google-generativeai not installed. Install with: pip install google-generativeai")


class GeminiVideoService:
    """Service to generate TV broadcast video scripts using Gemini AI"""

    def __init__(self):
        self.db = Prisma()
        self.logger = logging.getLogger("GeminiVideo")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")

        # Video output directory
        self.video_output_dir = Path(__file__).parent / "generated_videos"
        self.video_output_dir.mkdir(exist_ok=True)

        # Initialize Gemini AI
        if GEMINI_AVAILABLE and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.logger.info("✅ Gemini AI initialized successfully")
        else:
            self.model = None
            if not GEMINI_AVAILABLE:
                self.logger.warning("⚠️  Gemini AI not available - package not installed")
            elif not self.gemini_api_key:
                self.logger.warning("⚠️  GEMINI_API_KEY not set in .env file")

    async def connect(self):
        """Connect to database"""
        if not self.db.is_connected():
            await self.db.connect()
            self.logger.info("🔌 Connected to database")

    async def disconnect(self):
        """Disconnect from database"""
        if self.db.is_connected():
            await self.db.disconnect()
            self.logger.info("🔌 Disconnected from database")

    async def get_current_air_quality(self, latitude: float = 23.8103, longitude: float = 90.4125) -> Optional[Dict]:
        """Get latest air quality data for a location (default: Dhaka, Bangladesh)"""
        try:
            # Get most recent realtime air quality data near the location
            air_quality = await self.db.airqualityrealtime.find_first(
                order={'timestamp': 'desc'},
                where={
                    'latitude': {'gte': latitude - 0.5, 'lte': latitude + 0.5},
                    'longitude': {'gte': longitude - 0.5, 'lte': longitude + 0.5}
                }
            )

            if air_quality:
                return {
                    'aqi': air_quality.aqi,
                    'pm25': air_quality.pm25,
                    'o3': air_quality.o3,
                    'no2': air_quality.no2,
                    'so2': air_quality.so2,
                    'co': air_quality.co,
                    'timestamp': air_quality.timestamp
                }
            return None
        except Exception as e:
            self.logger.error(f"Error fetching air quality: {e}")
            return None

    async def get_active_wildfires(self, latitude: float = 23.8103, longitude: float = 90.4125, radius: float = 2.0) -> List[Dict]:
        """Get active wildfires within radius (degrees) of location"""
        try:
            # Get fires from last 24 hours
            yesterday = datetime.now() - timedelta(days=1)

            fires = await self.db.firedetections.find_many(
                where={
                    'acqDate': {'gte': yesterday},
                    'latitude': {'gte': latitude - radius, 'lte': latitude + radius},
                    'longitude': {'gte': longitude - radius, 'lte': longitude + radius}
                },
                order={'frp': 'desc'},
                take=20
            )

            return [{
                'latitude': fire.latitude,
                'longitude': fire.longitude,
                'frp': fire.frp,
                'brightness': fire.brightness,
                'confidence': fire.confidence,
                'alertLevel': fire.alertLevel,
                'acqDate': fire.acqDate,
                'acqTime': fire.acqTime
            } for fire in fires]
        except Exception as e:
            self.logger.error(f"Error fetching wildfires: {e}")
            return []

    async def get_heatwave_alerts(self, latitude: float = 23.8103, longitude: float = 90.4125) -> List[Dict]:
        """Get heatwave alerts for location"""
        try:
            # Get heatwave alerts for next 5 days
            today = datetime.now().date()

            alerts = await self.db.heatwavealerts.find_many(
                where={
                    'alertDate': {'gte': today},
                    'latitude': {'gte': latitude - 0.5, 'lte': latitude + 0.5},
                    'longitude': {'gte': longitude - 0.5, 'lte': longitude + 0.5},
                    'alertLevel': {'gt': 0}  # Only active alerts
                },
                order={'alertLevel': 'desc'},
                take=5
            )

            return [{
                'alertLevel': alert.alertLevel,
                'maxTemperature': alert.maxTemperature,
                'minTemperature': alert.minTemperature,
                'maxHeatIndex': alert.maxHeatIndex,
                'alertMessage': alert.alertMessage,
                'alertDate': alert.alertDate
            } for alert in alerts]
        except Exception as e:
            self.logger.error(f"Error fetching heatwave alerts: {e}")
            return []

    def determine_hazard_level(self, air_quality: Optional[Dict], wildfires: List[Dict], heatwaves: List[Dict]) -> tuple[bool, str, List[str]]:
        """
        Determine if there are hazards requiring TV broadcast
        Returns: (has_hazard, severity_level, hazard_list)
        """
        hazards = []
        max_severity = "NONE"

        # Check air quality
        if air_quality and air_quality.get('aqi'):
            aqi = air_quality['aqi']
            if aqi > 200:
                hazards.append(f"VERY UNHEALTHY air quality (AQI: {aqi:.0f})")
                max_severity = "EMERGENCY" if max_severity in ["NONE", "WARNING"] else max_severity
            elif aqi > 150:
                hazards.append(f"Unhealthy air quality (AQI: {aqi:.0f})")
                max_severity = "WARNING" if max_severity == "NONE" else max_severity

        # Check wildfires
        if wildfires:
            critical_fires = [f for f in wildfires if f.get('alertLevel', 0) >= 3]
            high_intensity_fires = [f for f in wildfires if f.get('frp', 0) > 100]

            if critical_fires:
                hazards.append(f"{len(critical_fires)} CRITICAL wildfire(s) detected")
                max_severity = "EMERGENCY"
            elif high_intensity_fires:
                hazards.append(f"{len(high_intensity_fires)} high-intensity wildfire(s)")
                max_severity = "EMERGENCY" if max_severity == "NONE" else max_severity
            elif len(wildfires) > 5:
                hazards.append(f"{len(wildfires)} active wildfires in the area")
                max_severity = "WARNING" if max_severity == "NONE" else max_severity

        # Check heatwaves
        if heatwaves:
            emergency_heatwaves = [h for h in heatwaves if h.get('alertLevel', 0) == 3]
            warning_heatwaves = [h for h in heatwaves if h.get('alertLevel', 0) == 2]

            if emergency_heatwaves:
                hazards.append(f"EMERGENCY heatwave alert - {len(emergency_heatwaves)} day(s)")
                max_severity = "EMERGENCY"
            elif warning_heatwaves:
                hazards.append(f"Heatwave warning - {len(warning_heatwaves)} day(s)")
                max_severity = "WARNING" if max_severity == "NONE" else max_severity

        has_hazard = len(hazards) > 0
        return has_hazard, max_severity, hazards

    def generate_video_script_prompt(self, severity: str, air_quality: Optional[Dict],
                                     wildfires: List[Dict], heatwaves: List[Dict],
                                     hazard_descriptions: List[str]) -> str:
        """Generate prompt for Gemini AI to create video script"""

        prompt = f"""You are creating an EMERGENCY TV BROADCAST script for Bangladesh television.

SEVERITY LEVEL: {severity}
HAZARDS DETECTED:
"""
        for hazard in hazard_descriptions:
            prompt += f"- {hazard}\n"

        prompt += f"""
DETAILED DATA:
"""
        if air_quality:
            prompt += f"\nAIR QUALITY:\n"
            prompt += f"- AQI: {air_quality.get('aqi', 'N/A'):.0f}\n"
            if air_quality.get('pm25'):
                prompt += f"- PM2.5: {air_quality['pm25']:.1f} μg/m³\n"
            if air_quality.get('o3'):
                prompt += f"- Ozone: {air_quality['o3']:.1f} μg/m³\n"

        if wildfires:
            prompt += f"\nWILDFIRES:\n"
            prompt += f"- Total fires detected: {len(wildfires)}\n"
            high_intensity = [f for f in wildfires if f.get('frp', 0) > 100]
            if high_intensity:
                prompt += f"- High intensity fires: {len(high_intensity)}\n"
                max_frp = max([f.get('frp', 0) for f in high_intensity])
                prompt += f"- Maximum fire intensity: {max_frp:.1f} MW\n"

        if heatwaves:
            prompt += f"\nHEATWAVE ALERTS:\n"
            for hw in heatwaves[:3]:  # Top 3
                level_name = {1: "WATCH", 2: "WARNING", 3: "EMERGENCY"}.get(hw.get('alertLevel', 0), "UNKNOWN")
                prompt += f"- {hw.get('alertDate')}: {level_name} - Max {hw.get('maxTemperature', 'N/A'):.1f}°C (Heat Index: {hw.get('maxHeatIndex', 'N/A'):.1f}°C)\n"

        prompt += f"""
TASK: Create a 60-90 second TV emergency broadcast script with the following structure:

1. OPENING (5-10 seconds):
   - Urgent but calm announcement
   - State this is an emergency environmental alert

2. SITUATION OVERVIEW (15-20 seconds):
   - Clearly describe all active hazards
   - Mention specific severity levels and data points
   - Use simple, direct language

3. HEALTH IMPACTS (15-20 seconds):
   - Specific health risks for each hazard type
   - Who is most vulnerable (children, elderly, people with conditions)
   - Immediate symptoms to watch for

4. SAFETY INSTRUCTIONS (20-30 seconds):
   - Clear, actionable steps people should take NOW
   - What to avoid
   - Where to seek shelter or help
   - Emergency contact information if relevant

5. CLOSING (5-10 seconds):
   - Reassurance that authorities are monitoring
   - When to expect next update
   - Stay safe message

TONE: Urgent, authoritative, but calm and reassuring. Think of a professional news anchor during an emergency.
FORMAT: Write as a script with clear paragraph breaks for the anchor to read.
"""

        return prompt

    async def generate_video_content(self, latitude: float = 23.8103, longitude: float = 90.4125) -> Optional[Dict]:
        """
        Generate TV broadcast video script only if hazards are detected
        Returns None if no hazards, otherwise returns video metadata and script
        """

        # Gather all data
        air_quality = await self.get_current_air_quality(latitude, longitude)
        wildfires = await self.get_active_wildfires(latitude, longitude)
        heatwaves = await self.get_heatwave_alerts(latitude, longitude)

        # Determine if there are hazards
        has_hazard, severity, hazard_list = self.determine_hazard_level(air_quality, wildfires, heatwaves)

        # Only generate video if there are hazards
        if not has_hazard:
            return None

        # Generate prompt
        prompt = self.generate_video_script_prompt(severity, air_quality, wildfires, heatwaves, hazard_list)

        # Generate script using Gemini
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                script = response.text
            except Exception as e:
                self.logger.error(f"Error generating script with Gemini: {e}")
                script = f"[Gemini AI Error - Using fallback script]\n\nEMERGENCY ALERT - {severity}\n\n"
                script += "\n".join(hazard_list)
                script += "\n\nPlease stay indoors, follow safety guidelines, and monitor official channels for updates."
        else:
            # Fallback when Gemini is not available
            script = f"[Gemini AI Not Available - Using fallback script]\n\nEMERGENCY ALERT - {severity}\n\n"
            script += "\n".join(hazard_list)
            script += "\n\nPlease stay indoors, follow safety guidelines, and monitor official channels for updates."

        # Create video metadata
        timestamp = datetime.now()
        video_filename = f"emergency_broadcast_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        video_filepath = self.video_output_dir / video_filename

        video_metadata = {
            'timestamp': timestamp.isoformat(),
            'location': {'latitude': latitude, 'longitude': longitude},
            'severity': severity,
            'hazards': hazard_list,
            'air_quality': air_quality,
            'wildfires_count': len(wildfires),
            'heatwave_alerts_count': len(heatwaves),
            'script': script,
            'video_file': video_filename,
            'duration_seconds': 60,  # Estimated
            'format': 'emergency_broadcast'
        }

        # Save metadata to file (simulating video generation)
        with open(video_filepath, 'w', encoding='utf-8') as f:
            json.dump(video_metadata, f, indent=2, default=str)

        return video_metadata


async def main():
    """Main function to test the video service"""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    logger = logging.getLogger("Main")

    logger.info("📺 GEMINI AI TV VIDEO GENERATION SERVICE")
    logger.info("=" * 80)

    # Initialize service
    service = GeminiVideoService()
    await service.connect()

    try:
        # Test location: Dhaka, Bangladesh
        latitude = 23.8103
        longitude = 90.4125

        logger.info(f"📍 Checking hazards for: {latitude}°N, {longitude}°E (Dhaka)")
        logger.info("=" * 80)

        # Generate video content (only if hazards exist)
        result = await service.generate_video_content(latitude, longitude)

        logger.info("\n" + "=" * 80)
        logger.info("📊 VIDEO GENERATION RESULTS")
        logger.info("=" * 80)

        if result is None:
            logger.info("✅ NO HAZARDS DETECTED")
            logger.info("🎬 No emergency video generated")
            logger.info("📺 Normal programming continues")
        else:
            logger.info("🚨 HAZARDS DETECTED - EMERGENCY VIDEO GENERATED")
            logger.info(f"⏰ Timestamp: {result['timestamp']}")
            logger.info(f"📍 Location: {result['location']}")
            logger.info(f"🚦 Severity: {result['severity']}")
            logger.info(f"⚠️  Hazards: {', '.join(result['hazards'])}")
            logger.info(f"📁 Video File: {result['video_file']}")
            logger.info(f"⏱️  Duration: {result['duration_seconds']} seconds")

            logger.info("\n" + "=" * 80)
            logger.info("📺 EMERGENCY TV BROADCAST SCRIPT:")
            logger.info("=" * 80)
            logger.info("\n" + result['script'])
            logger.info("\n" + "=" * 80)

            logger.info(f"\n💾 Video metadata saved to: {service.video_output_dir / result['video_file']}")

    finally:
        await service.disconnect()
        logger.info("\n✅ Video service test completed")


if __name__ == "__main__":
    asyncio.run(main())
