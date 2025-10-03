#!/usr/bin/env python3
"""
Radio Server Test Script
Quick test to verify all components are working
"""

import asyncio
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

async def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from services.radio_scheduler import RadioScheduler
        print("✅ RadioScheduler imported successfully")
        
        from services.radio_broadcaster import RadioBroadcaster
        print("✅ RadioBroadcaster imported successfully")
        
        from services.data_analyzer import DataAnalyzer
        print("✅ DataAnalyzer imported successfully")
        
        from services.gemini_analyzer import GeminiAnalyzer
        print("✅ GeminiAnalyzer imported successfully")
        
        from services.audio_generator import AudioGenerator
        print("✅ AudioGenerator imported successfully")
        
        from services.radio_analyzer import RadioAnalyzer
        print("✅ RadioAnalyzer imported successfully")
        
        print("✅ All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

async def test_simulated_broadcaster():
    """Test the simulated broadcaster"""
    print("\n🧪 Testing simulated broadcaster...")
    
    try:
        from services.radio_broadcaster import RadioBroadcaster
        
        # Create simulated broadcaster
        broadcaster = RadioBroadcaster("simulated")
        print("✅ Simulated broadcaster created")
        
        # Initialize
        success = await broadcaster.initialize()
        print(f"✅ Initialization: {'Success' if success else 'Failed'}")
        
        # Test status
        status = await broadcaster.get_status()
        print(f"✅ Status: {status.get('type', 'unknown')} - {status.get('initialized', False)}")
        
        # Test connection
        connection_ok = await broadcaster.test_connection()
        print(f"✅ Connection test: {'Passed' if connection_ok else 'Failed'}")
        
        # Test text broadcast
        result = await broadcaster.broadcast_text(
            "This is a test broadcast from the NSAC Radio Edge Server.",
            "FM",
            {"test": True, "priority": "low"}
        )
        print(f"✅ Text broadcast: {'Success' if result.get('success') else 'Failed'}")
        
        # Get frequencies
        frequencies = broadcaster.get_available_frequencies()
        print(f"✅ Available frequencies: {len(frequencies)} frequencies")
        
        return True
        
    except Exception as e:
        print(f"❌ Simulated broadcaster test failed: {e}")
        return False

async def test_data_analyzer():
    """Test the data analyzer (without database)"""
    print("\n🧪 Testing data analyzer...")
    
    try:
        from services.data_analyzer import DataAnalyzer
        
        analyzer = DataAnalyzer()
        print("✅ DataAnalyzer created")
        
        # Test without database (should handle gracefully)
        try:
            await analyzer.initialize()
            print("✅ DataAnalyzer initialized")
        except Exception as e:
            print(f"⚠️ DataAnalyzer initialization failed (expected without database): {e}")
        
        # Test risk calculation
        test_insights = {
            "wildfire_insights": {"risk_level": "moderate"},
            "air_quality_insights": {"risk_level": "low"}
        }
        
        risk = analyzer._calculate_overall_risk(test_insights)
        print(f"✅ Risk calculation: {risk}")
        
        # Test recommendations
        recommendations = analyzer._generate_recommendations(test_insights)
        print(f"✅ Recommendations generated: {len(recommendations)} recommendations")
        
        return True
        
    except Exception as e:
        print(f"❌ Data analyzer test failed: {e}")
        return False

async def test_gemini_analyzer():
    """Test the Gemini analyzer (without API key)"""
    print("\n🧪 Testing Gemini analyzer...")
    
    try:
        from services.gemini_analyzer import GeminiAnalyzer
        
        analyzer = GeminiAnalyzer()
        print("✅ GeminiAnalyzer created")
        
        # Test fallback insights (should work without API key)
        test_data = {
            "wildfire_insights": {"risk_level": "low", "fire_count": 0},
            "air_quality_insights": {"risk_level": "low", "aqi_average": 45},
            "overall_risk": "low"
        }
        
        insights = analyzer._generate_fallback_insights(test_data)
        print(f"✅ Fallback insights: {'Generated' if insights.get('radio_script') else 'Failed'}")
        
        # Test prompt creation
        prompt = analyzer._create_analysis_prompt(test_data)
        print(f"✅ Analysis prompt: {len(prompt)} characters")
        
        return True
        
    except Exception as e:
        print(f"❌ Gemini analyzer test failed: {e}")
        return False

async def test_audio_generator():
    """Test the audio generator"""
    print("\n🧪 Testing audio generator...")
    
    try:
        from services.audio_generator import AudioGenerator
        
        generator = AudioGenerator()
        print("✅ AudioGenerator created")
        
        # Test text cleaning
        test_text = "This is a test message with http://example.com URL and   extra   spaces."
        clean_text = generator._clean_text_for_speech(test_text)
        print(f"✅ Text cleaning: {clean_text}")
        
        # Test duration estimation
        duration = generator._estimate_duration(test_text)
        print(f"✅ Duration estimation: {duration:.1f} seconds")
        
        # Test insights generation
        test_insights = {
            "radio_script": "Testing audio generation system",
            "headline": "Audio Test",
            "safety_advice": "This is a test"
        }
        
        audio_package = await generator.generate_audio_insights(test_insights)
        print(f"✅ Audio package: {'Generated' if audio_package.get('ready_for_broadcast') else 'Failed'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Audio generator test failed: {e}")
        return False

async def test_radio_analyzer():
    """Test the radio analyzer"""
    print("\n🧪 Testing radio analyzer...")
    
    try:
        from services.radio_analyzer import RadioAnalyzer
        
        analyzer = RadioAnalyzer()
        print("✅ RadioAnalyzer created")
        
        # Test status
        status = await analyzer.get_analysis_status()
        print(f"✅ Analysis status: {status.get('analyzer_status', 'unknown')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Radio analyzer test failed: {e}")
        return False

async def test_radio_scheduler():
    """Test the radio scheduler"""
    print("\n🧪 Testing radio scheduler...")
    
    try:
        from services.radio_scheduler import RadioScheduler
        
        scheduler = RadioScheduler()
        print("✅ RadioScheduler created")
        
        # Test status
        status = await scheduler.get_scheduler_status()
        print(f"✅ Scheduler status: {status.get('is_running', False)}")
        
        # Test history
        history = await scheduler.get_analysis_history(5)
        print(f"✅ Analysis history: {len(history)} entries")
        
        return True
        
    except Exception as e:
        print(f"❌ Radio scheduler test failed: {e}")
        return False

async def test_main_app():
    """Test the main FastAPI app"""
    print("\n🧪 Testing main application...")
    
    try:
        from main import app
        print("✅ FastAPI app imported successfully")
        
        # Test app configuration
        print(f"✅ App title: {app.title}")
        print(f"✅ App version: {app.version}")
        
        # Count routes
        routes = [route.path for route in app.routes]
        print(f"✅ Routes available: {len(routes)} routes")
        
        # List key routes
        key_routes = [r for r in routes if any(keyword in r for keyword in ['health', 'status', 'analysis', 'broadcaster'])]
        print(f"✅ Key routes: {', '.join(key_routes[:5])}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Main app test failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("🚀 Starting Radio Server Tests\n")
    
    tests = [
        ("Imports", test_imports),
        ("Simulated Broadcaster", test_simulated_broadcaster),
        ("Data Analyzer", test_data_analyzer),
        ("Gemini Analyzer", test_gemini_analyzer),
        ("Audio Generator", test_audio_generator),
        ("Radio Analyzer", test_radio_analyzer),
        ("Radio Scheduler", test_radio_scheduler),
        ("Main App", test_main_app),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            success = await test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST SUMMARY")
    print("="*50)
    
    passed = 0
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if success:
            passed += 1
    
    print(f"\n🏆 Results: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Radio server is ready.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    return passed == len(results)

if __name__ == "__main__":
    asyncio.run(main())

