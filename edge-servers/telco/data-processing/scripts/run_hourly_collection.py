#!/usr/bin/env python3
"""
NSAC Data Collection Scheduler
Runs air quality and wildfire data collection hourly, heatwave daily
"""

import asyncio
import logging
import sys
import os
import time
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# Add the parent directory to the path so we can import modules
sys.path.append(str(Path(__file__).parent.parent))

# Import air-quality system
import importlib.util
air_quality_path = Path(__file__).parent.parent / "air-quality" / "main.py"
spec = importlib.util.spec_from_file_location("air_quality_main", air_quality_path)
air_quality_main = importlib.util.module_from_spec(spec)
spec.loader.exec_module(air_quality_main)
AirQualityMainSystem = air_quality_main.AirQualityMainSystem

# Import wildfire system
wildfire_path = Path(__file__).parent.parent / "wildfire" / "main.py"
spec = importlib.util.spec_from_file_location("wildfire_main", wildfire_path)
wildfire_main = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wildfire_main)
FireSystem = wildfire_main.FireSystem

# Import heatwave system
heatwave_path = Path(__file__).parent.parent / "heatwave" / "main.py"
spec = importlib.util.spec_from_file_location("heatwave_main", heatwave_path)
heatwave_main = importlib.util.module_from_spec(spec)
spec.loader.exec_module(heatwave_main)
HeatwavePredictionPipeline = heatwave_main.HeatwavePredictionPipeline

# Import Gemini SMS service
sms_path = Path(__file__).parent.parent / "gemini_sms_service.py"
spec = importlib.util.spec_from_file_location("gemini_sms", sms_path)
gemini_sms = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gemini_sms)
GeminiSMSService = gemini_sms.GeminiSMSService


def setup_logging():
    """Setup logging for the hourly collection scheduler"""
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Create logger
    logger = logging.getLogger("NSACScheduler")
    logger.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create file handler with daily rotation
    log_file = log_dir / f"nsac_scheduler_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger


async def run_hourly_collection(air_quality_system, fire_system, sms_service):
    """Run hourly data collection for air quality and wildfire systems"""
    logger = logging.getLogger("NSACScheduler")

    logger.info("🕐 Starting hourly NSAC data collection")
    logger.info(f"⏰ Collection time: {datetime.now().isoformat()}")

    results = {}
    overall_success = True

    # 1. Air Quality Collection
    logger.info("🌬️ Starting Air Quality collection...")
    try:
        air_result = await air_quality_system.run_hourly_collection()
        results['air_quality'] = air_result

        if air_result.get("success"):
            total_points = air_result.get("total_data_points", 0)
            forecast_points = air_result.get("forecast", {}).get("data_points", 0)
            realtime_points = air_result.get("realtime", {}).get("data_points", 0)
            logger.info(f"✅ Air Quality successful: {total_points} total data points")
            logger.info(f"   📊 Forecast: {forecast_points} points")
            logger.info(f"   📡 Realtime: {realtime_points} points")
        else:
            logger.error(f"❌ Air Quality failed: {air_result.get('message', 'Unknown error')}")
            overall_success = False

    except Exception as e:
        logger.error(f"💥 Air Quality error: {e}")
        logger.exception("Full traceback:")
        results['air_quality'] = {"success": False, "error": str(e)}
        overall_success = False

    # 2. Wildfire Collection
    logger.info("🔥 Starting Wildfire collection...")
    try:
        wildfire_result = await fire_system.run_hourly_cycle()
        results['wildfire'] = wildfire_result

        if wildfire_result.get("status") == "success":
            fires_detected = wildfire_result.get("fires_detected", 0)
            fires_stored = wildfire_result.get("fires_stored", 0)
            alerts_generated = wildfire_result.get("alerts_generated", 0)
            logger.info(f"✅ Wildfire successful: {fires_detected} fires detected, {fires_stored} stored")
            logger.info(f"   🚨 Alerts: {alerts_generated} alerts generated")
        else:
            logger.error(f"❌ Wildfire failed: {wildfire_result.get('message', 'Unknown error')}")
            overall_success = False

    except Exception as e:
        logger.error(f"💥 Wildfire error: {e}")
        logger.exception("Full traceback:")
        results['wildfire'] = {"status": "error", "error": str(e)}
        overall_success = False

    # 3. SMS Alert Generation (Personalized for registered users)
    logger.info("📱 Generating personalized SMS alerts for registered users...")
    try:
        sms_alerts = await sms_service.generate_sms_alerts()
        results['sms'] = sms_alerts

        if not sms_alerts:
            logger.info("✅ No SMS alerts needed - all users in safe conditions")
            logger.info("   📱 No messages to send")
        else:
            logger.info(f"🚨 Generated {len(sms_alerts)} personalized SMS alert(s)")

            # Display SMS alerts in console
            logger.info("\n" + "=" * 80)
            logger.info("📱 PERSONALIZED SMS ALERTS:")
            logger.info("=" * 80)

            for idx, alert in enumerate(sms_alerts, 1):
                logger.info(f"\nSMS #{idx}:")
                logger.info(f"  👤 To: {alert['user_name']} ({alert['email']})")
                logger.info(f"  📞 Phone: {alert['phone']}")
                logger.info(f"  🚦 Severity: {alert['severity']}")
                logger.info(f"  ⚠️  Hazards: {', '.join(alert['hazards'])}")
                logger.info(f"  📍 Location: {alert['location']['latitude']:.4f}°N, {alert['location']['longitude']:.4f}°E")

                if alert.get('air_quality_aqi'):
                    logger.info(f"  🌬️  AQI: {alert['air_quality_aqi']:.0f}")
                if alert.get('wildfires_count', 0) > 0:
                    logger.info(f"  🔥 Wildfires: {alert['wildfires_count']}")
                if alert.get('heatwave_alerts', 0) > 0:
                    logger.info(f"  🌡️  Heatwave: {alert['heatwave_alerts']} alert(s)")

                logger.info(f"\n  📱 MESSAGE ({len(alert['sms_text'])} chars):")
                logger.info("  " + "-" * 76)
                logger.info(f"  {alert['sms_text']}")
                logger.info("  " + "-" * 76)

            logger.info("\n" + "=" * 80)
            logger.info(f"✅ Total SMS alerts ready for distribution: {len(sms_alerts)}")
            logger.info("=" * 80 + "\n")

    except Exception as e:
        logger.error(f"💥 SMS generation error: {e}")
        logger.exception("Full traceback:")
        results['sms'] = {"error": str(e)}
        # Don't mark as failure since SMS is informational

    # Summary
    if overall_success:
        logger.info("🏁 Hourly collections completed successfully")
    else:
        logger.warning("⚠️ Some hourly collections failed, but continuing...")

    return overall_success, results


async def run_daily_heatwave():
    """Run daily heatwave processing"""
    logger = logging.getLogger("NSACScheduler")
    
    logger.info("🌡️ Starting daily heatwave processing")
    logger.info(f"⏰ Processing time: {datetime.now().isoformat()}")
    
    try:
        # Initialize heatwave pipeline
        pipeline = HeatwavePredictionPipeline(sample_rate=5)
        logger.info("✅ Heatwave pipeline initialized")
        
        # Run sequential pipeline (auto-detects latest available forecast)
        logger.info("📊 Running heatwave prediction pipeline...")
        result = await pipeline.run_sequential_pipeline()
        
        if result.get("success"):
            duration = result.get("duration_seconds", 0)
            met_records = result.get("meteorological_records", 0)
            heatwave_alerts = result.get("heatwave_alerts", 0)
            files_processed = result.get("files_processed", 0)
            forecast_days = result.get("forecast_days", 0)
            start_date = result.get("forecast_start_date", "Unknown")
            end_date = result.get("forecast_end_date", "Unknown")
            
            logger.info("✅ Daily heatwave processing completed successfully")
            logger.info(f"   Duration: {duration:.1f} seconds")
            logger.info(f"   Meteorological records: {met_records:,}")
            logger.info(f"   Heatwave alerts: {heatwave_alerts:,}")
            logger.info(f"   Files processed: {files_processed}")
            logger.info(f"   Forecast period: {start_date} to {end_date} ({forecast_days} days)")
            
            return True, result
        else:
            error_msg = result.get("message", "Unknown error")
            logger.error(f"❌ Daily heatwave processing failed: {error_msg}")
            return False, result
        
    except Exception as e:
        logger.error(f"💥 Daily heatwave processing error: {e}")
        logger.exception("Full traceback:")
        return False, {"success": False, "error": str(e)}


async def scheduler_loop(sample_rate: int = 1):
    """Main scheduler loop that runs collections hourly and heatwave daily"""
    logger = setup_logging()

    logger.info("🚀 NSAC Data Collection Scheduler Starting")
    logger.info("⏰ Will run Air Quality and Wildfire collections every hour")
    logger.info("🌡️ Will run Heatwave processing daily at midnight")
    logger.info("📱 Will generate personalized SMS alerts for registered users")
    logger.info(f"📊 Air Quality sample rate: 1/{sample_rate} ({100/sample_rate:.1f}% of data points)")

    # Initialize the systems once
    air_quality_system = AirQualityMainSystem(sample_rate=sample_rate)
    await air_quality_system.initialize_components()

    fire_system = FireSystem()
    logger.info("🔥 Fire system initialized")

    # Initialize SMS service
    sms_service = GeminiSMSService()
    await sms_service.connect()
    logger.info("📱 SMS alert service initialized")

    # Track last heatwave run date
    last_heatwave_date = None

    try:
        # Run immediately on startup
        logger.info("🚀 Running initial data collection immediately...")
        success, results = await run_hourly_collection(air_quality_system, fire_system, sms_service)
        
        if not success:
            logger.warning("⚠️ Initial collection had some failures, but continuing...")
        
        # Run initial heatwave processing if it hasn't been run today
        now = datetime.now()
        today = now.date()
        if last_heatwave_date != today:
            logger.info("🌡️ Running initial daily heatwave processing...")
            heatwave_success, heatwave_results = await run_daily_heatwave()
            if heatwave_success:
                last_heatwave_date = today
                logger.info("✅ Initial heatwave processing completed")
            else:
                logger.warning("⚠️ Initial heatwave processing failed, will retry tomorrow")
        
        # Now schedule hourly runs
        while True:
            # Calculate next hour boundary
            now = datetime.now()
            next_hour = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
            sleep_seconds = (next_hour - now).total_seconds()
            
            logger.info(f"⏳ Next collection scheduled for: {next_hour.isoformat()}")
            logger.info(f"💤 Sleeping for {sleep_seconds/60:.1f} minutes")
            
            # Sleep until next hour
            await asyncio.sleep(sleep_seconds)
            
            # Check if it's a new day for heatwave processing (run at midnight)
            current_time = datetime.now()
            current_date = current_time.date()
            
            # Run heatwave processing if it's a new day and it's midnight
            if (last_heatwave_date != current_date and 
                current_time.hour == 0 and current_time.minute < 5):  # Run within first 5 minutes of new day
                
                logger.info("🌡️ New day detected - running daily heatwave processing...")
                heatwave_success, heatwave_results = await run_daily_heatwave()
                if heatwave_success:
                    last_heatwave_date = current_date
                    logger.info("✅ Daily heatwave processing completed")
                else:
                    logger.warning("⚠️ Daily heatwave processing failed, will retry next day")
            
            # Run hourly collection
            success, results = await run_hourly_collection(air_quality_system, fire_system, sms_service)

            if not success:
                logger.warning("⚠️ Some collections failed, will retry next hour")

    except KeyboardInterrupt:
        logger.info("🛑 Scheduler stopped by user")
    except Exception as e:
        logger.error(f"💥 Fatal error in scheduler: {e}")
        logger.exception("Full traceback:")
    finally:
        # Cleanup
        await air_quality_system.cleanup()
        await sms_service.disconnect()
        logger.info("🧹 Scheduler cleanup completed")


def main():
    """Main entry point for the scheduler"""
    parser = argparse.ArgumentParser(description="NSAC Data Collection Scheduler - Hourly Air Quality & Wildfire, Daily Heatwave")
    parser.add_argument('--sample-rate', type=int, default=1, 
                        help='Sample rate for air quality data collection (1=100%% for health alerts, 10=10%%, 20=5%%)')
    
    args = parser.parse_args()
    
    sample_rate = args.sample_rate
    if sample_rate == 1:
        print("🏥 Health Alert Mode: Using full air quality sampling (100% of data points)")
    else:
        print(f"📊 Using air quality sample rate: 1/{sample_rate} ({100/sample_rate:.1f}% of data points)")
    
    print("🔥 Wildfire detection: Using VIIRS and MODIS satellites with 1-hour lookback and duplicate avoidance")
    print("🌡️ Heatwave prediction: Daily processing at midnight with 5-day forecast analysis")
    
    try:
        asyncio.run(scheduler_loop(sample_rate))
    except KeyboardInterrupt:
        print("\n⚠️ Scheduler interrupted by user")
    except Exception as e:
        print(f"💥 Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
