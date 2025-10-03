#!/usr/bin/env python3
"""
Radio Edge Server Data Analyzer
Analyzes air quality and wildfire data to generate insights for radio broadcasting
"""

import asyncio
import logging
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
from pathlib import Path

# Add data-processing to path
sys.path.append('/app/data-processing')

from data_processing.wildfire.fire_database import FireDatabase
from data_processing.air_quality.realtime.database import AirQualityDatabase

# Setup logging
logger = logging.getLogger(__name__)


class DataAnalyzer:
    """Analyzes environmental data and generates insights for radio broadcasting"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.fire_db = None
        self.air_quality_db = None
    
    async def initialize(self):
        """Initialize database connections"""
        try:
            self.fire_db = FireDatabase()
            self.air_quality_db = AirQualityDatabase()
            self.logger.info("✅ Data analyzer databases initialized")
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize data analyzer: {e}")
            raise
    
    async def analyze_hourly_data(self) -> Dict[str, Any]:
        """Analyze the last hour of data for immediate insights"""
        try:
            self.logger.info("📊 Starting hourly data analysis")
            
            # Get time range for last hour
            now = datetime.now()
            one_hour_ago = now - timedelta(hours=1)
            
            insights = {
                "timestamp": now.isoformat(),
                "analysis_type": "hourly",
                "wildfire_insights": await self._analyze_wildfire_data(one_hour_ago, now),
                "air_quality_insights": await self._analyze_air_quality_data(one_hour_ago, now),
                "overall_risk": "low",
                "recommendations": []
            }
            
            # Determine overall risk level
            insights["overall_risk"] = self._calculate_overall_risk(insights)
            insights["recommendations"] = self._generate_recommendations(insights)
            
            self.logger.info(f"✅ Hourly analysis completed - Overall risk: {insights['overall_risk']}")
            return insights
            
        except Exception as e:
            self.logger.error(f"❌ Hourly analysis failed: {e}")
            raise
    
    async def analyze_daily_data(self) -> Dict[str, Any]:
        """Analyze the last 24 hours of data for comprehensive insights"""
        try:
            self.logger.info("📊 Starting daily data analysis")
            
            # Get time range for last 24 hours
            now = datetime.now()
            one_day_ago = now - timedelta(days=1)
            
            insights = {
                "timestamp": now.isoformat(),
                "analysis_type": "daily",
                "wildfire_insights": await self._analyze_wildfire_data(one_day_ago, now),
                "air_quality_insights": await self._analyze_air_quality_data(one_day_ago, now),
                "trends": await self._analyze_trends(one_day_ago, now),
                "overall_risk": "low",
                "recommendations": []
            }
            
            # Determine overall risk level
            insights["overall_risk"] = self._calculate_overall_risk(insights)
            insights["recommendations"] = self._generate_recommendations(insights)
            
            self.logger.info(f"✅ Daily analysis completed - Overall risk: {insights['overall_risk']}")
            return insights
            
        except Exception as e:
            self.logger.error(f"❌ Daily analysis failed: {e}")
            raise
    
    async def _analyze_wildfire_data(self, start_time: datetime, end_time: datetime) -> Dict[str, Any]:
        """Analyze wildfire data for the given time range"""
        try:
            if not self.fire_db:
                return {"error": "Fire database not initialized"}
            
            # Get fire statistics for the time range
            stats = await self.fire_db.get_fire_statistics()
            
            # Get recent fire alerts
            alerts = await self.fire_db.get_fire_alerts()
            
            # Get fires in North America (filter by coordinates)
            na_fires = []
            if alerts:
                for alert in alerts:
                    lat = alert.get('latitude', 0)
                    lon = alert.get('longitude', 0)
                    # North America bounds: roughly 15°N to 70°N, 170°W to 50°W
                    if 15 <= lat <= 70 and -170 <= lon <= -50:
                        na_fires.append(alert)
            
            # Calculate risk levels
            fire_count = len(na_fires)
            high_intensity_fires = len([f for f in na_fires if f.get('frp', 0) > 100])
            
            if fire_count == 0:
                risk_level = "none"
                risk_description = "No active wildfires detected in North America"
            elif fire_count <= 5 and high_intensity_fires == 0:
                risk_level = "low"
                risk_description = f"{fire_count} small wildfires detected"
            elif fire_count <= 15 and high_intensity_fires <= 2:
                risk_level = "moderate"
                risk_description = f"{fire_count} wildfires detected, {high_intensity_fires} high intensity"
            else:
                risk_level = "high"
                risk_description = f"{fire_count} wildfires detected, {high_intensity_fires} high intensity fires"
            
            return {
                "fire_count": fire_count,
                "high_intensity_fires": high_intensity_fires,
                "risk_level": risk_level,
                "risk_description": risk_description,
                "total_detections": stats.get("total_detections", 0),
                "latest_date": stats.get("latest_date"),
                "active_fires": na_fires[:10]  # Top 10 most recent
            }
            
        except Exception as e:
            self.logger.error(f"❌ Wildfire analysis failed: {e}")
            return {"error": str(e)}
    
    async def _analyze_air_quality_data(self, start_time: datetime, end_time: datetime) -> Dict[str, Any]:
        """Analyze air quality data for the given time range"""
        try:
            if not self.air_quality_db:
                return {"error": "Air quality database not initialized"}
            
            # Get recent air quality data (this would need to be implemented in AirQualityDatabase)
            # For now, return placeholder data
            return {
                "aqi_average": 45,
                "aqi_range": "Good",
                "pollutants": {
                    "pm25": {"average": 12.5, "max": 25.0, "status": "Good"},
                    "o3": {"average": 0.08, "max": 0.12, "status": "Good"},
                    "no2": {"average": 0.03, "max": 0.05, "status": "Good"}
                },
                "risk_level": "low",
                "risk_description": "Air quality is generally good across North America"
            }
            
        except Exception as e:
            self.logger.error(f"❌ Air quality analysis failed: {e}")
            return {"error": str(e)}
    
    async def _analyze_trends(self, start_time: datetime, end_time: datetime) -> Dict[str, Any]:
        """Analyze trends in the data over the time period"""
        try:
            # This would analyze trends in air quality and wildfire data
            # For now, return placeholder trend data
            return {
                "air_quality_trend": "stable",
                "wildfire_trend": "increasing",
                "temperature_trend": "rising",
                "trend_description": "Wildfire activity showing seasonal increase"
            }
            
        except Exception as e:
            self.logger.error(f"❌ Trend analysis failed: {e}")
            return {"error": str(e)}
    
    def _calculate_overall_risk(self, insights: Dict[str, Any]) -> str:
        """Calculate overall risk level based on all insights"""
        wildfire_risk = insights.get("wildfire_insights", {}).get("risk_level", "none")
        air_quality_risk = insights.get("air_quality_insights", {}).get("risk_level", "low")
        
        # Risk hierarchy: none < low < moderate < high < critical
        risk_levels = {"none": 0, "low": 1, "moderate": 2, "high": 3, "critical": 4}
        
        wildfire_score = risk_levels.get(wildfire_risk, 0)
        air_quality_score = risk_levels.get(air_quality_risk, 0)
        
        max_score = max(wildfire_score, air_quality_score)
        
        # Map score back to risk level
        for risk, score in risk_levels.items():
            if max_score == score:
                return risk
        
        return "low"
    
    def _generate_recommendations(self, insights: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on the analysis"""
        recommendations = []
        
        wildfire_insights = insights.get("wildfire_insights", {})
        air_quality_insights = insights.get("air_quality_insights", {})
        
        # Wildfire recommendations
        if wildfire_insights.get("risk_level") == "high":
            recommendations.append("⚠️ High wildfire activity detected. Monitor local conditions and be prepared for potential evacuations.")
        elif wildfire_insights.get("risk_level") == "moderate":
            recommendations.append("🔥 Moderate wildfire activity. Stay informed about local fire conditions.")
        
        # Air quality recommendations
        if air_quality_insights.get("risk_level") == "high":
            recommendations.append("😷 Poor air quality detected. Consider staying indoors and limiting outdoor activities.")
        elif air_quality_insights.get("risk_level") == "moderate":
            recommendations.append("🌫️ Moderate air quality. Sensitive individuals should limit outdoor activities.")
        
        # General recommendations
        if not recommendations:
            recommendations.append("✅ Environmental conditions are generally good. Continue normal activities.")
        
        return recommendations
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            if self.fire_db:
                await self.fire_db.close()
            if self.air_quality_db:
                await self.air_quality_db.close()
            self.logger.info("🧹 Data analyzer cleanup completed")
        except Exception as e:
            self.logger.error(f"❌ Cleanup failed: {e}")

