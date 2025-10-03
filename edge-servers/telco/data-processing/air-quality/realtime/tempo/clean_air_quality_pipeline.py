"""
Clean Air Quality Pipeline

Processes NO2 and O3 from TEMPO V4 files and PM2.5 from AirNOW.
Assumes V4 files contain data.
"""

import sys
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class CleanAirQualityPipeline:
    """
    Clean pipeline for real-time air quality monitoring.
    
    Combines:
    - NO2 and O3 from TEMPO V4 files
    - PM2.5 from AirNOW
    - Calculates AQI
    - Stores in database
    """
    
    def __init__(self):
        """Initialize the clean air quality pipeline."""
        # Setup logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.tempo_downloader = None
        self.tempo_processor = None
        self.airnow_downloader = None
        self.aqi_calculator = None
        self.database = None
        
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize all pipeline components."""
        try:
            from tempo_downloader import TempoDownloader
            from tempo_processor import TempoProcessor
            from airnow_downloader import AirNowDownloader
            from realtime_aqi_calculator import RealtimeAQICalculator
            from database import RealtimeDatabase
            
            self.tempo_downloader = TempoDownloader()
            self.tempo_processor = TempoProcessor()
            self.airnow_downloader = AirNowDownloader()
            self.aqi_calculator = RealtimeAQICalculator()
            self.database = RealtimeDatabase()
            
            self.logger.info("✓ All pipeline components initialized")
            
        except ImportError as e:
            self.logger.error(f"Failed to initialize components: {e}")
            raise
    
    def download_tempo_data(self) -> Dict:
        """
        Download latest TEMPO data (NO2 and O3).
        
        Returns:
            Download results
        """
        self.logger.info("Downloading TEMPO data...")
        
        try:
            results = self.tempo_downloader.download_latest_data(['no2', 'o3'])
            
            successful_downloads = [p for p, r in results.items() if r['success']]
            self.logger.info(f"✓ Downloaded {len(successful_downloads)} products: {successful_downloads}")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error downloading TEMPO data: {e}")
            return {}
    
    def process_tempo_data(self) -> Dict:
        """
        Process downloaded TEMPO files.
        
        Returns:
            Processing results
        """
        self.logger.info("Processing TEMPO data...")
        
        try:
            results = self.tempo_processor.process_all_files()
            
            self.logger.info(f"✓ Processed {results['total_data_points']} data points")
            self.logger.info(f"  NO2 points: {len(results['products']['no2'])}")
            self.logger.info(f"  O3 points: {len(results['products']['o3'])}")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error processing TEMPO data: {e}")
            return {"products": {"no2": [], "o3": []}, "total_data_points": 0}
    
    def get_airnow_data(self) -> List[Dict]:
        """
        Get AirNOW PM2.5 data.
        
        Returns:
            List of AirNOW data points
        """
        self.logger.info("Getting AirNOW data...")
        
        try:
            airnow_data = self.airnow_downloader.get_latest_data()
            
            if airnow_data:
                self.logger.info(f"✓ Retrieved {len(airnow_data)} AirNOW data points")
                return airnow_data
            else:
                self.logger.warning("No AirNOW data available")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting AirNOW data: {e}")
            return []
    
    def combine_data_sources(self, tempo_data: Dict, airnow_data: List[Dict]) -> List[Dict]:
        """
        Combine TEMPO and AirNOW data for AQI calculation.
        
        Args:
            tempo_data: Processed TEMPO data
            airnow_data: AirNOW data
            
        Returns:
            Combined data points
        """
        self.logger.info("Combining data sources...")
        
        combined_data = []
        
        # Get TEMPO data
        no2_data = tempo_data.get("products", {}).get("no2", [])
        o3_data = tempo_data.get("products", {}).get("o3", [])
        
        # Create combined data points
        # For simplicity, we'll create separate points for each data source
        # In a more sophisticated system, we'd match by location and time
        
        # Add NO2 data points
        for point in no2_data:
            combined_point = {
                "timestamp": point["timestamp"],
                "latitude": point["latitude"],
                "longitude": point["longitude"],
                "level": point["level"],
                "no2": point["value"],
                "o3": None,
                "pm25": None,
                "source": "TEMPO"
            }
            combined_data.append(combined_point)
        
        # Add O3 data points
        for point in o3_data:
            combined_point = {
                "timestamp": point["timestamp"],
                "latitude": point["latitude"],
                "longitude": point["longitude"],
                "level": point["level"],
                "no2": None,
                "o3": point["value"],
                "pm25": None,
                "source": "TEMPO"
            }
            combined_data.append(combined_point)
        
        # Add AirNOW data points
        for point in airnow_data:
            combined_point = {
                "timestamp": point.get("timestamp", datetime.now().isoformat()),
                "latitude": point.get("latitude", 0.0),
                "longitude": point.get("longitude", 0.0),
                "level": 0.0,
                "no2": None,
                "o3": None,
                "pm25": point.get("pm25"),
                "source": "AIRNOW"
            }
            combined_data.append(combined_point)
        
        self.logger.info(f"✓ Combined {len(combined_data)} data points")
        return combined_data
    
    def calculate_aqi(self, combined_data: List[Dict]) -> List[Dict]:
        """
        Calculate AQI for combined data points.
        
        Args:
            combined_data: Combined data points
            
        Returns:
            Data points with calculated AQI
        """
        self.logger.info("Calculating AQI...")
        
        aqi_data = []
        
        for data_point in combined_data:
            try:
                aqi_point = self.aqi_calculator.calculate_realtime_aqi(data_point)
                aqi_data.append(aqi_point)
            except Exception as e:
                self.logger.warning(f"Error calculating AQI for point: {e}")
                continue
        
        self.logger.info(f"✓ Calculated AQI for {len(aqi_data)} data points")
        return aqi_data
    
    async def store_in_database(self, aqi_data: List[Dict]) -> Dict:
        """
        Store AQI data in database.
        
        Args:
            aqi_data: Data points with AQI
            
        Returns:
            Storage results
        """
        self.logger.info("Storing data in database...")
        
        try:
            stored_count = 0
            errors = []
            
            for data_point in aqi_data:
                try:
                    success = await self.database.insert_realtime_data_point(data_point)
                    if success:
                        stored_count += 1
                    else:
                        errors.append(f"Failed to store data point")
                except Exception as e:
                    errors.append(f"Error storing data point: {e}")
            
            result = {
                "success": stored_count > 0,
                "stored_count": stored_count,
                "total_count": len(aqi_data),
                "errors": errors
            }
            
            if result["success"]:
                self.logger.info(f"✓ Stored {stored_count}/{len(aqi_data)} data points in database")
            else:
                self.logger.warning(f"⚠ No data points stored in database")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error storing data in database: {e}")
            return {"success": False, "stored_count": 0, "total_count": len(aqi_data), "errors": [str(e)]}
    
    async def run_pipeline(self) -> Dict:
        """
        Run the complete air quality pipeline.
        
        Returns:
            Pipeline results
        """
        self.logger.info("=" * 80)
        self.logger.info("RUNNING CLEAN AIR QUALITY PIPELINE")
        self.logger.info("=" * 80)
        
        results = {
            "start_time": datetime.now().isoformat(),
            "download_results": {},
            "processing_results": {},
            "airnow_data_count": 0,
            "combined_data_count": 0,
            "aqi_data_count": 0,
            "database_results": {},
            "success": False,
            "errors": []
        }
        
        try:
            # Step 1: Download TEMPO data
            self.logger.info("\nSTEP 1: Downloading TEMPO data")
            self.logger.info("-" * 50)
            
            download_results = self.download_tempo_data()
            results["download_results"] = download_results
            
            # Step 2: Process TEMPO data
            self.logger.info("\nSTEP 2: Processing TEMPO data")
            self.logger.info("-" * 50)
            
            processing_results = self.process_tempo_data()
            results["processing_results"] = processing_results
            
            # Step 3: Get AirNOW data
            self.logger.info("\nSTEP 3: Getting AirNOW data")
            self.logger.info("-" * 50)
            
            airnow_data = self.get_airnow_data()
            results["airnow_data_count"] = len(airnow_data)
            
            # Step 4: Combine data sources
            self.logger.info("\nSTEP 4: Combining data sources")
            self.logger.info("-" * 50)
            
            combined_data = self.combine_data_sources(processing_results, airnow_data)
            results["combined_data_count"] = len(combined_data)
            
            # Step 5: Calculate AQI
            self.logger.info("\nSTEP 5: Calculating AQI")
            self.logger.info("-" * 50)
            
            aqi_data = self.calculate_aqi(combined_data)
            results["aqi_data_count"] = len(aqi_data)
            
            # Step 6: Store in database
            self.logger.info("\nSTEP 6: Storing in database")
            self.logger.info("-" * 50)
            
            database_results = await self.store_in_database(aqi_data)
            results["database_results"] = database_results
            
            # Pipeline completed
            results["success"] = len(aqi_data) > 0
            results["end_time"] = datetime.now().isoformat()
            
            # Summary
            self.logger.info("\n" + "=" * 80)
            self.logger.info("PIPELINE SUMMARY")
            self.logger.info("=" * 80)
            self.logger.info(f"TEMPO data points: {processing_results['total_data_points']}")
            self.logger.info(f"AirNOW data points: {len(airnow_data)}")
            self.logger.info(f"Combined data points: {len(combined_data)}")
            self.logger.info(f"AQI data points: {len(aqi_data)}")
            self.logger.info(f"Database storage: {database_results['stored_count']}/{len(aqi_data)}")
            self.logger.info(f"Pipeline success: {'✓' if results['success'] else '✗'}")
            
            return results
            
        except Exception as e:
            error_msg = f"Pipeline failed: {e}"
            self.logger.error(error_msg)
            results["errors"].append(error_msg)
            results["end_time"] = datetime.now().isoformat()
            return results

async def main():
    """Run the clean air quality pipeline."""
    print("CLEAN AIR QUALITY PIPELINE")
    print("=" * 60)
    
    try:
        # Initialize pipeline
        pipeline = CleanAirQualityPipeline()
        print("✓ Pipeline initialized")
        
        # Run pipeline
        print(f"\nRunning pipeline...")
        results = await pipeline.run_pipeline()
        
        # Display results
        print(f"\nPipeline Results:")
        print(f"  Success: {'✓' if results['success'] else '✗'}")
        print(f"  TEMPO data points: {results['processing_results'].get('total_data_points', 0)}")
        print(f"  AirNOW data points: {results['airnow_data_count']}")
        print(f"  Combined data points: {results['combined_data_count']}")
        print(f"  AQI data points: {results['aqi_data_count']}")
        print(f"  Database storage: {results['database_results'].get('stored_count', 0)}")
        
        if results['errors']:
            print(f"  Errors:")
            for error in results['errors']:
                print(f"    - {error}")
        
        return results
        
    except Exception as e:
        print(f"✗ Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
