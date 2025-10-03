"""
Main Real-Time Air Quality Pipeline

Integrates TEMPO data download, processing, and AQI calculation.
This is the main entry point for the real-time air quality system.
"""

import sys
import os
from datetime import datetime
from typing import Dict, List, Optional

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class RealtimeAirQualityPipeline:
    """
    Main pipeline for real-time air quality monitoring.
    
    Integrates:
    1. TEMPO satellite data download
    2. Data processing and unit conversion
    3. AQI calculation
    4. Database storage
    """
    
    def __init__(self):
        """Initialize the real-time air quality pipeline."""
        self.logger = None
        self._setup_logging()
        
        # Initialize components
        self.tempo_downloader = None
        self.tempo_processor = None
        self.aqi_calculator = None
        self.database = None
        
        self._initialize_components()
    
    def _setup_logging(self):
        """Setup logging for the pipeline."""
        import logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def _initialize_components(self):
        """Initialize all pipeline components."""
        try:
            from tempo_downloader import TempoDownloader
            from tempo_processor import TempoProcessor
            from realtime_aqi_calculator import RealtimeAQICalculator
            from database import RealtimeDatabase
            
            self.tempo_downloader = TempoDownloader()
            self.tempo_processor = TempoProcessor()
            self.aqi_calculator = RealtimeAQICalculator()
            self.database = RealtimeDatabase()
            
            self.logger.info("✓ All pipeline components initialized")
            
        except ImportError as e:
            self.logger.error(f"Failed to initialize components: {e}")
            raise
    
    def run_complete_pipeline(self, products: List[str] = None) -> Dict:
        """
        Run the complete real-time air quality pipeline.
        
        Args:
            products: List of products to process (default: ['no2', 'o3'])
            
        Returns:
            Dictionary with pipeline results
        """
        if products is None:
            products = ['no2', 'o3']
        
        self.logger.info("=" * 80)
        self.logger.info("STARTING REAL-TIME AIR QUALITY PIPELINE")
        self.logger.info("=" * 80)
        
        pipeline_results = {
            "start_time": datetime.now().isoformat(),
            "products": products,
            "download_results": {},
            "processing_results": {},
            "aqi_results": {},
            "database_results": {},
            "success": False,
            "errors": []
        }
        
        try:
            # Step 1: Download latest TEMPO data
            self.logger.info("\nSTEP 1: Downloading latest TEMPO data")
            self.logger.info("-" * 50)
            
            download_results = self.tempo_downloader.download_latest_data(products)
            pipeline_results["download_results"] = download_results
            
            successful_downloads = [p for p, r in download_results.items() if r['success']]
            if not successful_downloads:
                error_msg = "No files downloaded successfully"
                self.logger.error(error_msg)
                pipeline_results["errors"].append(error_msg)
                return pipeline_results
            
            self.logger.info(f"✓ Successfully downloaded {len(successful_downloads)} products: {successful_downloads}")
            
            # Step 2: Process downloaded files
            self.logger.info("\nSTEP 2: Processing downloaded files")
            self.logger.info("-" * 50)
            
            processing_results = self.tempo_processor.process_all_files()
            pipeline_results["processing_results"] = processing_results
            
            if processing_results["total_data_points"] == 0:
                error_msg = "No data points extracted from downloaded files"
                self.logger.error(error_msg)
                pipeline_results["errors"].append(error_msg)
                return pipeline_results
            
            self.logger.info(f"✓ Successfully processed {processing_results['total_data_points']} data points")
            
            # Step 3: Calculate AQI
            self.logger.info("\nSTEP 3: Calculating AQI")
            self.logger.info("-" * 50)
            
            # Prepare data for AQI calculation
            aqi_ready_data = self._prepare_aqi_data(processing_results)
            
            if not aqi_ready_data:
                error_msg = "No data prepared for AQI calculation"
                self.logger.error(error_msg)
                pipeline_results["errors"].append(error_msg)
                return pipeline_results
            
            # Calculate AQI for each data point
            aqi_results = []
            for data_point in aqi_ready_data:
                try:
                    aqi_point = self.aqi_calculator.calculate_realtime_aqi(data_point)
                    aqi_results.append(aqi_point)
                except Exception as e:
                    self.logger.warning(f"Failed to calculate AQI for point: {e}")
                    continue
            
            pipeline_results["aqi_results"] = {
                "total_points": len(aqi_results),
                "data_points": aqi_results
            }
            
            self.logger.info(f"✓ Successfully calculated AQI for {len(aqi_results)} data points")
            
            # Step 4: Store in database
            self.logger.info("\nSTEP 4: Storing data in database")
            self.logger.info("-" * 50)
            
            database_results = await self._store_in_database(aqi_results)
            pipeline_results["database_results"] = database_results
            
            if database_results["success"]:
                self.logger.info(f"✓ Successfully stored {database_results['stored_count']} data points in database")
            else:
                self.logger.warning(f"⚠ Database storage had issues: {database_results.get('errors', [])}")
            
            # Pipeline completed successfully
            pipeline_results["success"] = True
            pipeline_results["end_time"] = datetime.now().isoformat()
            
            self.logger.info("\n" + "=" * 80)
            self.logger.info("PIPELINE COMPLETED SUCCESSFULLY")
            self.logger.info("=" * 80)
            self.logger.info(f"Total data points processed: {len(aqi_results)}")
            self.logger.info(f"Database storage: {'Success' if database_results['success'] else 'Partial'}")
            
            return pipeline_results
            
        except Exception as e:
            error_msg = f"Pipeline failed: {e}"
            self.logger.error(error_msg)
            pipeline_results["errors"].append(error_msg)
            pipeline_results["end_time"] = datetime.now().isoformat()
            return pipeline_results
    
    def _prepare_aqi_data(self, processing_results: Dict) -> List[Dict]:
        """
        Prepare processed data for AQI calculation.
        
        Args:
            processing_results: Results from tempo_processor
            
        Returns:
            List of data points ready for AQI calculation
        """
        aqi_ready_data = []
        
        # Combine NO2 and O3 data
        no2_data = processing_results["products"]["no2"]
        o3_data = processing_results["products"]["o3"]
        
        # Create combined data points
        # For now, we'll create separate points for each pollutant
        # In a more sophisticated system, we'd match by location and time
        
        for point in no2_data:
            aqi_point = {
                "timestamp": point["timestamp"],
                "latitude": point["latitude"],
                "longitude": point["longitude"],
                "level": point["level"],
                "no2": point["value"],
                "o3": None,  # Will be filled if we have O3 data
                "pm25": None,  # Will be filled from AirNOW
                "source": "TEMPO"
            }
            aqi_ready_data.append(aqi_point)
        
        for point in o3_data:
            aqi_point = {
                "timestamp": point["timestamp"],
                "latitude": point["latitude"],
                "longitude": point["longitude"],
                "level": point["level"],
                "no2": None,  # Will be filled if we have NO2 data
                "o3": point["value"],
                "pm25": None,  # Will be filled from AirNOW
                "source": "TEMPO"
            }
            aqi_ready_data.append(aqi_point)
        
        return aqi_ready_data
    
    async def _store_in_database(self, aqi_data: List[Dict]) -> Dict:
        """
        Store AQI data in the database.
        
        Args:
            aqi_data: List of AQI data points
            
        Returns:
            Dictionary with storage results
        """
        try:
            stored_count = 0
            errors = []
            
            for data_point in aqi_data:
                try:
                    success = await self.database.insert_realtime_data_point(data_point)
                    if success:
                        stored_count += 1
                    else:
                        errors.append(f"Failed to store data point at {data_point['latitude']}, {data_point['longitude']}")
                except Exception as e:
                    errors.append(f"Error storing data point: {e}")
            
            return {
                "success": stored_count > 0,
                "stored_count": stored_count,
                "total_count": len(aqi_data),
                "errors": errors
            }
            
        except Exception as e:
            return {
                "success": False,
                "stored_count": 0,
                "total_count": len(aqi_data),
                "errors": [str(e)]
            }

async def main():
    """Main function to run the real-time air quality pipeline."""
    print("REAL-TIME AIR QUALITY PIPELINE")
    print("=" * 60)
    
    try:
        # Initialize pipeline
        pipeline = RealtimeAirQualityPipeline()
        print("✓ Pipeline initialized")
        
        # Run complete pipeline
        print(f"\nRunning complete pipeline...")
        results = pipeline.run_complete_pipeline(['no2', 'o3'])
        
        # Display results
        print(f"\nPipeline Results:")
        print(f"  Success: {'✓' if results['success'] else '✗'}")
        print(f"  Start time: {results['start_time']}")
        print(f"  End time: {results.get('end_time', 'Not completed')}")
        
        if results['download_results']:
            print(f"  Downloads:")
            for product, result in results['download_results'].items():
                status = "✓" if result['success'] else "✗"
                print(f"    {product.upper()}: {status}")
        
        if results['processing_results']:
            proc_results = results['processing_results']
            print(f"  Processing:")
            print(f"    Total data points: {proc_results['total_data_points']}")
            print(f"    NO2 points: {len(proc_results['products']['no2'])}")
            print(f"    O3 points: {len(proc_results['products']['o3'])}")
        
        if results['aqi_results']:
            aqi_results = results['aqi_results']
            print(f"  AQI calculation:")
            print(f"    Points calculated: {aqi_results['total_points']}")
        
        if results['database_results']:
            db_results = results['database_results']
            print(f"  Database storage:")
            print(f"    Stored: {db_results['stored_count']}/{db_results['total_count']}")
        
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
