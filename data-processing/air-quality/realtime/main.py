"""
Realtime Air Quality Data Collection System
Handles GEOS-CF analysis data collection and processing
"""

import asyncio
import logging
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import Dict

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import realtime components
from smart_downloader import GeosCfAnalysisSmartDownloader
from data_processor import GeosCfAnalysisProcessor
from database import GeosCfAnalysisDatabase


class RealtimeAirQualitySystem:
    """
    Realtime air quality data collection system.
    
    Handles:
    - GEOS-CF analysis data collection (hourly)
    - AQI calculation and database storage
    - Error handling and logging
    """
    
    def __init__(self, sample_rate: int = 5):
        """Initialize the realtime system"""
        self.logger = self._setup_logging()
        # Get the directory where this script is located
        script_dir = Path(__file__).parent
        self.download_dir = script_dir / "downloads"
        self.download_dir.mkdir(exist_ok=True)
        self.sample_rate = sample_rate
        
        # Initialize components
        self.analysis_downloader = None
        self.analysis_processor = None
        self.analysis_database = None
        
        self.logger.info("📡 Realtime Air Quality System initialized")
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger("RealtimeAirQuality")
        logger.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Create console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # Create file handler
        file_handler = logging.FileHandler('realtime_air_quality.log')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        return logger
    
    async def initialize_components(self):
        """Initialize all system components"""
        try:
            # Initialize analysis components
            self.analysis_downloader = GeosCfAnalysisSmartDownloader(str(self.download_dir))
            self.analysis_processor = GeosCfAnalysisProcessor()
            self.analysis_database = GeosCfAnalysisDatabase()
            await self.analysis_database.connect()
            
            self.logger.info("✓ All realtime components initialized")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize realtime components: {e}")
            raise
    
    async def run_realtime_collection(self) -> Dict:
        """
        Run real-time data collection using GEOS-CF analysis data
        
        Returns:
            Dictionary with collection results
        """
        self.logger.info("📡 Starting real-time data collection...")
        
        try:
            # Download latest analysis data
            analysis_file = await self.analysis_downloader.download_latest_analysis()
            
            if not analysis_file:
                return {
                    "success": False,
                    "message": "Failed to download analysis data",
                    "data_points": 0
                }
            
            # Extract timestamp from the downloaded file to check for duplicates
            analysis_timestamp = self.analysis_processor._extract_timestamp_from_filename(analysis_file)
            
            self.logger.info(f"🔍 Checking for duplicate analysis data...")
            self.logger.info(f"   Analysis time: {analysis_timestamp} UTC")
            
            # Check if this specific analysis timestamp already exists
            already_exists = await self.analysis_database.check_analysis_exists(analysis_timestamp)
            
            if already_exists:
                self.logger.info(f"✓ This analysis data already exists in database, skipping")
                self.logger.info(f"   Analysis: {analysis_timestamp} UTC")
                
                # Clean up downloaded file
                try:
                    import os
                    if os.path.exists(analysis_file):
                        os.remove(analysis_file)
                        self.logger.info(f"🗑️ Cleaned up duplicate file: {os.path.basename(analysis_file)}")
                except Exception as e:
                    self.logger.warning(f"Could not clean up file {analysis_file}: {e}")
                
                return {
                    "success": True,
                    "message": "Analysis data already exists, skipped collection",
                    "data_points": 0
                }
            
            # Process analysis file
            data_points = self.analysis_processor.process_analysis_file(
                analysis_file, 
                sample_rate=self.sample_rate,  # Configurable sampling rate
                tempo_coverage_only=True  # TEMPO coverage area only
            )
            
            # Store in database
            if data_points:
                result = await self.analysis_database.insert_analysis_data_batch(data_points)
                
                if result["success"]:
                    # Cleanup downloaded file after successful processing
                    try:
                        import os
                        if os.path.exists(analysis_file):
                            os.remove(analysis_file)
                            self.logger.info(f"🗑️ Cleaned up downloaded file: {os.path.basename(analysis_file)}")
                    except Exception as e:
                        self.logger.warning(f"Could not clean up file {analysis_file}: {e}")
                    
                    self.logger.info(f"✓ Real-time collection complete: {result['inserted_count']} data points stored")
                    return {
                        "success": True,
                        "message": f"Real-time data collected and stored successfully",
                        "data_points": result["inserted_count"],
                        "file": analysis_file
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Failed to store data: {result.get('errors', [])}",
                        "data_points": 0
                    }
            else:
                return {
                    "success": False,
                    "message": "No data points extracted from analysis file",
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
        Run hourly data collection (analysis data only)
        
        Returns:
            Dictionary with collection results
        """
        self.logger.info("⏰ Starting hourly data collection...")
        
        try:
            # Run real-time collection
            result = await self.run_realtime_collection()
            return result
            # Run real-time collection
            result = await self.run_realtime_collection()
            return result
            
        except Exception as e:
            self.logger.error(f"Hourly collection failed: {e}")
            return {
                "success": False,
                "message": f"Hourly collection failed: {e}",
                "data_points": 0
            }
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            if self.analysis_database:
                await self.analysis_database.disconnect()
            self.logger.info("✓ Realtime cleanup complete")
        except Exception as e:
            self.logger.error(f"Realtime cleanup error: {e}")


async def main():
    """Main entry point for the realtime air quality system"""
    print("📡 Realtime Air Quality Data Collection System")
    print("=" * 50)
    
    system = RealtimeAirQualitySystem()
    
    try:
        await system.initialize_components()
        
        # Run realtime collection (default behavior)
        print("📡 Running realtime collection...")
        results = await system.run_realtime_collection()
        
        # Print results
        print("\n📊 Collection Results:")
        print(f"   Success: {results.get('success', False)}")
        print(f"   Data Points: {results.get('data_points', 0)}")
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
