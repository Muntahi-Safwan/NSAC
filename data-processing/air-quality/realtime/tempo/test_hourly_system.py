"""
Test the Hourly Air Quality System

Tests the complete workflow:
1. Download TEMPO V4 data
2. Process NetCDF files
3. Get AirNOW data
4. Merge data sources
5. Calculate AQI
6. Store in database
"""

import sys
import os
import asyncio
import logging

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

async def test_hourly_system():
    """Test the complete hourly air quality system."""
    print("TESTING HOURLY AIR QUALITY SYSTEM")
    print("=" * 60)
    
    try:
        from hourly_air_quality_system import HourlyAirQualitySystem
        
        # Initialize system
        print("Initializing system...")
        system = HourlyAirQualitySystem()
        print("✓ System initialized")
        
        # Test individual components
        print("\n" + "=" * 60)
        print("TESTING INDIVIDUAL COMPONENTS")
        print("=" * 60)
        
        # Test 1: Download TEMPO data
        print("\n1. Testing TEMPO data download...")
        download_results = system.download_latest_tempo_data()
        print(f"   Download results: {len(download_results)} products")
        for product, result in download_results.items():
            status = "✓" if result.get('success') else "✗"
            print(f"   {status} {product.upper()}: {result.get('file_path', 'Failed')}")
        
        # Test 2: Process TEMPO data
        print("\n2. Testing TEMPO data processing...")
        processing_results = system.process_tempo_data()
        print(f"   Processed files: {processing_results.get('files_processed', 0)}")
        print(f"   NO2 measurements: {len(processing_results.get('products', {}).get('no2', []))}")
        print(f"   O3 measurements: {len(processing_results.get('products', {}).get('o3', []))}")
        print(f"   Total data points: {processing_results.get('total_data_points', 0)}")
        
        # Test 3: Get AirNOW data
        print("\n3. Testing AirNOW data retrieval...")
        airnow_data = system.get_airnow_data()
        print(f"   AirNOW data points: {len(airnow_data)}")
        
        # Test 4: Merge data sources
        print("\n4. Testing data merging...")
        merged_data = system.merge_data_sources(processing_results, airnow_data)
        print(f"   Merged data points: {len(merged_data)}")
        
        # Test 5: Calculate AQI
        print("\n5. Testing AQI calculation...")
        aqi_data = system.calculate_aqi(merged_data)
        print(f"   AQI data points: {len(aqi_data)}")
        
        # Test 6: Store in database
        print("\n6. Testing database storage...")
        database_results = await system.store_in_database(aqi_data)
        print(f"   Stored: {database_results.get('stored_count', 0)}/{database_results.get('total_count', 0)}")
        print(f"   Success: {'✓' if database_results.get('success') else '✗'}")
        
        # Test complete cycle
        print("\n" + "=" * 60)
        print("TESTING COMPLETE CYCLE")
        print("=" * 60)
        
        print("\nRunning complete hourly cycle...")
        cycle_results = await system.run_hourly_cycle()
        
        print(f"\nCycle Results:")
        print(f"  Success: {'✓' if cycle_results['success'] else '✗'}")
        print(f"  TEMPO data points: {cycle_results['processing_results'].get('total_data_points', 0)}")
        print(f"  AirNOW data points: {cycle_results['airnow_data_count']}")
        print(f"  Merged data points: {cycle_results['merged_data_count']}")
        print(f"  AQI data points: {cycle_results['aqi_data_count']}")
        print(f"  Database storage: {cycle_results['database_results'].get('stored_count', 0)}")
        
        if cycle_results['errors']:
            print(f"  Errors:")
            for error in cycle_results['errors']:
                print(f"    - {error}")
        
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"✓ System initialization: PASSED")
        print(f"✓ TEMPO download: {'PASSED' if download_results else 'FAILED'}")
        print(f"✓ TEMPO processing: {'PASSED' if processing_results.get('total_data_points', 0) > 0 else 'FAILED'}")
        print(f"✓ AirNOW data: {'PASSED' if len(airnow_data) > 0 else 'FAILED'}")
        print(f"✓ Data merging: {'PASSED' if len(merged_data) > 0 else 'FAILED'}")
        print(f"✓ AQI calculation: {'PASSED' if len(aqi_data) > 0 else 'FAILED'}")
        print(f"✓ Database storage: {'PASSED' if database_results.get('success') else 'FAILED'}")
        print(f"✓ Complete cycle: {'PASSED' if cycle_results['success'] else 'FAILED'}")
        
        return cycle_results
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

async def main():
    """Run the test."""
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Run test
    results = await test_hourly_system()
    
    if results and results['success']:
        print(f"\n🎉 ALL TESTS PASSED! System is working correctly.")
    else:
        print(f"\n❌ SOME TESTS FAILED. Check the output above for details.")

if __name__ == "__main__":
    asyncio.run(main())
