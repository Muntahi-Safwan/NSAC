#!/usr/bin/env python3
"""
Main Air Quality Data Pipeline
Downloads, processes, and stores GEOS-CF air quality forecast data
Designed to run hourly as a scheduled task
"""

import asyncio
import sys
import os
from datetime import datetime
from typing import Optional
import argparse

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from smart_downloader import SmartForecastDownloader
from data_processor import NetCDFProcessor, AirQualityDataPoint
from database import AirQualityDatabase


class AirQualityPipeline:
    """
    Main orchestrator for the air quality data pipeline
    Coordinates downloading, processing, and storing data
    """
    
    def __init__(self, download_dir: str = "./downloads", 
                 sample_rate: int = 10,
                 batch_size: int = 1000):
        """
        Initialize the pipeline
        
        Args:
            download_dir: Directory to save downloaded files
            sample_rate: Sample every Nth data point (1=all, 10=10%, 20=5%)
            batch_size: Database insertion batch size
        """
        self.downloader = SmartForecastDownloader(save_dir=download_dir)
        self.download_dir = download_dir
        self.sample_rate = sample_rate
        self.batch_size = batch_size
        
        print(f"""
╔══════════════════════════════════════════════════════════════════╗
║         GEOS-CF Air Quality Data Pipeline v1.0                   ║
║         PostgreSQL + PostGIS + TimescaleDB                       ║
╚══════════════════════════════════════════════════════════════════╝
        """)
    
    def download_latest_forecast(self, target_time: Optional[datetime] = None) -> Optional[str]:
        """
        Download the 24-hour forecast file for current time (or specified time)
        
        Args:
            target_time: Target time (defaults to current UTC time)
        
        Returns:
            Path to downloaded file or None if failed
        """
        print(f"\n{'='*70}")
        print(f"STEP 1: DOWNLOADING FORECAST DATA")
        print(f"{'='*70}\n")
        
        file_path = self.downloader.download_24h_forecast(target_time)
        
        if file_path:
            print(f"\n✅ Download successful: {file_path}")
        else:
            print(f"\n❌ Download failed")
        
        return file_path
    
    def process_netcdf_file(self, file_path: str) -> list[AirQualityDataPoint]:
        """
        Process NetCDF file and extract air quality data
        
        Args:
            file_path: Path to NetCDF file
        
        Returns:
            List of AirQualityDataPoint objects
        """
        print(f"\n{'='*70}")
        print(f"STEP 2: PROCESSING NETCDF DATA")
        print(f"{'='*70}\n")
        
        with NetCDFProcessor(file_path) as processor:
            # Get summary stats
            stats = processor.get_summary_stats()
            print(f"\n📊 Dataset Statistics:")
            print(f"   Shape: {stats['shape']}")
            print(f"   PM2.5 Range: [{stats['min']:.4f}, {stats['max']:.4f}] μg/m³")
            print(f"   Mean: {stats['mean']:.4f}, Median: {stats['median']:.4f}")
            print(f"   Total points: {stats['total_points']:,}")
            print(f"   Valid points: {stats['valid_points']:,}")
            
            # Extract data (multiple pollutants, TEMPO coverage area only)
            data_points = processor.extract_air_quality_data(
                sample_rate=self.sample_rate,
                tempo_coverage_only=True  # Filter to North America/TEMPO coverage
            )
        
        print(f"\n✅ Extracted {len(data_points):,} data points")
        return data_points
    
    async def store_data(self, data_points: list[AirQualityDataPoint]) -> int:
        """
        Store data points in PostgreSQL database
        
        Args:
            data_points: List of AirQualityDataPoint objects
        
        Returns:
            Number of records inserted
        """
        print(f"\n{'='*70}")
        print(f"STEP 3: STORING DATA IN DATABASE")
        print(f"{'='*70}\n")
        
        # Convert to dictionaries
        data_dicts = [point.to_dict() for point in data_points]
        
        # Store in database
        async with AirQualityDatabase() as db:
            inserted_count = await db.insert_batch(data_dicts, batch_size=self.batch_size)
            
            # Show updated statistics
            stats = await db.get_statistics()
            print(f"\n📊 Database Statistics (After Insert):")
            print(f"   Total records: {stats['total_records']:,}")
            print(f"   Date range: {stats['oldest_record']} to {stats['newest_record']}")
        
        return inserted_count
    
    async def run(self, target_time: Optional[datetime] = None, 
                  skip_download: bool = False,
                  file_path: Optional[str] = None) -> bool:
        """
        Run the complete pipeline
        
        Args:
            target_time: Target time for forecast (defaults to current UTC)
            skip_download: Skip download step (use existing file)
            file_path: Specific file to process (skips download)
        
        Returns:
            True if successful, False otherwise
        """
        start_time = datetime.utcnow()
        print(f"Pipeline started at: {start_time} UTC")
        
        try:
            # Step 1: Download (unless skipped)
            if file_path:
                print(f"\n📁 Using specified file: {file_path}")
                downloaded_file = file_path
            elif skip_download:
                print(f"\n⏭️ Skipping download step")
                # Find most recent file in download directory
                import glob
                import os
                files = glob.glob(f"{self.download_dir}/*.nc4")
                if not files:
                    print(f"❌ No .nc4 files found in {self.download_dir}")
                    return False
                downloaded_file = max(files, key=os.path.getctime)
                print(f"📁 Using most recent file: {downloaded_file}")
            else:
                downloaded_file = self.download_latest_forecast(target_time)
                if not downloaded_file:
                    return False
            
            # Step 2: Process
            data_points = self.process_netcdf_file(downloaded_file)
            
            if not data_points:
                print(f"❌ No data points extracted")
                return False
            
            # Step 3: Store
            inserted = await self.store_data(data_points)
            
            # Summary
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            print(f"\n{'='*70}")
            print(f"✅ PIPELINE COMPLETED SUCCESSFULLY")
            print(f"{'='*70}")
            print(f"   Start time: {start_time} UTC")
            print(f"   End time: {end_time} UTC")
            print(f"   Duration: {duration:.2f} seconds")
            print(f"   Records processed: {len(data_points):,}")
            print(f"   Records inserted: {inserted:,}")
            print(f"{'='*70}\n")
            
            return True
            
        except Exception as e:
            print(f"\n❌ PIPELINE FAILED: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Main entry point with CLI argument parsing"""
    parser = argparse.ArgumentParser(
        description='GEOS-CF Air Quality Data Pipeline - Download, Process, Store',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run full pipeline (download latest + process + store)
  python main_pipeline.py
  
  # Run with specific sample rate (lower = more data)
  python main_pipeline.py --sample-rate 5
  
  # Process existing file without downloading
  python main_pipeline.py --file path/to/file.nc4
  
  # Skip download and use most recent file
  python main_pipeline.py --skip-download
        """
    )
    
    parser.add_argument('--sample-rate', type=int, default=10,
                        help='Sample every Nth data point (default: 10, use 1 for all data)')
    parser.add_argument('--batch-size', type=int, default=1000,
                        help='Database insertion batch size (default: 1000)')
    parser.add_argument('--download-dir', type=str, default='./downloads',
                        help='Directory for downloaded files (default: ./downloads)')
    parser.add_argument('--skip-download', action='store_true',
                        help='Skip download and use most recent file')
    parser.add_argument('--file', type=str,
                        help='Process specific file (skips download)')
    
    args = parser.parse_args()
    
    # Create and run pipeline
    pipeline = AirQualityPipeline(
        download_dir=args.download_dir,
        sample_rate=args.sample_rate,
        batch_size=args.batch_size
    )
    
    # Run async pipeline
    success = asyncio.run(pipeline.run(
        skip_download=args.skip_download,
        file_path=args.file
    ))
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

