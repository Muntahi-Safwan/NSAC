"""
Main Air Quality Data Collection System
Orchestrates both forecast and real-time data collection by calling their respective main files
"""

import asyncio
import logging
import sys
import os
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional


class AirQualityMainSystem:
    """
    Main orchestrator for air quality data collection system.
    
    Calls the respective main files for forecast and realtime data collection.
    """
    
    def __init__(self, sample_rate: int = 1):
        """Initialize the main system"""
        self.logger = self._setup_logging()
        self.sample_rate = sample_rate
        self.base_path = Path(__file__).parent
        
        self.logger.info("🚀 Air Quality Main System initialized")
    
    async def initialize_components(self):
        """Initialize system components (required by scheduler)"""
        self.logger.info("🔧 Initializing system components...")
        # No components to initialize since we use subprocess calls
        self.logger.info("✓ System components initialized")
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger("AirQualityMain")
        logger.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Create console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        return logger
    
    async def run_forecast_collection(self) -> Dict:
        """
        Run forecast data collection by calling forecast/main.py
        
        Returns:
            Dictionary with collection results
        """
        self.logger.info("🌤️ Starting forecast data collection...")
        
        try:
            # Call forecast main file
            forecast_main = self.base_path / "forecast" / "main.py"
            result = subprocess.run([
                sys.executable, str(forecast_main)
            ], capture_output=True, text=True, cwd=self.base_path.parent)
            
            if result.returncode == 0:
                self.logger.info("✓ Forecast collection completed successfully")
                return {
                    "success": True,
                    "message": "Forecast data collected successfully",
                    "data_points": 0  # We don't capture the exact count from subprocess
                }
            else:
                self.logger.error(f"Forecast collection failed: {result.stderr}")
                return {
                    "success": False,
                    "message": f"Forecast collection failed: {result.stderr}",
                    "data_points": 0
                }
            
        except Exception as e:
            self.logger.error(f"Forecast collection failed: {e}")
            return {
                "success": False,
                "message": f"Forecast collection failed: {e}",
                "data_points": 0
            }
    
    async def run_realtime_collection(self) -> Dict:
        """
        Run real-time data collection by calling realtime/main.py
        
        Returns:
            Dictionary with collection results
        """
        self.logger.info("📡 Starting real-time data collection...")
        
        try:
            # Call realtime main file
            realtime_main = self.base_path / "realtime" / "main.py"
            result = subprocess.run([
                sys.executable, str(realtime_main)
            ], capture_output=True, text=True, cwd=self.base_path.parent)
            
            if result.returncode == 0:
                self.logger.info("✓ Real-time collection completed successfully")
                return {
                    "success": True,
                    "message": "Real-time data collected successfully",
                    "data_points": 0  # We don't capture the exact count from subprocess
                }
            else:
                self.logger.error(f"Real-time collection failed: {result.stderr}")
                return {
                    "success": False,
                    "message": f"Real-time collection failed: {result.stderr}",
                    "data_points": 0
                }
            
        except Exception as e:
            self.logger.error(f"Real-time collection failed: {e}")
            return {
                "success": False,
                "message": f"Real-time collection failed: {e}",
                "data_points": 0
            }
    
    async def run_hourly_collection(self) -> Dict:
        """
        Run hourly data collection (both forecast and analysis)
        
        Returns:
            Dictionary with collection results
        """
        self.logger.info("⏰ Starting hourly data collection...")
        
        results = {
            "forecast": None,
            "realtime": None,
            "success": False,
            "total_data_points": 0
        }
        
        try:
            # Run forecast collection
            forecast_result = await self.run_forecast_collection()
            results["forecast"] = forecast_result
            
            # Run real-time collection
            realtime_result = await self.run_realtime_collection()
            results["realtime"] = realtime_result
            
            # Calculate totals
            results["total_data_points"] = (
                forecast_result.get("data_points", 0) + 
                realtime_result.get("data_points", 0)
            )
            results["success"] = (
                forecast_result.get("success", False) or 
                realtime_result.get("success", False)
            )
            
            self.logger.info(f"✓ Hourly collection complete: {results['total_data_points']} total data points")
            
        except Exception as e:
            self.logger.error(f"Hourly collection failed: {e}")
            results["success"] = False
            results["error"] = str(e)
        
        return results
    
    async def cleanup(self):
        """Cleanup resources"""
        self.logger.info("✓ Main system cleanup complete")


async def main():
    """Main entry point for the air quality system"""
    print("🌍 Air Quality Data Collection System")
    print("=" * 50)
    
    system = AirQualityMainSystem()
    
    try:
        # Run both forecast and realtime collection (default behavior)
        print("⏰ Running hourly collection (forecast + realtime)...")
        results = await system.run_hourly_collection()  # This runs both forecast and realtime
        
        # Print results
        print("\n📊 Collection Results:")
        print(f"   Success: {results.get('success', False)}")
        print(f"   Total Data Points: {results.get('total_data_points', 0)}")
        if results.get('forecast'):
            print(f"   Forecast: {results['forecast'].get('success', False)}")
        if results.get('realtime'):
            print(f"   Realtime: {results['realtime'].get('success', False)}")
        
        if 'message' in results:
            print(f"   Message: {results['message']}")
        
        if results.get('success'):
            print("✅ Collection completed successfully!")
        else:
            print("❌ Collection failed!")
            sys.exit(1)
    
    except Exception as e:
        print(f"❌ System error: {e}")
        sys.exit(1)
    
    finally:
        await system.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
