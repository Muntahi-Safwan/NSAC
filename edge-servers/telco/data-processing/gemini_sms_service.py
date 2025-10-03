#!/usr/bin/env python3
"""
Gemini AI SMS Generation Service for Telco Edge Server
Generates personalized SMS alerts for registered users based on hazards and user profiles
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


class GeminiSMSService:
    """Service to generate personalized SMS alerts using Gemini AI"""

    def __init__(self):
        self.db = Prisma()
        self.logger = logging.getLogger("GeminiSMS")
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

    async def get_registered_users(self) -> List[Dict]:
        """Get all registered users with their profiles"""
        try:
            users = await self.db.user.find_many(
                where={
                    'primaryPhone': {'not': None}  # Only users with phone numbers
                }
            )

            return [{
                'id': user.id,
                'firstName': user.firstName,
                'email': user.email,
                'primaryPhone': user.primaryPhone,
                'age': user.age,
                'diseases': user.diseases or [],
                'allergies': user.allergies or [],
                'lastLocation': user.lastLocation
            } for user in users]
        except Exception as e:
            self.logger.error(f"Error fetching users: {e}")
            return []

    async def get_current_air_quality(self, latitude: float, longitude: float) -> Optional[Dict]:
        """Get latest air quality data for a location"""
        try:
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

    async def get_active_wildfires(self, latitude: float, longitude: float, radius: float = 1.0) -> List[Dict]:
        """Get active wildfires within radius (degrees) of location"""
        try:
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
                'alertLevel': fire.alertLevel
            } for fire in fires]
        except Exception as e:
            self.logger.error(f"Error fetching wildfires: {e}")
            return []

    async def get_heatwave_alerts(self, latitude: float, longitude: float) -> List[Dict]:
        """Get heatwave alerts for location"""
        try:
            today = datetime.now().date()

            alerts = await self.db.heatwavealerts.find_many(
                where={
                    'alertDate': {'gte': today},
                    'latitude': {'gte': latitude - 0.5, 'lte': latitude + 0.5},
                    'longitude': {'gte': longitude - 0.5, 'lte': longitude + 0.5},
                    'alertLevel': {'gt': 0}
                },
                order={'alertLevel': 'desc'},
                take=3
            )

            return [{
                'alertLevel': alert.alertLevel,
                'maxTemperature': alert.maxTemperature,
                'maxHeatIndex': alert.maxHeatIndex,
                'alertDate': alert.alertDate
            } for alert in alerts]
        except Exception as e:
            self.logger.error(f"Error fetching heatwave alerts: {e}")
            return []

    def determine_user_vulnerability(self, user: Dict, air_quality: Optional[Dict],
                                    wildfires: List[Dict], heatwaves: List[Dict]) -> tuple[bool, str, List[str]]:
        """
        Determine if user should receive alert based on their profile and hazards
        Returns: (should_alert, severity, relevant_hazards)
        """
        hazards = []
        severity = "NORMAL"
        should_alert = False

        # Check air quality
        if air_quality and air_quality.get('aqi'):
            aqi = air_quality['aqi']

            # Check user vulnerabilities
            user_age = user.get('age', 0)
            user_diseases = user.get('diseases', [])
            user_allergies = user.get('allergies', [])

            # High-risk groups
            is_vulnerable = (
                user_age and (user_age < 12 or user_age > 65) or
                any(d.lower() in ['asthma', 'copd', 'heart disease', 'respiratory'] for d in user_diseases) or
                len(user_allergies) > 0
            )

            if aqi > 150:
                should_alert = True
                severity = "WARNING"
                hazards.append(f"Unhealthy air quality (AQI: {aqi:.0f})")
            elif aqi > 100 and is_vulnerable:
                should_alert = True
                severity = "CAUTION"
                hazards.append(f"Moderate air quality - concerning for sensitive groups (AQI: {aqi:.0f})")

        # Check wildfires
        if wildfires:
            critical_fires = [f for f in wildfires if f.get('alertLevel', 0) >= 2]
            if critical_fires:
                should_alert = True
                severity = "EMERGENCY" if len(critical_fires) > 3 else "WARNING"
                hazards.append(f"{len(critical_fires)} wildfire(s) near your area")

        # Check heatwaves
        if heatwaves:
            max_level = max([h.get('alertLevel', 0) for h in heatwaves])
            if max_level >= 2:
                should_alert = True
                severity = "EMERGENCY" if max_level == 3 else "WARNING"
                max_temp = max([h.get('maxTemperature', 0) for h in heatwaves])
                hazards.append(f"Heatwave alert - temperatures up to {max_temp:.0f}°C")

        return should_alert, severity, hazards

    def generate_sms_prompt(self, user: Dict, severity: str, hazards: List[str],
                           air_quality: Optional[Dict], wildfires: List[Dict],
                           heatwaves: List[Dict]) -> str:
        """Generate prompt for Gemini AI to create personalized SMS"""

        user_name = user.get('firstName', 'there')
        user_age = user.get('age', 0)
        user_diseases = user.get('diseases', [])
        user_allergies = user.get('allergies', [])

        prompt = f"""Create a personalized SMS alert for environmental hazards.

RECIPIENT PROFILE:
- Name: {user_name}
- Age: {user_age if user_age else 'Unknown'}
- Health Conditions: {', '.join(user_diseases) if user_diseases else 'None reported'}
- Allergies: {', '.join(user_allergies) if user_allergies else 'None reported'}

ALERT SEVERITY: {severity}

HAZARDS:
"""
        for hazard in hazards:
            prompt += f"- {hazard}\n"

        prompt += f"""
DETAILED CONDITIONS:
"""
        if air_quality:
            prompt += f"- Current AQI: {air_quality.get('aqi', 'N/A'):.0f}\n"
            if air_quality.get('pm25'):
                prompt += f"- PM2.5: {air_quality['pm25']:.1f} μg/m³\n"

        if wildfires:
            prompt += f"- Active wildfires: {len(wildfires)} detected nearby\n"

        if heatwaves:
            max_temp = max([h.get('maxTemperature', 0) for h in heatwaves])
            prompt += f"- Maximum temperature: {max_temp:.0f}°C\n"

        prompt += f"""
TASK: Create a personalized SMS alert (160 characters or less) that:
1. Addresses the user by name if available
2. Clearly states the main hazard(s)
3. Gives ONE specific action they should take NOW
4. Considers their health profile (age, conditions, allergies)
5. Is urgent but not panic-inducing

IMPORTANT CONSTRAINTS:
- Maximum 160 characters (standard SMS length)
- Direct, clear language
- Actionable advice
- Professional but caring tone

Return ONLY the SMS text, nothing else.
"""

        return prompt

    async def generate_sms_alerts(self) -> List[Dict]:
        """
        Generate personalized SMS alerts for all registered users
        Returns list of generated SMS messages
        """
        users = await self.get_registered_users()

        if not users:
            self.logger.info("No registered users found")
            return []

        alerts = []

        for user in users:
            # Get user location (default to Dhaka if not set)
            location = user.get('lastLocation', {})
            latitude = location.get('lat', 23.8103)
            longitude = location.get('lng', 90.4125)

            # Get environmental data for user location
            air_quality = await self.get_current_air_quality(latitude, longitude)
            wildfires = await self.get_active_wildfires(latitude, longitude)
            heatwaves = await self.get_heatwave_alerts(latitude, longitude)

            # Check if user should receive alert
            should_alert, severity, hazards = self.determine_user_vulnerability(
                user, air_quality, wildfires, heatwaves
            )

            if not should_alert:
                continue  # Skip users who don't need alerts

            # Generate personalized SMS
            prompt = self.generate_sms_prompt(user, severity, hazards, air_quality, wildfires, heatwaves)

            if self.model:
                try:
                    response = self.model.generate_content(prompt)
                    sms_text = response.text.strip()
                    # Ensure it's within SMS length
                    if len(sms_text) > 160:
                        sms_text = sms_text[:157] + "..."
                except Exception as e:
                    self.logger.error(f"Error generating SMS with Gemini for user {user['id']}: {e}")
                    # Fallback SMS
                    sms_text = f"{severity} ALERT: {hazards[0] if hazards else 'Environmental hazard'}. Stay safe!"
            else:
                # Fallback when Gemini is not available
                sms_text = f"{severity} ALERT: {hazards[0] if hazards else 'Environmental hazard'}. Stay safe!"

            alerts.append({
                'user_id': user['id'],
                'user_name': user.get('firstName', 'User'),
                'phone': user['primaryPhone'],
                'email': user['email'],
                'severity': severity,
                'hazards': hazards,
                'location': {'latitude': latitude, 'longitude': longitude},
                'sms_text': sms_text,
                'timestamp': datetime.now().isoformat(),
                'air_quality_aqi': air_quality.get('aqi') if air_quality else None,
                'wildfires_count': len(wildfires),
                'heatwave_alerts': len(heatwaves)
            })

        return alerts


async def main():
    """Main function to test the SMS service"""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    logger = logging.getLogger("Main")

    logger.info("📱 GEMINI AI SMS ALERT SERVICE")
    logger.info("=" * 80)

    # Initialize service
    service = GeminiSMSService()
    await service.connect()

    try:
        logger.info("📊 Fetching registered users and generating personalized SMS alerts...")
        logger.info("=" * 80)

        # Generate SMS alerts
        alerts = await service.generate_sms_alerts()

        logger.info("\n" + "=" * 80)
        logger.info("📊 SMS GENERATION RESULTS")
        logger.info("=" * 80)

        if not alerts:
            logger.info("✅ No alerts needed - all users are in safe conditions")
            logger.info("📱 No SMS messages generated")
        else:
            logger.info(f"🚨 Generated {len(alerts)} personalized SMS alert(s)")
            logger.info("=" * 80 + "\n")

            for idx, alert in enumerate(alerts, 1):
                logger.info(f"SMS #{idx}:")
                logger.info(f"  👤 Recipient: {alert['user_name']} ({alert['email']})")
                logger.info(f"  📞 Phone: {alert['phone']}")
                logger.info(f"  🚦 Severity: {alert['severity']}")
                logger.info(f"  ⚠️  Hazards: {', '.join(alert['hazards'])}")
                logger.info(f"  📍 Location: {alert['location']['latitude']:.4f}°N, {alert['location']['longitude']:.4f}°E")

                if alert['air_quality_aqi']:
                    logger.info(f"  🌬️  AQI: {alert['air_quality_aqi']:.0f}")
                if alert['wildfires_count'] > 0:
                    logger.info(f"  🔥 Wildfires: {alert['wildfires_count']}")
                if alert['heatwave_alerts'] > 0:
                    logger.info(f"  🌡️  Heatwave Alerts: {alert['heatwave_alerts']}")

                logger.info(f"\n  📱 SMS MESSAGE ({len(alert['sms_text'])} chars):")
                logger.info("  " + "-" * 76)
                logger.info(f"  {alert['sms_text']}")
                logger.info("  " + "-" * 76 + "\n")

            logger.info("=" * 80)
            logger.info(f"✅ Total SMS alerts ready to send: {len(alerts)}")

    finally:
        await service.disconnect()
        logger.info("\n✅ SMS service test completed")


if __name__ == "__main__":
    asyncio.run(main())
