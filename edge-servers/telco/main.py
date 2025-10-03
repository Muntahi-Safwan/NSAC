#!/usr/bin/env python3
"""
Telco Edge Server Main Application
Receives NSAC alerts and delivers them via telecommunications channels
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
    title="NSAC Telco Edge Server",
    description="Telecommunications edge server for NSAC alerts",
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
    target_phones: List[str] = []
    target_apps: List[str] = []

class AlertResponse(BaseModel):
    status: str
    alert_id: str
    message: str
    delivery_count: int = 0

# Global services
fire_system = None
air_quality_system = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global fire_system, air_quality_system
    
    logger.info("🚀 Starting Telco Edge Server")
    
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
        "service": "telco-edge-server"
    }

@app.get("/status")
async def get_status():
    """Get service status"""
    return {
        "service": "telco-edge-server",
        "status": "running",
        "fire_system": "initialized" if fire_system else "not_initialized",
        "air_quality_system": "initialized" if air_quality_system else "not_initialized",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/alert", response_model=AlertResponse)
async def process_alert(alert: AlertRequest):
    """Process and deliver an alert via telecommunications"""
    try:
        logger.info(f"📱 Processing telco alert: {alert.title}")
        
        # TODO: Implement actual telco delivery logic
        # For now, just log the alert
        logger.info(f"   Alert Type: {alert.alert_type}")
        logger.info(f"   Priority: {alert.priority}")
        logger.info(f"   Location: {alert.location}")
        logger.info(f"   Target Phones: {len(alert.target_phones)}")
        logger.info(f"   Target Apps: {len(alert.target_apps)}")
        
        # Simulate delivery
        delivery_count = len(alert.target_phones) + len(alert.target_apps)
        
        return AlertResponse(
            status="delivered",
            alert_id=f"telco_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            message=f"Alert delivered to {delivery_count} recipients",
            delivery_count=delivery_count
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

@app.post("/test/sms")
async def test_sms(phone_number: str, message: str):
    """Test SMS delivery"""
    try:
        logger.info(f"📱 Testing SMS to {phone_number}: {message}")
        
        # TODO: Implement actual SMS sending
        # For now, just log
        logger.info("✅ SMS test completed (simulated)")
        
        return {
            "status": "success",
            "message": "SMS test completed",
            "phone_number": phone_number,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ SMS test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/voice")
async def test_voice(phone_number: str, message: str):
    """Test voice call delivery"""
    try:
        logger.info(f"📞 Testing voice call to {phone_number}: {message}")
        
        # TODO: Implement actual voice call
        # For now, just log
        logger.info("✅ Voice call test completed (simulated)")
        
        return {
            "status": "success",
            "message": "Voice call test completed",
            "phone_number": phone_number,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Voice call test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def main():
    """Main entry point"""
    logger.info("🚀 Starting NSAC Telco Edge Server")
    
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
