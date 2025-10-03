#!/usr/bin/env python3
"""
Main Fire System - Hourly Fire Detection and Alert System
Integrates API client, database storage, and alert system
"""

import asyncio
import logging
import sys
from datetime import datetime
from pathlib import Path

# Add the wildfire directory to the path for imports
sys.path.append(str(Path(__file__).parent))

from fire_api_client import FireAPIClient
from fire_database import FireDatabase

# Get logger (logging setup handled by scheduler)
logger = logging.getLogger(__name__)

class FireSystem:
    """
    Main Fire Detection and Alert System
    """
    
    def __init__(self):
        self.api_client = FireAPIClient()
        self.logger = logging.getLogger(__name__)
    
    async def run_hourly_cycle(self):
        """
        Run the complete fire detection and alert cycle
        This is designed to be called hourly by a scheduler
        """
        self.logger.info("🔥 Starting Fire System Hourly Cycle")
        self.logger.info("=" * 60)
        
        try:
            # Step 1: Get recent fire data from NASA FIRMS API
            self.logger.info("📡 Step 1: Collecting fire data from NASA FIRMS API...")
            fire_detections = self.api_client.get_recent_fires(hours_back=1)
            
            if not fire_detections:
                self.logger.warning("⚠️ No fire detections found in the last hour")
                return {
                    "status": "success",
                    "fires_detected": 0,
                    "fires_stored": 0,
                    "alerts_generated": 0,
                    "message": "No fires detected"
                }
            
            self.logger.info(f"✅ Retrieved {len(fire_detections)} fire detections from API")
            
            # Step 2: Store fire data in database
            self.logger.info("💾 Step 2: Storing fire data in database...")
            async with FireDatabase() as db:
                # Get initial stats
                initial_stats = await db.get_fire_statistics()
                self.logger.info(f"   Initial database stats: {initial_stats}")
                
                # Store fire detections
                storage_result = await db.insert_fire_detections(fire_detections)
                self.logger.info(f"   Storage result: {storage_result}")
                
                # Get updated stats
                updated_stats = await db.get_fire_statistics()
                self.logger.info(f"   Updated database stats: {updated_stats}")
                
                # Step 3: Check for alerts
                self.logger.info("🚨 Step 3: Checking for fire alerts...")
                alerts = await db.get_fire_alerts(hours_back=1)
                self.logger.info(f"   Fire alerts needed: {len(alerts)}")
                
                # Log sample alerts
                if alerts:
                    self.logger.info("   Sample alerts:")
                    for i, alert in enumerate(alerts[:3]):
                        self.logger.info(f"     {i+1}. Lat: {alert['latitude']:.4f}, Lon: {alert['longitude']:.4f}")
                        self.logger.info(f"        FRP: {alert['frp']}, Confidence: {alert['confidence']}")
                        self.logger.info(f"        Date: {alert['acq_date']}, Time: {alert['acq_time']}")
                        self.logger.info(f"        Satellite: {alert['satellite']}")
                
                # Step 4: Generate summary
                result = {
                    "status": "success",
                    "fires_detected": len(fire_detections),
                    "fires_stored": storage_result.get('inserted', 0),
                    "fires_skipped": storage_result.get('skipped', 0),
                    "alerts_generated": len(alerts),
                    "database_stats": updated_stats,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                self.logger.info("✅ Fire System Hourly Cycle Completed Successfully")
                self.logger.info(f"   - {result['fires_detected']} fires detected")
                self.logger.info(f"   - {result['fires_stored']} fires stored")
                self.logger.info(f"   - {result['alerts_generated']} alerts generated")
                
                return result
                
        except Exception as e:
            self.logger.error(f"❌ Error in fire system cycle: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def run_test_cycle(self):
        """
        Run a test cycle to verify the system is working
        """
        self.logger.info("🧪 Running Fire System Test Cycle")
        self.logger.info("=" * 60)
        
        result = await self.run_hourly_cycle()
        
        if result["status"] == "success":
            self.logger.info("✅ Test cycle completed successfully")
            self.logger.info(f"   Result: {result}")
        else:
            self.logger.error(f"❌ Test cycle failed: {result}")
        
        return result

async def main():
    """
    Main entry point for the fire system
    """
    fire_system = FireSystem()
    
    # Check command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Run test cycle
        await fire_system.run_test_cycle()
    else:
        # Run normal hourly cycle
        await fire_system.run_hourly_cycle()

if __name__ == "__main__":
    asyncio.run(main())