"""
Hourly Air Quality System

Downloads latest TEMPO V4 data hourly, merges with AirNOW data,
calculates AQI, and stores NO2, O3, PM2.5, and AQI in database.
"""

import sys
import os
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class HourlyAirQualitySystem:
    """
    Hourly air quality monitoring system.
    
    Workflow:
    1. Download latest TEMPO V4 data (NO2, O3)
    2. Process NetCDF files to extract measurements
    3. Get AirNOW PM2.5 data
    4. Merge satellite and ground data
    5. Calculate AQI
    6. Store in database
    """
    
    def __init__(self, download_dir: str = "downloads"):
        """Initialize the hourly air quality system."""
        # Setup logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.download_dir = Path(download_dir)
        self.tempo_downloader = None
        self.tempo_processor = None
        self.airnow_downloader = None
        self.aqi_calculator = None
        self.database = None
        
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize all system components."""
        try:
            from tempo_downloader import TempoDownloader
            from tempo_processor import TempoProcessor
            from airnow_downloader import AirNowDownloader
            from shared.calculator import AQICalculator
            from database import TempoDatabase
            
            self.tempo_downloader = TempoDownloader(str(self.download_dir))
            self.tempo_processor = TempoProcessor()
            self.airnow_downloader = AirNowDownloader()
            self.aqi_calculator = AQICalculator()
            self.database = TempoDatabase()
            
            self.logger.info("✓ All system components initialized")
            
        except ImportError as e:
            self.logger.error(f"Failed to initialize components: {e}")
            raise
    
    def download_latest_tempo_data(self) -> Dict:
        """
        Download latest TEMPO V4 data for NO2 and O3.
        
        Returns:
            Download results
        """
        self.logger.info("Downloading latest TEMPO V4 data...")
        
        try:
            # Download latest data for both products
            results = self.tempo_downloader.download_latest_data(['no2', 'o3'])
            
            successful_downloads = []
            for product, result in results.items():
                if result.get('success', False):
                    successful_downloads.append(product)
                    self.logger.info(f"✓ Downloaded {product.upper()}: {result.get('file_path', 'Unknown')}")
                else:
                    self.logger.warning(f"✗ Failed to download {product.upper()}: {result.get('error', 'Unknown error')}")
            
            self.logger.info(f"Successfully downloaded {len(successful_downloads)} products: {successful_downloads}")
            return results
            
        except Exception as e:
            self.logger.error(f"Error downloading TEMPO data: {e}")
            return {}
    
    def process_tempo_data(self) -> Dict:
        """
        Process downloaded TEMPO NetCDF files.
        
        Returns:
            Processing results
        """
        self.logger.info("Processing TEMPO NetCDF files...")
        
        try:
            results = self.tempo_processor.process_all_files(str(self.download_dir))
            
            self.logger.info(f"✓ Processed {results['files_processed']} files")
            self.logger.info(f"  NO2 measurements: {len(results['products']['no2'])}")
            self.logger.info(f"  O3 measurements: {len(results['products']['o3'])}")
            self.logger.info(f"  Total data points: {results['total_data_points']}")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error processing TEMPO data: {e}")
            return {"products": {"no2": [], "o3": []}, "total_data_points": 0}
    
    def get_airnow_data(self) -> List[Dict]:
        """
        Get latest AirNOW PM2.5 data.
        
        Returns:
            List of AirNOW data points
        """
        self.logger.info("Getting AirNOW PM2.5 data...")
        
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
    
    def merge_data_sources(self, tempo_data: Dict, airnow_data: List[Dict]) -> List[Dict]:
        """
        Merge TEMPO satellite data with AirNOW ground data.
        
        Args:
            tempo_data: Processed TEMPO data
            airnow_data: AirNOW data
            
        Returns:
            Merged data points
        """
        self.logger.info("Merging TEMPO and AirNOW data...")
        
        merged_data = []
        
        # Get TEMPO measurements
        no2_measurements = tempo_data.get("products", {}).get("no2", [])
        o3_measurements = tempo_data.get("products", {}).get("o3", [])
        
        # Create a simple merge strategy:
        # For each TEMPO measurement, try to find nearby AirNOW data
        # For now, we'll create separate records and let the AQI calculator handle combination
        
        # Add NO2 measurements
        for measurement in no2_measurements:
            merged_point = {
                "timestamp": measurement.timestamp,
                "latitude": measurement.latitude,
                "longitude": measurement.longitude,
                "level": measurement.level,
                "no2": measurement.value,
                "o3": None,
                "pm25": None,
                "source": "TEMPO"
            }
            merged_data.append(merged_point)
        
        # Add O3 measurements
        for measurement in o3_measurements:
            merged_point = {
                "timestamp": measurement.timestamp,
                "latitude": measurement.latitude,
                "longitude": measurement.longitude,
                "level": measurement.level,
                "no2": None,
                "o3": measurement.value,
                "pm25": None,
                "source": "TEMPO"
            }
            merged_data.append(merged_point)
        
        # Add AirNOW measurements
        for measurement in airnow_data:
            merged_point = {
                "timestamp": measurement.get("timestamp", datetime.now().isoformat()),
                "latitude": measurement.get("latitude", 0.0),
                "longitude": measurement.get("longitude", 0.0),
                "level": 0.0,
                "no2": None,
                "o3": None,
                "pm25": measurement.get("pm25"),
                "source": "AIRNOW"
            }
            merged_data.append(merged_point)
        
        self.logger.info(f"✓ Merged {len(merged_data)} data points")
        self.logger.info(f"  TEMPO points: {len(no2_measurements) + len(o3_measurements)}")
        self.logger.info(f"  AirNOW points: {len(airnow_data)}")
        
        return merged_data
    
    def calculate_aqi(self, merged_data: List[Dict]) -> List[Dict]:
        """
        Calculate AQI for merged data points.
        
        Args:
            merged_data: Merged data points
            
        Returns:
            Data points with calculated AQI
        """
        self.logger.info("Calculating AQI...")
        
        aqi_data = []
        
        for data_point in merged_data:
            try:
                # Prepare pollutants for AQI calculation
                pollutants = {}
                if data_point.get('pm25') is not None:
                    pollutants['pm25'] = data_point['pm25']
                if data_point.get('no2') is not None:
                    pollutants['no2'] = data_point['no2']
                if data_point.get('o3') is not None:
                    pollutants['o3'] = data_point['o3']
                if data_point.get('so2') is not None:
                    pollutants['so2'] = data_point['so2']
                if data_point.get('co') is not None:
                    pollutants['co'] = data_point['co']
                
                # Calculate AQI if we have pollutants
                if pollutants:
                    individual_aqis = self.aqi_calculator.calculate_all_aqi(pollutants)
                    overall_aqi, primary_pollutant = self.aqi_calculator.get_overall_aqi(individual_aqis)
                    
                    # Add AQI to data point
                    data_point['aqi'] = overall_aqi
                    data_point['primary_pollutant'] = primary_pollutant
                else:
                    data_point['aqi'] = None
                    data_point['primary_pollutant'] = None
                
                aqi_data.append(data_point)
                
            except Exception as e:
                self.logger.warning(f"Error calculating AQI for point: {e}")
                data_point['aqi'] = None
                data_point['primary_pollutant'] = None
                aqi_data.append(data_point)
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
                    # Convert dict to RealtimeDataPoint format for database
                    from database import RealtimeDataPoint
                    
                    realtime_point = RealtimeDataPoint(
                        timestamp=data_point.get('timestamp', datetime.now()),
                        latitude=data_point.get('latitude', 0.0),
                        longitude=data_point.get('longitude', 0.0),
                        level=data_point.get('level', 0.0),
                        pm25=data_point.get('pm25'),
                        no2=data_point.get('no2'),
                        o3=data_point.get('o3'),
                        so2=data_point.get('so2'),
                        co=data_point.get('co'),
                        aqi=data_point.get('aqi'),
                        source=data_point.get('source', 'REALTIME')
                    )
                    
                    success = await self.database.insert_realtime_data_point(realtime_point)
                    if success:
                        stored_count += 1
                    else:
                        errors.append("Failed to store data point")
                        
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
    
    async def run_hourly_cycle(self) -> Dict:
        """
        Run one complete hourly cycle.
        
        Returns:
            Cycle results
        """
        self.logger.info("=" * 80)
        self.logger.info("STARTING HOURLY AIR QUALITY CYCLE")
        self.logger.info("=" * 80)
        
        cycle_results = {
            "start_time": datetime.now().isoformat(),
            "download_results": {},
            "processing_results": {},
            "airnow_data_count": 0,
            "merged_data_count": 0,
            "aqi_data_count": 0,
            "database_results": {},
            "success": False,
            "errors": []
        }
        
        try:
            # Step 1: Download latest TEMPO V4 data
            self.logger.info("\nSTEP 1: Downloading latest TEMPO V4 data")
            self.logger.info("-" * 50)
            
            download_results = self.download_latest_tempo_data()
            cycle_results["download_results"] = download_results
            
            # Step 2: Process TEMPO NetCDF files
            self.logger.info("\nSTEP 2: Processing TEMPO NetCDF files")
            self.logger.info("-" * 50)
            
            processing_results = self.process_tempo_data()
            cycle_results["processing_results"] = processing_results
            
            # Step 3: Get AirNOW PM2.5 data
            self.logger.info("\nSTEP 3: Getting AirNOW PM2.5 data")
            self.logger.info("-" * 50)
            
            airnow_data = self.get_airnow_data()
            cycle_results["airnow_data_count"] = len(airnow_data)
            
            # Step 4: Merge data sources
            self.logger.info("\nSTEP 4: Merging TEMPO and AirNOW data")
            self.logger.info("-" * 50)
            
            merged_data = self.merge_data_sources(processing_results, airnow_data)
            cycle_results["merged_data_count"] = len(merged_data)
            
            # Step 5: Calculate AQI
            self.logger.info("\nSTEP 5: Calculating AQI")
            self.logger.info("-" * 50)
            
            aqi_data = self.calculate_aqi(merged_data)
            cycle_results["aqi_data_count"] = len(aqi_data)
            
            # Step 6: Store in database
            self.logger.info("\nSTEP 6: Storing in database")
            self.logger.info("-" * 50)
            
            database_results = await self.store_in_database(aqi_data)
            cycle_results["database_results"] = database_results
            
            # Cycle completed
            cycle_results["success"] = len(aqi_data) > 0
            cycle_results["end_time"] = datetime.now().isoformat()
            
            # Summary
            self.logger.info("\n" + "=" * 80)
            self.logger.info("HOURLY CYCLE SUMMARY")
            self.logger.info("=" * 80)
            self.logger.info(f"TEMPO data points: {processing_results['total_data_points']}")
            self.logger.info(f"AirNOW data points: {len(airnow_data)}")
            self.logger.info(f"Merged data points: {len(merged_data)}")
            self.logger.info(f"AQI data points: {len(aqi_data)}")
            self.logger.info(f"Database storage: {database_results['stored_count']}/{len(aqi_data)}")
            self.logger.info(f"Cycle success: {'✓' if cycle_results['success'] else '✗'}")
            
            return cycle_results
            
        except Exception as e:
            error_msg = f"Hourly cycle failed: {e}"
            self.logger.error(error_msg)
            cycle_results["errors"].append(error_msg)
            cycle_results["end_time"] = datetime.now().isoformat()
            return cycle_results
    
    async def run_continuous(self, interval_hours: int = 1):
        """
        Run the system continuously with specified interval.
        
        Args:
            interval_hours: Hours between cycles
        """
        self.logger.info(f"Starting continuous hourly air quality monitoring (interval: {interval_hours}h)")
        
        while True:
            try:
                # Run one cycle
                results = await self.run_hourly_cycle()
                
                # Log results
                if results["success"]:
                    self.logger.info(f"✓ Cycle completed successfully")
                else:
                    self.logger.warning(f"⚠ Cycle completed with issues")
                
                # Wait for next cycle
                next_run = datetime.now() + timedelta(hours=interval_hours)
                self.logger.info(f"Next cycle scheduled for: {next_run}")
                
                await asyncio.sleep(interval_hours * 3600)  # Convert hours to seconds
                
            except KeyboardInterrupt:
                self.logger.info("Stopping continuous monitoring...")
                break
            except Exception as e:
                self.logger.error(f"Error in continuous monitoring: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes before retrying

async def main():
    """Run the hourly air quality system."""
    print("HOURLY AIR QUALITY SYSTEM")
    print("=" * 60)
    
    try:
        # Initialize system
        system = HourlyAirQualitySystem()
        print("✓ System initialized")
        
        # Run one cycle
        print(f"\nRunning hourly cycle...")
        results = await system.run_hourly_cycle()
        
        # Display results
        print(f"\nCycle Results:")
        print(f"  Success: {'✓' if results['success'] else '✗'}")
        print(f"  TEMPO data points: {results['processing_results'].get('total_data_points', 0)}")
        print(f"  AirNOW data points: {results['airnow_data_count']}")
        print(f"  Merged data points: {results['merged_data_count']}")
        print(f"  AQI data points: {results['aqi_data_count']}")
        print(f"  Database storage: {results['database_results'].get('stored_count', 0)}")
        
        if results['errors']:
            print(f"  Errors:")
            for error in results['errors']:
                print(f"    - {error}")
        
        return results
        
    except Exception as e:
        print(f"✗ System failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    asyncio.run(main())
