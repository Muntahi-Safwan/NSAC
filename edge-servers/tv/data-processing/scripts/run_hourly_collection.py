#!/usr/bin/env python3
"""
TV Edge Server Hourly Data Collection Scheduler
Runs air quality, heatwave, and wildfire data collection every hour for TV broadcasts
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

# Import independent data processing modules
import importlib.util

# Import air-quality system
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


def setup_logging():
    """Setup logging for the TV edge server scheduler"""
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Create logger
    logger = logging.getLogger("TVEdgeScheduler")
    logger.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create file handler with daily rotation
    log_file = log_dir / f"tv_edge_scheduler_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger


async def run_single_collection(air_quality_system, fire_system):
    """Run a single data collection for TV edge server"""
    logger = logging.getLogger("TVEdgeScheduler")
    
    logger.info("📺 Starting TV Edge Server data collection")
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
    
    # Summary
    if overall_success:
        logger.info("🏁 TV Edge Server collection completed successfully")
    else:
        logger.warning("⚠️ Some collections failed, but continuing...")
    
    return overall_success, results


async def scheduler_loop(sample_rate: int = 1):
    """Main scheduler loop that runs collections every hour"""
    logger = setup_logging()
    
    logger.info("🚀 TV Edge Server Data Collection Scheduler Starting")
    logger.info("⏰ Will run Air Quality and Wildfire collections every hour")
    logger.info(f"📊 Air Quality sample rate: 1/{sample_rate} ({100/sample_rate:.1f}% of data points)")
    
    # Initialize the systems once
    air_quality_system = AirQualityMainSystem(sample_rate=sample_rate)
    await air_quality_system.initialize_components()
    
    fire_system = FireSystem()
    logger.info("🔥 Fire system initialized")
    
    try:
        # Run immediately on startup
        logger.info("🚀 Running initial data collection immediately...")
        success, results = await run_single_collection(air_quality_system, fire_system)
        
        if not success:
            logger.warning("⚠️ Initial collection had some failures, but continuing...")
        
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
            
            # Run collection
            success, results = await run_single_collection(air_quality_system, fire_system)
            
            if not success:
                logger.warning("⚠️ Some collections failed, will retry next hour")
            
    except KeyboardInterrupt:
        logger.info("🛑 TV Edge Server scheduler stopped by user")
    except Exception as e:
        logger.error(f"💥 Fatal error in TV edge server scheduler: {e}")
        logger.exception("Full traceback:")
    finally:
        # Cleanup
        await air_quality_system.cleanup()
        logger.info("🧹 TV Edge Server scheduler cleanup completed")


def main():
    """Main entry point for the TV edge server scheduler"""
    parser = argparse.ArgumentParser(description="TV Edge Server Hourly Data Collection Scheduler")
    parser.add_argument('--sample-rate', type=int, default=1, 
                        help='Sample rate for air quality data collection (1=100% for health alerts, 10=10%, 20=5%)')
    
    args = parser.parse_args()
    
    sample_rate = args.sample_rate
    if sample_rate == 1:
        print("🏥 TV Edge Server - Health Alert Mode: Using full air quality sampling (100% of data points)")
    else:
        print(f"📊 TV Edge Server - Using air quality sample rate: 1/{sample_rate} ({100/sample_rate:.1f}% of data points)")
    
    print("🔥 TV Edge Server - Wildfire detection: Using VIIRS and MODIS satellites with 1-hour lookback")
    
    try:
        asyncio.run(scheduler_loop(sample_rate))
    except KeyboardInterrupt:
        print("\n⚠️ TV Edge Server scheduler interrupted by user")
    except Exception as e:
        print(f"💥 Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()