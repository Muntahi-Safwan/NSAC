#!/usr/bin/env python3
"""
Radio Edge Server Scheduler
Manages hourly and daily analysis schedules for radio broadcasting
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
import json
from pathlib import Path

from .radio_analyzer import RadioAnalyzer


class RadioScheduler:
    """Schedules and manages radio analysis tasks"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.radio_analyzer = RadioAnalyzer()
        
        # Schedule state
        self.is_running = False
        self.hourly_task = None
        self.daily_task = None
        self.analysis_history = []
        
        # Configuration
        self.hourly_enabled = True
        self.daily_enabled = True
        self.max_history_size = 100
    
    async def initialize(self):
        """Initialize the scheduler and analyzer"""
        try:
            self.logger.info("🚀 Initializing Radio Scheduler")
            
            await self.radio_analyzer.initialize()
            
            self.logger.info("✅ Radio Scheduler initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Radio Scheduler initialization failed: {e}")
            raise
    
    async def start_scheduler(self):
        """Start the scheduling system"""
        try:
            if self.is_running:
                self.logger.warning("⚠️ Scheduler is already running")
                return
            
            self.logger.info("📅 Starting Radio Scheduler")
            self.is_running = True
            
            # Run initial analysis immediately
            await self.run_initial_analysis()
            
            # Start scheduled tasks
            if self.hourly_enabled:
                self.hourly_task = asyncio.create_task(self._hourly_scheduler())
                self.logger.info("⏰ Hourly analysis scheduler started")
            
            if self.daily_enabled:
                self.daily_task = asyncio.create_task(self._daily_scheduler())
                self.logger.info("📅 Daily analysis scheduler started")
            
            self.logger.info("✅ Radio Scheduler started successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to start scheduler: {e}")
            self.is_running = False
            raise
    
    async def stop_scheduler(self):
        """Stop the scheduling system"""
        try:
            if not self.is_running:
                self.logger.warning("⚠️ Scheduler is not running")
                return
            
            self.logger.info("🛑 Stopping Radio Scheduler")
            self.is_running = False
            
            # Cancel scheduled tasks
            if self.hourly_task:
                self.hourly_task.cancel()
                try:
                    await self.hourly_task
                except asyncio.CancelledError:
                    pass
            
            if self.daily_task:
                self.daily_task.cancel()
                try:
                    await self.daily_task
                except asyncio.CancelledError:
                    pass
            
            # Cleanup
            await self.radio_analyzer.cleanup()
            
            self.logger.info("✅ Radio Scheduler stopped")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to stop scheduler: {e}")
    
    async def run_initial_analysis(self):
        """Run initial analysis on startup"""
        try:
            self.logger.info("🚀 Running initial analysis")
            
            # Run both hourly and daily analysis
            hourly_result = await self.radio_analyzer.run_hourly_analysis()
            daily_result = await self.radio_analyzer.run_daily_analysis()
            
            # Store results
            self._add_to_history("initial", {
                "hourly": hourly_result,
                "daily": daily_result
            })
            
            self.logger.info("✅ Initial analysis completed")
            
        except Exception as e:
            self.logger.error(f"❌ Initial analysis failed: {e}")
    
    async def _hourly_scheduler(self):
        """Hourly analysis scheduler"""
        try:
            while self.is_running:
                # Calculate next hour boundary
                now = datetime.now()
                next_hour = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
                sleep_seconds = (next_hour - now).total_seconds()
                
                self.logger.info(f"⏰ Next hourly analysis scheduled for: {next_hour.isoformat()}")
                self.logger.info(f"💤 Sleeping for {sleep_seconds/60:.1f} minutes")
                
                # Sleep until next hour
                await asyncio.sleep(sleep_seconds)
                
                if not self.is_running:
                    break
                
                # Run hourly analysis
                try:
                    self.logger.info("🕐 Running scheduled hourly analysis")
                    result = await self.radio_analyzer.run_hourly_analysis()
                    
                    # Store result
                    self._add_to_history("hourly", result)
                    
                    if result.get("success"):
                        self.logger.info("✅ Hourly analysis completed successfully")
                    else:
                        self.logger.warning("⚠️ Hourly analysis completed with errors")
                        
                except Exception as e:
                    self.logger.error(f"❌ Scheduled hourly analysis failed: {e}")
                    
        except asyncio.CancelledError:
            self.logger.info("🛑 Hourly scheduler cancelled")
        except Exception as e:
            self.logger.error(f"❌ Hourly scheduler error: {e}")
    
    async def _daily_scheduler(self):
        """Daily analysis scheduler"""
        try:
            while self.is_running:
                # Calculate next day boundary (midnight)
                now = datetime.now()
                next_day = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
                sleep_seconds = (next_day - now).total_seconds()
                
                self.logger.info(f"📅 Next daily analysis scheduled for: {next_day.isoformat()}")
                self.logger.info(f"💤 Sleeping for {sleep_seconds/3600:.1f} hours")
                
                # Sleep until next day
                await asyncio.sleep(sleep_seconds)
                
                if not self.is_running:
                    break
                
                # Run daily analysis
                try:
                    self.logger.info("📅 Running scheduled daily analysis")
                    result = await self.radio_analyzer.run_daily_analysis()
                    
                    # Store result
                    self._add_to_history("daily", result)
                    
                    if result.get("success"):
                        self.logger.info("✅ Daily analysis completed successfully")
                    else:
                        self.logger.warning("⚠️ Daily analysis completed with errors")
                        
                except Exception as e:
                    self.logger.error(f"❌ Scheduled daily analysis failed: {e}")
                    
        except asyncio.CancelledError:
            self.logger.info("🛑 Daily scheduler cancelled")
        except Exception as e:
            self.logger.error(f"❌ Daily scheduler error: {e}")
    
    def _add_to_history(self, analysis_type: str, result: Dict[str, Any]):
        """Add analysis result to history"""
        try:
            history_entry = {
                "timestamp": datetime.now().isoformat(),
                "analysis_type": analysis_type,
                "success": result.get("success", False),
                "ready_for_broadcast": result.get("ready_for_broadcast", False),
                "error": result.get("error")
            }
            
            self.analysis_history.append(history_entry)
            
            # Limit history size
            if len(self.analysis_history) > self.max_history_size:
                self.analysis_history = self.analysis_history[-self.max_history_size:]
                
        except Exception as e:
            self.logger.error(f"❌ Failed to add to history: {e}")
    
    async def run_manual_analysis(self, analysis_type: str = "hourly") -> Dict[str, Any]:
        """Run manual analysis outside of schedule"""
        try:
            self.logger.info(f"🔧 Running manual {analysis_type} analysis")
            
            if analysis_type == "hourly":
                result = await self.radio_analyzer.run_hourly_analysis()
            elif analysis_type == "daily":
                result = await self.radio_analyzer.run_daily_analysis()
            else:
                raise ValueError(f"Invalid analysis type: {analysis_type}")
            
            # Store result
            self._add_to_history(f"manual_{analysis_type}", result)
            
            self.logger.info(f"✅ Manual {analysis_type} analysis completed")
            return result
            
        except Exception as e:
            self.logger.error(f"❌ Manual {analysis_type} analysis failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "analysis_type": f"manual_{analysis_type}",
                "success": False,
                "error": str(e)
            }
    
    async def get_scheduler_status(self) -> Dict[str, Any]:
        """Get current scheduler status"""
        try:
            status = {
                "timestamp": datetime.now().isoformat(),
                "is_running": self.is_running,
                "hourly_enabled": self.hourly_enabled,
                "daily_enabled": self.daily_enabled,
                "tasks": {
                    "hourly_task": self.hourly_task is not None and not self.hourly_task.done(),
                    "daily_task": self.daily_task is not None and not self.daily_task.done()
                },
                "history_count": len(self.analysis_history),
                "last_analysis": self.analysis_history[-1] if self.analysis_history else None
            }
            
            # Get analyzer status
            analyzer_status = await self.radio_analyzer.get_analysis_status()
            status["analyzer_status"] = analyzer_status
            
            return status
            
        except Exception as e:
            self.logger.error(f"❌ Failed to get scheduler status: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    async def get_analysis_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent analysis history"""
        try:
            return self.analysis_history[-limit:]
            
        except Exception as e:
            self.logger.error(f"❌ Failed to get analysis history: {e}")
            return []
    
    async def get_latest_insights(self) -> Dict[str, Any]:
        """Get the latest analysis insights"""
        try:
            return await self.radio_analyzer.get_latest_insights()
            
        except Exception as e:
            self.logger.error(f"❌ Failed to get latest insights: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    async def test_scheduler(self) -> Dict[str, Any]:
        """Test the complete scheduler system"""
        try:
            self.logger.info("🧪 Testing Radio Scheduler")
            
            # Test analyzer
            analyzer_test = await self.radio_analyzer.test_analysis_pipeline()
            
            # Test manual analysis
            manual_hourly = await self.run_manual_analysis("hourly")
            manual_daily = await self.run_manual_analysis("daily")
            
            # Test status
            status = await self.get_scheduler_status()
            
            test_result = {
                "timestamp": datetime.now().isoformat(),
                "test_type": "scheduler_system",
                "analyzer_test": analyzer_test.get("overall_success", False),
                "manual_hourly": manual_hourly.get("success", False),
                "manual_daily": manual_daily.get("success", False),
                "scheduler_status": status.get("is_running", False),
                "overall_success": all([
                    analyzer_test.get("overall_success", False),
                    manual_hourly.get("success", False),
                    manual_daily.get("success", False),
                    status.get("is_running", False)
                ])
            }
            
            self.logger.info(f"🧪 Scheduler test completed: {'✅ Success' if test_result['overall_success'] else '❌ Failed'}")
            return test_result
            
        except Exception as e:
            self.logger.error(f"❌ Scheduler test failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "test_type": "scheduler_system",
                "overall_success": False,
                "error": str(e)
            }

