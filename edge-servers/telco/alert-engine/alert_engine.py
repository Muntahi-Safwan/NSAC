#!/usr/bin/env python3
"""
Alert Engine for Telco Edge Server
Analyzes hazards and generates alerts for vulnerable individuals and general population
"""

import asyncio
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from prisma import Prisma
from dotenv import load_dotenv

# Try to import google-generativeai
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  google-generativeai not installed. Install with: pip install google-generativeai")

# Load environment variables
load_dotenv()


@dataclass
class HazardAlert:
    """Represents a hazard alert"""
    user_id: Optional[str]
    phone_number: Optional[str]
    user_name: Optional[str]
    alert_type: str  # 'vulnerable' or 'general'
    hazard_type: str  # 'air_quality', 'wildfire', 'heatwave'
    severity: str  # 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    message: str
    location: Dict[str, float]
    timestamp: datetime


class AlertEngine:
    """Main alert engine that detects hazards and generates alerts"""

    def __init__(self):
        self.db = Prisma()
        self.logger = logging.getLogger("AlertEngine")
        
        # Coverage area from environment
        self.coverage_north = float(os.getenv("COVERAGE_AREA_NORTH", "60.0"))
        self.coverage_south = float(os.getenv("COVERAGE_AREA_SOUTH", "15.0"))
        self.coverage_east = float(os.getenv("COVERAGE_AREA_EAST", "-60.0"))
        self.coverage_west = float(os.getenv("COVERAGE_AREA_WEST", "-130.0"))
        
        # Gemini AI setup
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = None
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            self.logger.info("✅ Gemini AI initialized successfully")
        else:
            self.logger.warning("⚠️  Gemini AI not available - using fallback messages")

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

    def is_in_coverage_area(self, latitude: float, longitude: float) -> bool:
        """Check if coordinates are within coverage area"""
        return (self.coverage_south <= latitude <= self.coverage_north and
                self.coverage_west <= longitude <= self.coverage_east)

    async def get_vulnerable_users(self) -> List[Dict]:
        """Get users with health conditions that make them vulnerable"""
        try:
            users = await self.db.user.find_many(
                where={
                    'primaryPhone': {'not': None}
                }
            )

            vulnerable_users = []
            for user in users:
                # Check if user is vulnerable based on age and health conditions
                is_vulnerable = self._is_user_vulnerable(user)
                if is_vulnerable:
                    vulnerable_users.append({
                        'id': user.id,
                        'firstName': user.firstName,
                        'email': user.email,
                        'primaryPhone': user.primaryPhone,
                        'age': user.age,
                        'diseases': user.diseases or [],
                        'allergies': user.allergies or [],
                        'lastLocation': user.lastLocation
                    })

            return vulnerable_users
        except Exception as e:
            self.logger.error(f"Error fetching vulnerable users: {e}")
            return []

    def _is_user_vulnerable(self, user) -> bool:
        """Determine if a user is vulnerable based on age and health conditions"""
        age = user.age or 0
        diseases = user.diseases or []
        allergies = user.allergies or []

        # Age-based vulnerability
        is_young_or_elderly = age < 12 or age > 65

        # Health condition-based vulnerability
        respiratory_conditions = ['asthma', 'copd', 'heart disease', 'respiratory', 'lung disease']
        has_respiratory_condition = any(
            any(condition.lower() in disease.lower() for condition in respiratory_conditions)
            for disease in diseases
        )

        # Has allergies
        has_allergies = len(allergies) > 0

        return is_young_or_elderly or has_respiratory_condition or has_allergies

    async def get_air_quality_hazards(self, hours_ahead: int = 24) -> List[Dict]:
        """Get air quality hazards in the coverage area"""
        try:
            future_time = datetime.now() + timedelta(hours=hours_ahead)
            
            hazards = await self.db.airqualityforecast.find_many(
                where={
                    'timestamp': {'gte': datetime.now(), 'lte': future_time},
                    'latitude': {'gte': self.coverage_south, 'lte': self.coverage_north},
                    'longitude': {'gte': self.coverage_west, 'lte': self.coverage_east},
                    'aqi': {'gt': 100}  # Only unhealthy air quality
                },
                order={'aqi': 'desc'}
            )

            return [{
                'latitude': hazard.latitude,
                'longitude': hazard.longitude,
                'aqi': hazard.aqi,
                'pm25': hazard.pm25,
                'o3': hazard.o3,
                'no2': hazard.no2,
                'timestamp': hazard.timestamp,
                'severity': self._get_aqi_severity(hazard.aqi)
            } for hazard in hazards]
        except Exception as e:
            self.logger.error(f"Error fetching air quality hazards: {e}")
            return []

    async def get_wildfire_hazards(self) -> List[Dict]:
        """Get wildfire hazards in the coverage area"""
        try:
            # Get recent fire detections (last 7 days)
            recent_date = datetime.now() - timedelta(days=7)
            
            hazards = await self.db.firedetections.find_many(
                where={
                    'acqDate': {'gte': recent_date},
                    'latitude': {'gte': self.coverage_south, 'lte': self.coverage_north},
                    'longitude': {'gte': self.coverage_west, 'lte': self.coverage_east},
                    'alertLevel': {'gt': 0}  # Only alerts with level > 0
                },
                order={'alertLevel': 'desc'}
            )

            return [{
                'latitude': hazard.latitude,
                'longitude': hazard.longitude,
                'alertLevel': hazard.alertLevel,
                'confidence': hazard.confidence,
                'frp': hazard.frp,
                'acqDate': hazard.acqDate,
                'severity': self._get_fire_severity(hazard.alertLevel)
            } for hazard in hazards]
        except Exception as e:
            self.logger.error(f"Error fetching wildfire hazards: {e}")
            return []

    def _get_aqi_severity(self, aqi: float) -> str:
        """Get severity level based on AQI"""
        if aqi >= 301:
            return 'CRITICAL'
        elif aqi >= 201:
            return 'HIGH'
        elif aqi >= 151:
            return 'HIGH'
        elif aqi >= 101:
            return 'MODERATE'
        else:
            return 'LOW'

    def _get_fire_severity(self, alert_level: int) -> str:
        """Get severity level based on fire alert level"""
        if alert_level >= 3:
            return 'CRITICAL'
        elif alert_level >= 2:
            return 'HIGH'
        elif alert_level >= 1:
            return 'MODERATE'
        else:
            return 'LOW'

    async def generate_alert_message(self, hazard_type: str, severity: str, 
                                   user_info: Optional[Dict] = None,
                                   hazard_data: Optional[Dict] = None) -> str:
        """Generate alert message using Gemini AI or fallback"""
        
        if self.gemini_model:
            try:
                prompt = self._create_gemini_prompt(hazard_type, severity, user_info, hazard_data)
                response = self.gemini_model.generate_content(prompt)
                message = response.text.strip()
                
                # Ensure message is within SMS length limit
                max_length = int(os.getenv("MAX_SMS_LENGTH", "160"))
                if len(message) > max_length:
                    message = message[:max_length-3] + "..."
                
                return message
            except Exception as e:
                self.logger.error(f"Error generating message with Gemini: {e}")
        
        # Fallback message
        return self._create_fallback_message(hazard_type, severity, user_info)

    def _create_gemini_prompt(self, hazard_type: str, severity: str,
                            user_info: Optional[Dict], hazard_data: Optional[Dict]) -> str:
        """Create prompt for Gemini AI"""
        
        if user_info:
            # Personalized message for vulnerable user
            prompt = f"""Create a personalized SMS alert for environmental hazards.

RECIPIENT: {user_info.get('firstName', 'there')} (Age: {user_info.get('age', 'Unknown')})
HEALTH CONDITIONS: {', '.join(user_info.get('diseases', []))}
ALLERGIES: {', '.join(user_info.get('allergies', []))}

HAZARD: {hazard_type.upper()} - {severity} severity
"""
        else:
            # General alert
            prompt = f"""Create a general SMS alert for environmental hazards.

HAZARD: {hazard_type.upper()} - {severity} severity
"""

        if hazard_data:
            if hazard_type == 'air_quality':
                prompt += f"AQI: {hazard_data.get('aqi', 'N/A')}\n"
            elif hazard_type == 'wildfire':
                prompt += f"Fire Alert Level: {hazard_data.get('alertLevel', 'N/A')}\n"

        prompt += """
Create a clear, urgent SMS message (max 160 characters) that:
1. States the hazard clearly
2. Gives ONE specific action to take
3. Is professional but caring tone
4. For personalized alerts, consider the person's health conditions

Return ONLY the SMS text, nothing else.
"""
        return prompt

    def _create_fallback_message(self, hazard_type: str, severity: str, 
                               user_info: Optional[Dict]) -> str:
        """Create fallback message when Gemini is not available"""
        
        if user_info:
            name = user_info.get('firstName', '')
            prefix = f"{name}: " if name else ""
        else:
            prefix = "ALERT: "
        
        if hazard_type == 'air_quality':
            return f"{prefix}Unhealthy air quality detected. Stay indoors, close windows, use air purifier if available."
        elif hazard_type == 'wildfire':
            return f"{prefix}Wildfire alert in your area. Prepare to evacuate if needed. Stay informed via local authorities."
        else:
            return f"{prefix}Environmental hazard detected. Take necessary precautions and stay safe."

    async def process_vulnerable_alerts(self) -> List[HazardAlert]:
        """Process alerts for vulnerable individuals"""
        alerts = []
        
        try:
            vulnerable_users = await self.get_vulnerable_users()
            air_quality_hazards = await self.get_air_quality_hazards()
            wildfire_hazards = await self.get_wildfire_hazards()
            
            self.logger.info(f"Found {len(vulnerable_users)} vulnerable users")
            self.logger.info(f"Found {len(air_quality_hazards)} air quality hazards")
            self.logger.info(f"Found {len(wildfire_hazards)} wildfire hazards")
            
            for user in vulnerable_users:
                user_location = user.get('lastLocation', {})
                user_lat = user_location.get('lat', 0)
                user_lng = user_location.get('lng', 0)
                
                # Check air quality hazards near user
                for hazard in air_quality_hazards:
                    if self._is_near_location(user_lat, user_lng, 
                                            hazard['latitude'], hazard['longitude']):
                        
                        # Generate personalized message
                        message = await self.generate_alert_message(
                            'air_quality', hazard['severity'], user, hazard
                        )
                        
                        alerts.append(HazardAlert(
                            user_id=user['id'],
                            phone_number=user['primaryPhone'],
                            user_name=user['firstName'],
                            alert_type='vulnerable',
                            hazard_type='air_quality',
                            severity=hazard['severity'],
                            message=message,
                            location={'lat': user_lat, 'lng': user_lng},
                            timestamp=datetime.now()
                        ))
                
                # Check wildfire hazards near user
                for hazard in wildfire_hazards:
                    if self._is_near_location(user_lat, user_lng,
                                            hazard['latitude'], hazard['longitude']):
                        
                        message = await self.generate_alert_message(
                            'wildfire', hazard['severity'], user, hazard
                        )
                        
                        alerts.append(HazardAlert(
                            user_id=user['id'],
                            phone_number=user['primaryPhone'],
                            user_name=user['firstName'],
                            alert_type='vulnerable',
                            hazard_type='wildfire',
                            severity=hazard['severity'],
                            message=message,
                            location={'lat': user_lat, 'lng': user_lng},
                            timestamp=datetime.now()
                        ))
            
        except Exception as e:
            self.logger.error(f"Error processing vulnerable alerts: {e}")
        
        return alerts

    async def process_general_alerts(self) -> List[HazardAlert]:
        """Process general alerts for the population"""
        alerts = []
        
        try:
            air_quality_hazards = await self.get_air_quality_hazards()
            wildfire_hazards = await self.get_wildfire_hazards()
            
            # Process critical air quality alerts
            critical_aq_hazards = [h for h in air_quality_hazards if h['severity'] in ['HIGH', 'CRITICAL']]
            for hazard in critical_aq_hazards:
                message = await self.generate_alert_message(
                    'air_quality', hazard['severity'], None, hazard
                )
                
                alerts.append(HazardAlert(
                    user_id=None,
                    phone_number=None,
                    user_name=None,
                    alert_type='general',
                    hazard_type='air_quality',
                    severity=hazard['severity'],
                    message=message,
                    location={'lat': hazard['latitude'], 'lng': hazard['longitude']},
                    timestamp=datetime.now()
                ))
            
            # Process critical wildfire alerts
            critical_fire_hazards = [h for h in wildfire_hazards if h['severity'] in ['HIGH', 'CRITICAL']]
            for hazard in critical_fire_hazards:
                message = await self.generate_alert_message(
                    'wildfire', hazard['severity'], None, hazard
                )
                
                alerts.append(HazardAlert(
                    user_id=None,
                    phone_number=None,
                    user_name=None,
                    alert_type='general',
                    hazard_type='wildfire',
                    severity=hazard['severity'],
                    message=message,
                    location={'lat': hazard['latitude'], 'lng': hazard['longitude']},
                    timestamp=datetime.now()
                ))
            
        except Exception as e:
            self.logger.error(f"Error processing general alerts: {e}")
        
        return alerts

    def _is_near_location(self, user_lat: float, user_lng: float,
                         hazard_lat: float, hazard_lng: float,
                         radius_km: float = 50.0) -> bool:
        """Check if hazard is near user location (simple distance calculation)"""
        # Simple approximation - in production, use proper haversine formula
        lat_diff = abs(user_lat - hazard_lat)
        lng_diff = abs(user_lng - hazard_lng)
        
        # Rough conversion: 1 degree ≈ 111 km
        distance_km = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111
        
        return distance_km <= radius_km

    async def run_alert_analysis(self) -> Tuple[List[HazardAlert], List[HazardAlert]]:
        """Run complete alert analysis"""
        self.logger.info("🔍 Starting alert analysis...")
        
        vulnerable_alerts = await self.process_vulnerable_alerts()
        general_alerts = await self.process_general_alerts()
        
        self.logger.info(f"✅ Generated {len(vulnerable_alerts)} vulnerable alerts")
        self.logger.info(f"✅ Generated {len(general_alerts)} general alerts")
        
        return vulnerable_alerts, general_alerts

    def display_alerts(self, vulnerable_alerts: List[HazardAlert], 
                      general_alerts: List[HazardAlert]):
        """Display alerts in terminal"""
        print("\n" + "="*80)
        print("🚨 ALERT ENGINE RESULTS")
        print("="*80)
        
        if vulnerable_alerts:
            print(f"\n👥 VULNERABLE INDIVIDUAL ALERTS ({len(vulnerable_alerts)}):")
            print("-" * 50)
            for i, alert in enumerate(vulnerable_alerts, 1):
                print(f"\n{i}. {alert.user_name} ({alert.phone_number})")
                print(f"   Hazard: {alert.hazard_type.upper()} - {alert.severity}")
                print(f"   Location: {alert.location['lat']:.4f}, {alert.location['lng']:.4f}")
                print(f"   Message ({len(alert.message)} chars):")
                print(f"   \"{alert.message}\"")
        else:
            print("\n✅ No vulnerable individual alerts needed")
        
        if general_alerts:
            print(f"\n📢 GENERAL POPULATION ALERTS ({len(general_alerts)}):")
            print("-" * 50)
            for i, alert in enumerate(general_alerts, 1):
                print(f"\n{i}. {alert.hazard_type.upper()} - {alert.severity}")
                print(f"   Location: {alert.location['lat']:.4f}, {alert.location['lng']:.4f}")
                print(f"   Message ({len(alert.message)} chars):")
                print(f"   \"{alert.message}\"")
        else:
            print("\n✅ No general population alerts needed")
        
        print("\n" + "="*80)
        print(f"📊 SUMMARY: {len(vulnerable_alerts)} vulnerable + {len(general_alerts)} general = {len(vulnerable_alerts) + len(general_alerts)} total alerts")
        print("="*80)


async def main():
    """Main function to test the alert engine"""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    logger = logging.getLogger("Main")
    
    logger.info("🚨 ALERT ENGINE TEST")
    logger.info("=" * 50)
    
    # Initialize alert engine
    alert_engine = AlertEngine()
    await alert_engine.connect()
    
    try:
        # Run alert analysis
        vulnerable_alerts, general_alerts = await alert_engine.run_alert_analysis()
        
        # Display results
        alert_engine.display_alerts(vulnerable_alerts, general_alerts)
        
    except Exception as e:
        logger.error(f"❌ Error running alert engine: {e}")
    
    finally:
        await alert_engine.disconnect()
        logger.info("✅ Alert engine test completed")


if __name__ == "__main__":
    asyncio.run(main())
