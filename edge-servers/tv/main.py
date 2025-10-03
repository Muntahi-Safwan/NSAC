#!/usr/bin/env python3
"""
TV Edge Server Main Application
Receives NSAC alerts and broadcasts them via television channels
"""

import asyncio
import logging
import sys
from datetime import datetime
from typing import Dict, List
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json

# Add data-processing to path
sys.path.append('/app/data-processing')

# Import independent data processing modules
from data_processing.wildfire.main import FireSystem
from data_processing.air_quality.main import AirQualityMainSystem

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="NSAC TV Edge Server",
    description="Television broadcast edge server for NSAC alerts",
    version="1.0.0"
)

# Data models
class AlertRequest(BaseModel):
    alert_type: str
    priority: str
    title: str
    message: str
    location: str = None
    coordinates: Dict = None
    broadcast_channels: List[str] = ["cable", "satellite"]
    repeat_count: int = 1
    overlay_enabled: bool = True
    crawler_enabled: bool = True

class AlertResponse(BaseModel):
    status: str
    alert_id: str
    message: str
    broadcast_count: int = 0

# Global services
fire_system = None
air_quality_system = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global fire_system, air_quality_system
    
    logger.info("🚀 Starting TV Edge Server")
    
    try:
        # Initialize fire system
        fire_system = FireSystem()
        logger.info("✅ Fire system initialized")
        
        # Initialize air quality system
        air_quality_system = AirQualityMainSystem()
        await air_quality_system.initialize_components()
        logger.info("✅ Air quality system initialized")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "tv-edge-server"
    }

@app.get("/status")
async def get_status():
    """Get service status"""
    return {
        "service": "tv-edge-server",
        "status": "running",
        "fire_system": "initialized" if fire_system else "not_initialized",
        "air_quality_system": "initialized" if air_quality_system else "not_initialized",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/alert", response_model=AlertResponse)
async def process_alert(alert: AlertRequest):
    """Process and broadcast an alert via television"""
    try:
        logger.info(f"📺 Processing TV alert: {alert.title}")
        
        # TODO: Implement actual TV broadcast logic
        # For now, just log the alert
        logger.info(f"   Alert Type: {alert.alert_type}")
        logger.info(f"   Priority: {alert.priority}")
        logger.info(f"   Location: {alert.location}")
        logger.info(f"   Channels: {alert.broadcast_channels}")
        logger.info(f"   Repeat Count: {alert.repeat_count}")
        logger.info(f"   Overlay Enabled: {alert.overlay_enabled}")
        logger.info(f"   Crawler Enabled: {alert.crawler_enabled}")
        
        # Simulate broadcast
        broadcast_count = len(alert.broadcast_channels) * alert.repeat_count
        
        return AlertResponse(
            status="broadcasted",
            alert_id=f"tv_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            message=f"Alert broadcasted on {len(alert.broadcast_channels)} channels",
            broadcast_count=broadcast_count
        )
        
    except Exception as e:
        logger.error(f"❌ Error processing alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alerts/recent")
async def get_recent_alerts():
    """Get recent alerts from data processing systems"""
    try:
        alerts = []
        
        # Get fire alerts
        if fire_system:
            try:
                fire_alerts = await fire_system.get_recent_alerts()
                alerts.extend(fire_alerts)
            except Exception as e:
                logger.warning(f"Could not get fire alerts: {e}")
        
        # Get air quality alerts
        if air_quality_system:
            try:
                # TODO: Implement air quality alert retrieval
                pass
            except Exception as e:
                logger.warning(f"Could not get air quality alerts: {e}")
        
        return {
            "alerts": alerts,
            "count": len(alerts),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting recent alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/broadcast")
async def test_broadcast(channel: str, message: str):
    """Test TV broadcast"""
    try:
        logger.info(f"📺 Testing broadcast on {channel}: {message}")
        
        # TODO: Implement actual TV broadcast
        # For now, just log
        logger.info("✅ Broadcast test completed (simulated)")
        
        return {
            "status": "success",
            "message": "Broadcast test completed",
            "channel": channel,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Broadcast test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/overlay")
async def test_overlay(text: str, duration: int = 10):
    """Test video overlay generation"""
    try:
        logger.info(f"📺 Testing overlay: {text} (duration: {duration}s)")
        
        # TODO: Implement actual overlay generation
        # For now, just log
        logger.info("✅ Overlay test completed (simulated)")
        
        return {
            "status": "success",
            "message": "Overlay test completed",
            "text": text,
            "duration": duration,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Overlay test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/crawler")
async def test_crawler(text: str, speed: int = 30):
    """Test crawler text generation"""
    try:
        logger.info(f"📺 Testing crawler: {text} (speed: {speed})")
        
        # TODO: Implement actual crawler generation
        # For now, just log
        logger.info("✅ Crawler test completed (simulated)")
        
        return {
            "status": "success",
            "message": "Crawler test completed",
            "text": text,
            "speed": speed,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Crawler test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def main():
    """Main entry point"""
    logger.info("🚀 Starting NSAC TV Edge Server")
    
    # Run the FastAPI application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False
    )

if __name__ == "__main__":
    main()
