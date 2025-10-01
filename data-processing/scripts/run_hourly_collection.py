#!/usr/bin/env python3
"""
Hourly Air Quality Data Collection Scheduler
Runs both forecast and real-time air quality data collection every hour continuously
"""

import asyncio
import logging
import sys
import os
import time
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# Add the parent directory to the path so we can import air-quality modules
sys.path.append(str(Path(__file__).parent.parent))

# Import the main system from the air-quality subfolder
sys.path.append(str(Path(__file__).parent.parent / "air-quality"))
from main import AirQualityMainSystem


def setup_logging():
    """Setup logging for the hourly collection scheduler"""
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Create logger
    logger = logging.getLogger("AirQualityScheduler")
    logger.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create file handler with daily rotation
    log_file = log_dir / f"air_quality_scheduler_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger


async def run_single_collection(system):
    """Run a single air quality data collection"""
    logger = logging.getLogger("AirQualityScheduler")
    
    logger.info("🕐 Starting air quality data collection")
    logger.info(f"⏰ Collection time: {datetime.now().isoformat()}")
    
    try:
        # Run both forecast and realtime collection every hour
        result = await system.run_hourly_collection()  # This method runs both forecast and realtime
        
        if result.get("success"):
            total_points = result.get("total_data_points", 0)
            forecast_points = result.get("forecast", {}).get("data_points", 0)
            realtime_points = result.get("realtime", {}).get("data_points", 0)
            logger.info(f"✅ Collection successful: {total_points} total data points")
            logger.info(f"   📊 Forecast: {forecast_points} points")
            logger.info(f"   📡 Realtime: {realtime_points} points")
        else:
            logger.error(f"❌ Collection failed: {result.get('message', 'Unknown error')}")
            logger.error(f"📊 Total data points: {result.get('total_data_points', 0)}")
        
        logger.info("🏁 Collection completed")
        return result.get("success", False)
        
    except Exception as e:
        logger.error(f"💥 Error in collection: {e}")
        logger.exception("Full traceback:")
        return False


async def scheduler_loop(sample_rate: int = 1):
    """Main scheduler loop that runs collections every hour"""
    logger = setup_logging()
    
    logger.info("🚀 Air Quality Data Collection Scheduler Starting")
    logger.info("⏰ Will run both forecast and real-time collections every hour")
    logger.info(f"📊 Sample rate: 1/{sample_rate} ({100/sample_rate:.1f}% of data points)")
    
    # Initialize the main system once
    system = AirQualityMainSystem(sample_rate=sample_rate)
    await system.initialize_components()
    
    try:
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
            success = await run_single_collection(system)
            
            if not success:
                logger.warning("⚠️ Collection failed, will retry next hour")
            
    except KeyboardInterrupt:
        logger.info("🛑 Scheduler stopped by user")
    except Exception as e:
        logger.error(f"💥 Fatal error in scheduler: {e}")
        logger.exception("Full traceback:")
    finally:
        # Cleanup
        await system.cleanup()
        logger.info("🧹 Scheduler cleanup completed")


def main():
    """Main entry point for the scheduler"""
    parser = argparse.ArgumentParser(description="Hourly Air Quality Data Collection Scheduler")
    parser.add_argument('--sample-rate', type=int, default=1, 
                        help='Sample rate for data collection (1=100%% for health alerts, 10=10%%, 20=5%%)')
    
    args = parser.parse_args()
    
    sample_rate = args.sample_rate
    if sample_rate == 1:
        print("🏥 Health Alert Mode: Using full sampling (100% of data points)")
    else:
        print(f"📊 Using sample rate: 1/{sample_rate} ({100/sample_rate:.1f}% of data points)")
    
    try:
        asyncio.run(scheduler_loop(sample_rate))
    except KeyboardInterrupt:
        print("\n⚠️ Scheduler interrupted by user")
    except Exception as e:
        print(f"💥 Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
