#!/usr/bin/env python3
"""
Daily Heatwave Processing Script
Runs heatwave prediction and detection daily
"""

import asyncio
import logging
import sys
import os
from datetime import datetime, date
from pathlib import Path

# Add the parent directory to the path so we can import modules
sys.path.append(str(Path(__file__).parent.parent))

# Import heatwave system
import importlib.util
heatwave_path = Path(__file__).parent.parent / "heatwave" / "main.py"
spec = importlib.util.spec_from_file_location("heatwave_main", heatwave_path)
heatwave_main = importlib.util.module_from_spec(spec)
spec.loader.exec_module(heatwave_main)
HeatwavePredictionPipeline = heatwave_main.HeatwavePredictionPipeline


def setup_logging():
    """Setup logging for the daily heatwave script"""
    logger = logging.getLogger("HeatwaveDaily")
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


async def run_daily_heatwave():
    """Run daily heatwave processing"""
    logger = setup_logging()
    
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


def main():
    """Main entry point for daily heatwave script"""
    print("🌡️ Daily Heatwave Processing")
    print("=" * 50)
    
    try:
        success, result = asyncio.run(run_daily_heatwave())
        
        if success:
            print("✅ Daily heatwave processing completed successfully")
            sys.exit(0)
        else:
            print("❌ Daily heatwave processing failed")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️ Daily heatwave processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"💥 Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

