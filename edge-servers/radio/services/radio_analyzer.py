#!/usr/bin/env python3
"""
Radio Edge Server Main Analyzer
Orchestrates data analysis, AI insights, and audio generation for radio broadcasting
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import json

from .data_analyzer import DataAnalyzer
from .gemini_analyzer import GeminiAnalyzer
from .audio_generator import AudioGenerator


class RadioAnalyzer:
    """Main analyzer that coordinates all radio insight generation"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.data_analyzer = DataAnalyzer()
        self.gemini_analyzer = GeminiAnalyzer()
        self.audio_generator = AudioGenerator()
        
        # Analysis state
        self.last_hourly_analysis = None
        self.last_daily_analysis = None
        self.last_audio_package = None
    
    async def initialize(self):
        """Initialize all analyzer components"""
        try:
            self.logger.info("🚀 Initializing Radio Analyzer")
            
            await self.data_analyzer.initialize()
            
            # Run initial cleanup
            await self.audio_generator.cleanup_old_audio()
            
            self.logger.info("✅ Radio Analyzer initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Radio Analyzer initialization failed: {e}")
            raise
    
    async def run_hourly_analysis(self) -> Dict[str, Any]:
        """Run complete hourly analysis pipeline"""
        try:
            self.logger.info("🕐 Starting hourly analysis pipeline")
            
            # Step 1: Analyze environmental data
            data_insights = await self.data_analyzer.analyze_hourly_data()
            self.last_hourly_analysis = data_insights
            
            # Step 2: Generate AI insights
            radio_insights = await self.gemini_analyzer.generate_radio_insights(data_insights)
            
            # Step 3: Generate audio content
            audio_package = await self.audio_generator.generate_audio_insights(radio_insights)
            self.last_audio_package = audio_package
            
            # Combine all results
            result = {
                "timestamp": datetime.now().isoformat(),
                "analysis_type": "hourly",
                "data_insights": data_insights,
                "radio_insights": radio_insights,
                "audio_package": audio_package,
                "success": True,
                "ready_for_broadcast": audio_package.get("ready_for_broadcast", False)
            }
            
            self.logger.info("✅ Hourly analysis pipeline completed successfully")
            return result
            
        except Exception as e:
            self.logger.error(f"❌ Hourly analysis pipeline failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "analysis_type": "hourly",
                "success": False,
                "error": str(e),
                "ready_for_broadcast": False
            }
    
    async def run_daily_analysis(self) -> Dict[str, Any]:
        """Run complete daily analysis pipeline"""
        try:
            self.logger.info("📅 Starting daily analysis pipeline")
            
            # Step 1: Analyze environmental data
            data_insights = await self.data_analyzer.analyze_daily_data()
            self.last_daily_analysis = data_insights
            
            # Step 2: Generate AI insights
            radio_insights = await self.gemini_analyzer.generate_radio_insights(data_insights)
            
            # Step 3: Generate audio content
            audio_package = await self.audio_generator.generate_audio_insights(radio_insights)
            
            # Combine all results
            result = {
                "timestamp": datetime.now().isoformat(),
                "analysis_type": "daily",
                "data_insights": data_insights,
                "radio_insights": radio_insights,
                "audio_package": audio_package,
                "success": True,
                "ready_for_broadcast": audio_package.get("ready_for_broadcast", False)
            }
            
            self.logger.info("✅ Daily analysis pipeline completed successfully")
            return result
            
        except Exception as e:
            self.logger.error(f"❌ Daily analysis pipeline failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "analysis_type": "daily",
                "success": False,
                "error": str(e),
                "ready_for_broadcast": False
            }
    
    async def get_latest_insights(self) -> Optional[Dict[str, Any]]:
        """Get the most recent analysis results"""
        try:
            if self.last_audio_package and self.last_audio_package.get("ready_for_broadcast"):
                return {
                    "timestamp": datetime.now().isoformat(),
                    "last_hourly_analysis": self.last_hourly_analysis,
                    "last_daily_analysis": self.last_daily_analysis,
                    "audio_package": self.last_audio_package,
                    "available": True
                }
            else:
                return {
                    "timestamp": datetime.now().isoformat(),
                    "available": False,
                    "message": "No recent analysis available"
                }
                
        except Exception as e:
            self.logger.error(f"❌ Failed to get latest insights: {e}")
            return None
    
    async def get_analysis_status(self) -> Dict[str, Any]:
        """Get current status of the analyzer"""
        try:
            status = {
                "timestamp": datetime.now().isoformat(),
                "analyzer_status": "running",
                "components": {
                    "data_analyzer": "initialized" if self.data_analyzer else "not_initialized",
                    "gemini_analyzer": "available" if self.gemini_analyzer.model else "not_available",
                    "audio_generator": "ready" if self.audio_generator else "not_ready"
                },
                "last_analysis": {
                    "hourly": self.last_hourly_analysis is not None,
                    "daily": self.last_daily_analysis is not None
                },
                "audio_ready": self.last_audio_package is not None and self.last_audio_package.get("ready_for_broadcast", False)
            }
            
            return status
            
        except Exception as e:
            self.logger.error(f"❌ Failed to get analysis status: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "analyzer_status": "error",
                "error": str(e)
            }
    
    async def cleanup(self):
        """Cleanup all analyzer components"""
        try:
            self.logger.info("🧹 Cleaning up Radio Analyzer")
            
            await self.data_analyzer.cleanup()
            await self.audio_generator.cleanup_old_audio()
            
            self.logger.info("✅ Radio Analyzer cleanup completed")
            
        except Exception as e:
            self.logger.error(f"❌ Radio Analyzer cleanup failed: {e}")
    
    async def test_analysis_pipeline(self) -> Dict[str, Any]:
        """Test the complete analysis pipeline"""
        try:
            self.logger.info("🧪 Testing analysis pipeline")
            
            # Test hourly analysis
            hourly_result = await self.run_hourly_analysis()
            
            # Test daily analysis
            daily_result = await self.run_daily_analysis()
            
            # Test status
            status = await self.get_analysis_status()
            
            test_result = {
                "timestamp": datetime.now().isoformat(),
                "test_type": "full_pipeline",
                "hourly_analysis": hourly_result.get("success", False),
                "daily_analysis": daily_result.get("success", False),
                "audio_generation": hourly_result.get("ready_for_broadcast", False),
                "status_check": status.get("analyzer_status") == "running",
                "overall_success": all([
                    hourly_result.get("success", False),
                    daily_result.get("success", False),
                    status.get("analyzer_status") == "running"
                ])
            }
            
            self.logger.info(f"🧪 Pipeline test completed: {'✅ Success' if test_result['overall_success'] else '❌ Failed'}")
            return test_result
            
        except Exception as e:
            self.logger.error(f"❌ Pipeline test failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "test_type": "full_pipeline",
                "overall_success": False,
                "error": str(e)
            }

