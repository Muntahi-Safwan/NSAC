"""
Simple script to run the hourly air quality system.
"""

import asyncio
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

async def main():
    """Run the hourly air quality system."""
    try:
        from hourly_air_quality_system import HourlyAirQualitySystem
        
        print("🚀 Starting Hourly Air Quality System")
        print("=" * 50)
        
        # Initialize system
        system = HourlyAirQualitySystem()
        print("✓ System initialized")
        
        # Run one cycle
        print("\n🔄 Running hourly cycle...")
        results = await system.run_hourly_cycle()
        
        # Display results
        print(f"\n📊 Results:")
        print(f"  Success: {'✅' if results['success'] else '❌'}")
        print(f"  TEMPO data points: {results['processing_results'].get('total_data_points', 0)}")
        print(f"  AirNOW data points: {results['airnow_data_count']}")
        print(f"  Merged data points: {results['merged_data_count']}")
        print(f"  AQI data points: {results['aqi_data_count']}")
        print(f"  Database storage: {results['database_results'].get('stored_count', 0)}")
        
        if results['success']:
            print(f"\n🎉 System completed successfully!")
        else:
            print(f"\n⚠️  System completed with issues")
            if results['errors']:
                print(f"  Errors:")
                for error in results['errors']:
                    print(f"    - {error}")
        
    except Exception as e:
        print(f"❌ System failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
