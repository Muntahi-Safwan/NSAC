"""
Main Heatwave Prediction Pipeline
Orchestrates the complete heatwave prediction system:
1. Downloads 5 days of hourly meteorological files (120 hours total)
2. Processes them to extract temperature and humidity data
3. Stores meteorological data in real-time
4. Performs advanced heatwave detection and analysis
5. Generates and stores daily heatwave alerts for all 5 forecast days
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta, date
from typing import List, Optional, Dict, Tuple
import argparse
from pathlib import Path

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from smart_downloader import MeteorologicalDataDownloader
from meteorological_processor import MeteorologicalProcessor, HourlyMetData, DailyHeatwaveData
from database import SimplifiedHeatwaveDatabase, HeatwaveAlert, MeteorologicalData
from heatwave_calculator import HeatwaveCalculator


class HeatwavePredictionPipeline:
    """
    Main orchestrator for heatwave prediction system
    Handles both daily predictions and hourly health alerts
    """
    
    def __init__(self, sample_rate: int = 5):
        self.sample_rate = sample_rate
        self.downloader = MeteorologicalDataDownloader()  # Single-threaded, VPS-friendly
        self.processor = MeteorologicalProcessor()
        self.heatwave_calculator = HeatwaveCalculator()
        
        print(f"🌡️ Heatwave Prediction Pipeline initialized")
        print(f"   Sample rate: {sample_rate}")
        print(f"   Coverage: TEMPO area (North America)")
        print(f"   Forecast period: 5 days (120 hours)")
        print(f"   Real-time processing: Download → Process → Store → Detect")
    
    async def download_24h_met_data(self, target_date: Optional[date] = None) -> Optional[List[str]]:
        """
        Download 24 hours of meteorological data
        
        Args:
            target_date: Date to download data for (defaults to tomorrow)
            
        Returns:
            List of downloaded file paths or None if failed
        """
        if target_date is None:
            # Default to tomorrow for heatwave prediction
            target_date = date.today() + timedelta(days=1)
        
        print(f"\n{'='*70}")
        print(f"STEP 1: DOWNLOADING METEOROLOGICAL DATA")
        print(f"{'='*70}")
        
        files = self.downloader.download_24h_batch(target_date)
        
        if files:
            print(f"✅ Downloaded {len(files)} meteorological files")
        else:
            print(f"❌ Failed to download meteorological data")
        
        return files
    
    def process_hourly_files(self, file_paths: List[str]) -> List[HourlyMetData]:
        """
        Process all hourly meteorological files
        
        Args:
            file_paths: List of paths to NetCDF files
            
        Returns:
            List of all hourly meteorological data points
        """
        print(f"\n{'='*70}")
        print(f"STEP 2: PROCESSING METEOROLOGICAL FILES")
        print(f"{'='*70}")
        
        all_hourly_data = []
        
        for i, file_path in enumerate(file_paths, 1):
            print(f"\n[{i}/{len(file_paths)}] Processing {os.path.basename(file_path)}:")
            
            try:
                hourly_data = self.processor.process_hourly_file(file_path, self.sample_rate)
                all_hourly_data.extend(hourly_data)
                print(f"   ✅ Added {len(hourly_data):,} data points")
                
            except Exception as e:
                print(f"   ❌ Error processing file: {e}")
                continue
        
        print(f"\n📊 Processing Summary:")
        print(f"   Files processed: {len(file_paths)}")
        print(f"   Total hourly data points: {len(all_hourly_data):,}")
        
        return all_hourly_data
    
    def create_daily_predictions(self, hourly_data: List[HourlyMetData]) -> List[DailyHeatwaveData]:
        """
        Aggregate hourly data into daily heatwave predictions
        
        Args:
            hourly_data: List of hourly meteorological data
            
        Returns:
            List of daily heatwave predictions
        """
        print(f"\n{'='*70}")
        print(f"STEP 3: CREATING DAILY HEATWAVE PREDICTIONS")
        print(f"{'='*70}")
        
        daily_predictions = self.processor.aggregate_daily_data(hourly_data)
        
        print(f"📊 Daily Prediction Summary:")
        print(f"   Daily predictions created: {len(daily_predictions):,}")
        
        if daily_predictions:
            # Show risk level distribution
            risk_counts = {}
            for pred in daily_predictions:
                risk_level = pred.heatwave_risk_level
                risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
            
            print(f"   Risk level distribution:")
            risk_names = {0: "No Risk", 1: "Low Risk", 2: "Moderate Risk", 3: "High Risk", 4: "Extreme Risk"}
            for level in sorted(risk_counts.keys()):
                count = risk_counts[level]
                percentage = (count / len(daily_predictions)) * 100
                print(f"     Level {level} ({risk_names[level]}): {count:,} locations ({percentage:.1f}%)")
        
        return daily_predictions
    
    
    def create_heatwave_alerts(self, hourly_data: List[HourlyMetData], forecast_time: datetime, target_date: date) -> List[HeatwaveAlert]:
        """
        Create daily heatwave alerts from hourly meteorological data
        
        Args:
            hourly_data: List of hourly meteorological data
            forecast_time: Forecast initialization time
            target_date: Date for the alerts
            
        Returns:
            List of heatwave alerts
        """
        print(f"📊 Creating heatwave alerts for {target_date}")
        
        # Group data by location
        location_data = {}
        for data in hourly_data:
            key = (data.latitude, data.longitude)
            if key not in location_data:
                location_data[key] = []
            location_data[key].append(data)
        
        alerts = []
        for (lat, lon), daily_data in location_data.items():
            if not daily_data:
                continue
            
            # Calculate daily temperature statistics
            temperatures = [d.temperature for d in daily_data]
            heat_indices = [d.heat_index for d in daily_data]
            
            max_temp = max(temperatures)
            min_temp = min(temperatures)
            max_heat_index = max(heat_indices)
            
            # Determine alert level based on temperature and heat index
            alert_level = 0
            alert_message = "No heat risk"
            
            if max_heat_index >= 54:  # 130°F - Emergency
                alert_level = 3
                alert_message = "EMERGENCY: Extreme heat danger - seek immediate shelter"
            elif max_heat_index >= 46:  # 115°F - Warning
                alert_level = 2
                alert_message = "WARNING: Dangerous heat conditions - avoid outdoor activities"
            elif max_heat_index >= 40:  # 104°F - Watch
                alert_level = 1
                alert_message = "WATCH: Hot conditions - limit outdoor exposure"
            elif max_temp >= 35:  # 95°F - Basic heat advisory
                alert_level = 1
                alert_message = "ADVISORY: Hot weather - stay hydrated"
            
            # Create alert
            alert = HeatwaveAlert(
                latitude=lat,
                longitude=lon,
                alert_date=target_date,
                forecast_init_time=forecast_time,
                max_temperature=max_temp,
                min_temperature=min_temp,
                max_heat_index=max_heat_index,
                alert_level=alert_level,
                alert_message=alert_message
            )
            alerts.append(alert)
        
        # Show alert level distribution
        alert_counts = {}
        for alert in alerts:
            level = alert.alert_level
            alert_counts[level] = alert_counts.get(level, 0) + 1
        
        print(f"   Alert distribution:")
        level_names = {0: "No Risk", 1: "Watch/Advisory", 2: "Warning", 3: "Emergency"}
        for level in sorted(alert_counts.keys()):
            count = alert_counts[level]
            percentage = (count / len(alerts)) * 100 if alerts else 0
            print(f"     Level {level} ({level_names[level]}): {count:,} locations ({percentage:.1f}%)")
        
        return alerts
    
    
    def cleanup_files(self, file_paths: List[str]):
        """Clean up downloaded files after processing"""
        print(f"\n🗑️ Cleaning up downloaded files...")
        
        cleaned = 0
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    cleaned += 1
            except Exception as e:
                print(f"⚠️ Could not clean up {file_path}: {e}")
        
        print(f"   Cleaned up {cleaned}/{len(file_paths)} files")
    
    async def find_latest_available_forecast(self) -> Optional[Tuple[datetime, date]]:
        """
        Automatically find the latest available forecast data
        Searches backwards from today: D02 → D01 → previous month's last day, etc.
        
        Returns:
            Tuple of (forecast_init_time, target_date) or None if nothing found
        """
        print(f"🔍 SEARCHING FOR LATEST AVAILABLE FORECAST")
        print(f"{'='*50}")
        
        current_date = date.today()
        
        # Search strategy: Go backwards from today up to 30 days
        for days_back in range(30):
            search_date = current_date - timedelta(days=days_back)
            print(f"📅 Checking date: {search_date}")
            
            # Try both 12z and 00z forecasts for this date
            for use_12z in [True, False]:
                forecast_hour = "12z" if use_12z else "00z"
                
                # Try different forecast initialization times for this date
                for init_days_back in range(5):  # Look back up to 5 days for forecast init
                    try:
                        forecast_init_time = self.downloader.get_forecast_init_time(init_days_back, use_12z)
                        
                        # Generate URLs for the search date
                        urls = self.downloader.generate_hourly_file_urls(forecast_init_time, search_date)
                        
                        if urls:
                            # Test if the first file exists
                            test_url = urls[0][0]
                            if self.downloader.check_url_exists(test_url):
                                print(f"✅ Found available forecast!")
                                print(f"   Forecast init: {forecast_init_time} UTC ({forecast_hour})")
                                print(f"   Target date: {search_date}")
                                print(f"   Available files: {len(urls)}")
                                return forecast_init_time, search_date
                            else:
                                print(f"   ❌ {forecast_hour} forecast not available")
                    except Exception as e:
                        print(f"   ⚠️ Error checking {forecast_hour}: {e}")
                        continue
        
        print(f"❌ No available forecasts found in the last 30 days")
        return None

    async def run_sequential_pipeline(self, target_date: Optional[date] = None) -> Dict:
        """
        Run the heatwave pipeline with sequential processing:
        Download → Process → Store → Delete each file individually
        
        Args:
            target_date: Optional specific date to process. If None, auto-detects latest available.
            
        Returns:
            Dictionary with pipeline results
        """
        start_time = datetime.utcnow()
        
        print(f"🌡️ HEATWAVE SEQUENTIAL PIPELINE")
        print(f"{'='*70}")
        print(f"Started: {start_time} UTC")
        print(f"Processing: Download → Process → Store → Delete (one by one)")
        
        # Test database connectivity FIRST
        print(f"\n🔍 TESTING DATABASE CONNECTIVITY...")
        try:
            async with SimplifiedHeatwaveDatabase() as db:
                stats = await db.get_statistics()
                print(f"✅ Simplified heatwave database connected")
                print(f"   Current data: {stats}")
                
        except Exception as e:
            print(f"❌ DATABASE CONNECTION FAILED: {e}")
            print(f"   This explains why no errors were shown - database operations happen at the end!")
            return {"success": False, "message": f"Database connection failed: {e}"}
        
        try:
            # Auto-detect latest available forecast if no target date specified
            if target_date is None:
                forecast_result = await self.find_latest_available_forecast()
                if not forecast_result:
                    return {"success": False, "message": "No available forecast data found"}
                
                forecast_time, target_date = forecast_result
                print(f"🎯 Auto-detected target date: {target_date}")
            else:
                print(f"🎯 Using specified target date: {target_date}")
                
                # Find available forecast for the specified date
                forecast_time = None
                for days_back in range(self.downloader.max_days_back):
                    for use_12z in [True, False]:
                        test_time = self.downloader.get_forecast_init_time(days_back, use_12z)
                        urls = self.downloader.generate_hourly_file_urls(test_time, target_date)
                        if urls and self.downloader.check_url_exists(urls[0][0]):
                            forecast_time = test_time
                            break
                    if forecast_time:
                        break
                
                if not forecast_time:
                    return {"success": False, "message": f"No available forecast found for {target_date}"}
            
            print(f"\n✅ Using forecast: {forecast_time} UTC")
            
            # Generate URLs for 5 days of predictions (120 hours)
            print(f"🗓️ Generating 5-day forecast URLs...")
            all_urls = []
            forecast_dates = []
            
            for day_offset in range(5):  # 5 days of predictions
                prediction_date = target_date + timedelta(days=day_offset)
                day_urls = self.downloader.generate_hourly_file_urls(forecast_time, prediction_date)
                all_urls.extend(day_urls)
                forecast_dates.append(prediction_date)
                print(f"   Day {day_offset + 1}: {prediction_date} ({len(day_urls)} hours)")
            
            print(f"📋 Processing {len(all_urls)} hourly files across 5 days sequentially...")
            print(f"   Forecast dates: {forecast_dates[0]} to {forecast_dates[-1]}")
            
            # Initialize counters
            all_hourly_data = []
            files_processed = 0
            files_failed = 0
            
            # Process each file individually across all 5 days
            for i, (url, filename, hour_offset) in enumerate(all_urls, 1):
                day_num = (hour_offset // 24) + 1
                hour_in_day = hour_offset % 24
                print(f"\n[{i}/{len(all_urls)}] Day {day_num}, Hour +{hour_in_day:02d} (Total +{hour_offset:02d}):")
                print(f"   File: {filename}")
                
                try:
                    # Step 1: Download single file
                    print(f"   📥 Downloading...")
                    success = self.downloader.download_single_file(url, filename)
                    if not success:
                        print(f"   ❌ Download failed")
                        files_failed += 1
                        continue
                    
                    file_path = str(self.downloader.save_dir / filename)
                    
                    # Step 2: Process single file
                    print(f"   ⚙️ Processing...")
                    hourly_data = self.processor.process_hourly_file(file_path, self.sample_rate)
                    
                    if hourly_data:
                        # Convert to MeteorologicalData format and store immediately
                        met_data_points = []
                        for data in hourly_data:
                            met_point = MeteorologicalData(
                                latitude=data.latitude,
                                longitude=data.longitude,
                                forecast_hour=data.timestamp,
                                forecast_init_time=data.forecast_init_time,
                                temperature=data.temperature,
                                humidity=data.humidity,
                                wind_speed=data.wind_speed,
                                pressure=data.pressure
                            )
                            met_data_points.append(met_point)
                        
                        # Store meteorological data immediately
                        async with SimplifiedHeatwaveDatabase() as db:
                            result = await db.insert_meteorological_data(met_data_points)
                            print(f"   ✅ Stored {result['inserted']:,} meteorological records")
                        
                        all_hourly_data.extend(hourly_data)
                        files_processed += 1
                    else:
                        print(f"   ⚠️ No data extracted")
                        files_failed += 1
                    
                    # Step 3: Clean up file immediately
                    try:
                        os.remove(file_path)
                        print(f"   🗑️ File cleaned up")
                    except Exception as e:
                        print(f"   ⚠️ Cleanup warning: {e}")
                        
                except Exception as e:
                    print(f"   ❌ Processing error: {e}")
                    files_failed += 1
                    continue
            
            print(f"\n📊 Processing Summary:")
            print(f"   Files processed successfully: {files_processed}")
            print(f"   Files failed: {files_failed}")
            print(f"   Total hourly data points: {len(all_hourly_data):,}")
            print(f"   Days of forecast data: 5 days")
            print(f"   Forecast period: {forecast_dates[0]} to {forecast_dates[-1]}")
            
            if not all_hourly_data:
                return {"success": False, "message": "No meteorological data extracted"}
            
            # Step 4: Real-time heatwave detection and alert generation
            print(f"\n{'='*70}")
            print(f"🚨 REAL-TIME HEATWAVE DETECTION")
            print(f"{'='*70}")
            
            total_heatwave_alerts = 0
            
            # Get unique forecast dates from processed data (should be 5 days)
            processed_dates = set()
            for data in all_hourly_data:
                processed_dates.add(data.timestamp.date())
            
            print(f"   Processed dates: {sorted(processed_dates)}")
            
            # Process heatwave detection for each of the 5 forecast days
            for forecast_date in sorted(processed_dates):
                print(f"\n📅 Analyzing {forecast_date} for heatwave conditions...")
                
                # Use the heatwave calculator for real-time detection
                day_alerts = await self.heatwave_calculator.process_daily_heatwave_detection(
                    forecast_date, forecast_time
                )
                
                if day_alerts:
                    # Store heatwave alerts immediately
                    async with SimplifiedHeatwaveDatabase() as db:
                        result = await db.insert_heatwave_alerts(day_alerts)
                        alerts_stored = result['inserted']
                        total_heatwave_alerts += alerts_stored
                        
                        # Show alert level breakdown
                        alert_levels = {}
                        for alert in day_alerts:
                            level = alert.alert_level
                            alert_levels[level] = alert_levels.get(level, 0) + 1
                        
                        level_names = {1: "Watch", 2: "Warning", 3: "Emergency"}
                        level_summary = ", ".join([f"{level_names[level]}: {count}" for level, count in sorted(alert_levels.items())])
                        print(f"   🚨 {alerts_stored:,} alerts stored ({level_summary})")
                else:
                    print(f"   ✅ No heatwave conditions detected")
            
            # Clean up old data
            async with SimplifiedHeatwaveDatabase() as db:
                await db.cleanup_old_data()
                print(f"🧹 Database cleanup completed")
            
            # Summary
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            print(f"\n{'='*70}")
            print(f"✅ SEQUENTIAL PIPELINE COMPLETED SUCCESSFULLY")
            print(f"{'='*70}")
            print(f"   Duration: {duration:.1f} seconds")
            print(f"   Files processed: {files_processed}/{len(all_urls)}")
            print(f"   Meteorological records: {len(all_hourly_data):,}")
            print(f"   Heatwave alerts: {total_heatwave_alerts:,}")
            print(f"   Forecast days: 5 days ({forecast_dates[0]} to {forecast_dates[-1]})")
            print(f"   Memory efficient: Files processed one by one")
            print(f"   Real-time detection: Advanced heatwave analysis")
            print(f"{'='*70}")
            
            return {
                "success": True,
                "duration_seconds": duration,
                "meteorological_records": len(all_hourly_data),
                "heatwave_alerts": total_heatwave_alerts,
                "files_processed": files_processed,
                "files_failed": files_failed,
                "total_files": len(all_urls),
                "forecast_days": 5,
                "forecast_start_date": str(forecast_dates[0]),
                "forecast_end_date": str(forecast_dates[-1])
            }
            
        except Exception as e:
            print(f"\n❌ SEQUENTIAL PIPELINE FAILED: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "message": str(e)}

    async def run_complete_pipeline(self, target_date: Optional[date] = None) -> Dict:
        """
        Run the complete heatwave prediction pipeline (legacy batch method)
        For memory efficiency, use run_sequential_pipeline() instead
        """
        print("⚠️ Using legacy batch processing. Consider using sequential processing for better memory efficiency.")
        return await self.run_sequential_pipeline(target_date)


def main():
    """Main entry point with CLI arguments"""
    parser = argparse.ArgumentParser(
        description='Heatwave Prediction Pipeline - Download, Process, Store',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument('--sample-rate', type=int, default=5,
                        help='Sample every Nth grid point (default: 5)')
    parser.add_argument('--target-date', type=str,
                        help='Target date (YYYY-MM-DD, defaults to auto-detect latest available)')
    
    args = parser.parse_args()
    
    # Parse target date
    target_date = None
    if args.target_date:
        try:
            target_date = datetime.strptime(args.target_date, '%Y-%m-%d').date()
        except ValueError:
            print(f"❌ Invalid date format: {args.target_date}. Use YYYY-MM-DD")
            sys.exit(1)
    
    # Create and run pipeline
    pipeline = HeatwavePredictionPipeline(sample_rate=args.sample_rate)
    
    # Run async sequential pipeline
    result = asyncio.run(pipeline.run_sequential_pipeline(target_date))
    
    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()

