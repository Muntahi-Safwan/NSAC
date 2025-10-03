#!/usr/bin/env python3
"""
Gemini AI Broadcast Service for Radio Edge Server
Generates weather and hazard alert audio scripts using Google Gemini AI
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path
import sys

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


class GeminiBroadcastService:
    """Service to generate radio broadcast scripts using Gemini AI"""

    def __init__(self):
        self.db = Prisma()
        self.logger = logging.getLogger("GeminiBroadcast")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")

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
                take=10
            )

            return [{
                'latitude': fire.latitude,
                'longitude': fire.longitude,
                'frp': fire.frp,
                'confidence': fire.confidence,
                'alertLevel': fire.alertLevel,
                'acqDate': fire.acqDate
            } for fire in fires]
        except Exception as e:
            self.logger.error(f"Error fetching wildfires: {e}")
            return []

    async def get_heatwave_alerts(self, latitude: float = 23.8103, longitude: float = 90.4125) -> Optional[Dict]:
        """Get heatwave alerts for location"""
        try:
            # Get heatwave alerts for next 5 days
            today = datetime.now().date()

            alert = await self.db.heatwavealerts.find_first(
                where={
                    'alertDate': {'gte': today},
                    'latitude': {'gte': latitude - 0.5, 'lte': latitude + 0.5},
                    'longitude': {'gte': longitude - 0.5, 'lte': longitude + 0.5},
                    'alertLevel': {'gt': 0}  # Only active alerts
                },
                order={'alertLevel': 'desc'}
            )

            if alert:
                return {
                    'alertLevel': alert.alertLevel,
                    'maxTemperature': alert.maxTemperature,
                    'maxHeatIndex': alert.maxHeatIndex,
                    'alertMessage': alert.alertMessage,
                    'alertDate': alert.alertDate
                }
            return None
        except Exception as e:
            self.logger.error(f"Error fetching heatwave alerts: {e}")
            return None

    def determine_hazard_level(self, air_quality: Optional[Dict], wildfires: List[Dict], heatwave: Optional[Dict]) -> str:
        """Determine overall hazard level based on all data sources"""
        hazards = []

        # Check air quality
        if air_quality and air_quality.get('aqi'):
            aqi = air_quality['aqi']
            if aqi > 150:
                hazards.append(f"unhealthy air quality (AQI: {aqi:.0f})")
            elif aqi > 100:
                hazards.append(f"moderate air quality (AQI: {aqi:.0f})")

        # Check wildfires
        if wildfires:
            high_intensity_fires = [f for f in wildfires if f.get('frp', 0) > 50]
            if high_intensity_fires:
                hazards.append(f"{len(high_intensity_fires)} high-intensity wildfire(s)")
            elif len(wildfires) > 0:
                hazards.append(f"{len(wildfires)} active wildfire(s)")

        # Check heatwave
        if heatwave:
            level = heatwave.get('alertLevel', 0)
            if level == 3:
                hazards.append("EMERGENCY heatwave")
            elif level == 2:
                hazards.append("heatwave warning")
            elif level == 1:
                hazards.append("heatwave watch")

        if hazards:
            return "HAZARD: " + ", ".join(hazards)
        return "NORMAL"

    def generate_broadcast_prompt(self, condition: str, air_quality: Optional[Dict],
                                  wildfires: List[Dict], heatwave: Optional[Dict]) -> str:
        """Generate prompt for Gemini AI based on conditions"""

        if condition.startswith("HAZARD"):
            prompt = f"""You are a radio broadcaster for an emergency alert system covering Bangladesh.
Generate a 30-second emergency broadcast script about current environmental hazards.

CURRENT CONDITIONS:
- Status: {condition}
"""
            if air_quality:
                prompt += f"\n- Air Quality Index: {air_quality.get('aqi', 'N/A'):.0f}"
                if air_quality.get('pm25'):
                    prompt += f"\n- PM2.5: {air_quality['pm25']:.1f} μg/m³"

            if wildfires:
                prompt += f"\n- Active Wildfires: {len(wildfires)} detected"
                max_frp = max([f.get('frp', 0) for f in wildfires])
                prompt += f"\n- Maximum Fire Intensity: {max_frp:.1f} MW"

            if heatwave:
                prompt += f"\n- Heatwave Alert Level: {heatwave.get('alertLevel', 0)}/3"
                prompt += f"\n- Maximum Temperature: {heatwave.get('maxTemperature', 'N/A'):.1f}°C"
                prompt += f"\n- Heat Index: {heatwave.get('maxHeatIndex', 'N/A'):.1f}°C"

            prompt += """

Please generate a clear, urgent but calm emergency broadcast. Include:
1. Brief introduction of the hazard(s)
2. Specific health risks
3. Safety recommendations
4. Reassurance that authorities are monitoring

Keep it concise, actionable, and in a professional emergency broadcast tone.
"""
        else:
            # Normal conditions
            prompt = f"""You are a friendly radio broadcaster for a weather information service in Bangladesh.
Generate a 20-second pleasant weather forecast broadcast.

CURRENT CONDITIONS:
"""
            if air_quality:
                aqi = air_quality.get('aqi', 0)
                prompt += f"\n- Air Quality: Good (AQI: {aqi:.0f})"

            prompt += """
- No active hazards detected
- Weather conditions are normal

Please generate a friendly, informative weather update. Include:
1. Good news about air quality
2. General weather conditions
3. Encouragement for outdoor activities if safe
4. Reminder to stay informed

Keep it warm, conversational, and reassuring.
"""

        return prompt

    async def generate_broadcast_script(self, latitude: float = 23.8103, longitude: float = 90.4125) -> Dict:
        """Generate broadcast script based on current conditions"""

        # Gather all data
        air_quality = await self.get_current_air_quality(latitude, longitude)
        wildfires = await self.get_active_wildfires(latitude, longitude)
        heatwave = await self.get_heatwave_alerts(latitude, longitude)

        # Determine hazard level
        condition = self.determine_hazard_level(air_quality, wildfires, heatwave)

        # Generate prompt
        prompt = self.generate_broadcast_prompt(condition, air_quality, wildfires, heatwave)

        # Generate script using Gemini
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                script = response.text
            except Exception as e:
                self.logger.error(f"Error generating script with Gemini: {e}")
                script = "[Gemini AI Error - Using fallback script]"
                if condition.startswith("HAZARD"):
                    script += f"\n\nEMERGENCY ALERT: {condition}\nPlease stay indoors and follow safety guidelines."
                else:
                    script += "\n\nWeather conditions are normal. Have a great day!"
        else:
            # Fallback when Gemini is not available
            script = "[Gemini AI Not Available - Using fallback script]"
            if condition.startswith("HAZARD"):
                script += f"\n\nEMERGENCY ALERT: {condition}\nPlease stay indoors and follow safety guidelines."
            else:
                script += "\n\nWeather conditions are normal. Air quality is good. Have a great day!"

        return {
            'timestamp': datetime.now().isoformat(),
            'location': {'latitude': latitude, 'longitude': longitude},
            'condition': condition,
            'hazard_detected': condition.startswith("HAZARD"),
            'air_quality': air_quality,
            'wildfires_count': len(wildfires),
            'heatwave_alert': heatwave is not None,
            'broadcast_script': script
        }


async def main():
    """Main function to test the broadcast service"""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    logger = logging.getLogger("Main")

    logger.info("🎙️  GEMINI AI RADIO BROADCAST SERVICE")
    logger.info("=" * 60)

    # Initialize service
    service = GeminiBroadcastService()
    await service.connect()

    try:
        # Test location: Dhaka, Bangladesh
        latitude = 23.8103
        longitude = 90.4125

        logger.info(f"📍 Generating broadcast for: {latitude}°N, {longitude}°E (Dhaka)")
        logger.info("=" * 60)

        # Generate broadcast
        result = await service.generate_broadcast_script(latitude, longitude)

        # Display results
        logger.info("\n" + "=" * 60)
        logger.info("📊 BROADCAST GENERATION RESULTS")
        logger.info("=" * 60)
        logger.info(f"⏰ Timestamp: {result['timestamp']}")
        logger.info(f"📍 Location: {result['location']}")
        logger.info(f"🚦 Condition: {result['condition']}")
        logger.info(f"⚠️  Hazard Detected: {result['hazard_detected']}")

        if result['air_quality']:
            logger.info(f"🌬️  Air Quality AQI: {result['air_quality'].get('aqi', 'N/A')}")

        if result['wildfires_count'] > 0:
            logger.info(f"🔥 Active Wildfires: {result['wildfires_count']}")

        if result['heatwave_alert']:
            logger.info(f"🌡️  Heatwave Alert: Active")

        logger.info("\n" + "=" * 60)
        if result['hazard_detected']:
            logger.info("🚨 HAZARD BROADCAST SCRIPT:")
        else:
            logger.info("☀️  NORMAL BROADCAST SCRIPT:")
        logger.info("=" * 60)
        logger.info("\n" + result['broadcast_script'])
        logger.info("\n" + "=" * 60)

        # Test second scenario (simulate different conditions)
        logger.info("\n\n🔄 Generating second broadcast scenario...")
        logger.info("=" * 60)
        result2 = await service.generate_broadcast_script(latitude, longitude)

        logger.info(f"🚦 Condition: {result2['condition']}")
        if result2['hazard_detected']:
            logger.info("🚨 HAZARD BROADCAST SCRIPT:")
        else:
            logger.info("☀️  NORMAL BROADCAST SCRIPT:")
        logger.info("=" * 60)
        logger.info("\n" + result2['broadcast_script'])
        logger.info("\n" + "=" * 60)

    finally:
        await service.disconnect()
        logger.info("\n✅ Broadcast service test completed")


if __name__ == "__main__":
    asyncio.run(main())
