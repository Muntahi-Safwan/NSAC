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

# Import alert engine
from alert_engine.alert_engine import AlertEngine

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
alert_engine = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global alert_engine
    
    logger.info("🚀 Starting Telco Edge Server")
    
    try:
        # Initialize alert engine
        alert_engine = AlertEngine()
        await alert_engine.connect()
        logger.info("✅ Alert engine initialized")
        
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
        "alert_engine": "initialized" if alert_engine else "not_initialized",
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

@app.post("/alerts/analyze")
async def analyze_hazards():
    """Run alert engine analysis and return alerts"""
    try:
        if not alert_engine:
            raise HTTPException(status_code=503, detail="Alert engine not initialized")
        
        logger.info("🔍 Running alert engine analysis...")
        
        # Run alert analysis
        vulnerable_alerts, general_alerts = await alert_engine.run_alert_analysis()
        
        # Convert alerts to dictionaries for JSON response
        vulnerable_alerts_dict = []
        for alert in vulnerable_alerts:
            vulnerable_alerts_dict.append({
                "user_id": alert.user_id,
                "phone_number": alert.phone_number,
                "user_name": alert.user_name,
                "alert_type": alert.alert_type,
                "hazard_type": alert.hazard_type,
                "severity": alert.severity,
                "message": alert.message,
                "location": alert.location,
                "timestamp": alert.timestamp.isoformat()
            })
        
        general_alerts_dict = []
        for alert in general_alerts:
            general_alerts_dict.append({
                "alert_type": alert.alert_type,
                "hazard_type": alert.hazard_type,
                "severity": alert.severity,
                "message": alert.message,
                "location": alert.location,
                "timestamp": alert.timestamp.isoformat()
            })
        
        # Also display in terminal
        alert_engine.display_alerts(vulnerable_alerts, general_alerts)
        
        return {
            "status": "success",
            "vulnerable_alerts": vulnerable_alerts_dict,
            "general_alerts": general_alerts_dict,
            "total_alerts": len(vulnerable_alerts) + len(general_alerts),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error running alert analysis: {e}")
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
