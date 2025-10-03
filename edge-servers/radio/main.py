#!/usr/bin/env python3
"""
Radio Edge Server Main Application
Receives NSAC alerts and broadcasts them via radio frequencies
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

# Add data-processing to Python path
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "data-processing"))

# Import independent data processing modules
from wildfire.main import FireSystem
from air_quality.main import AirQualityMainSystem

# Import radio analysis services
from services.radio_scheduler import RadioScheduler
from services.radio_broadcaster import RadioBroadcaster

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="NSAC Radio Edge Server",
    description="Radio broadcast edge server for NSAC alerts",
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
    broadcast_frequencies: List[str] = ["AM", "FM"]
    repeat_count: int = 1
    tone_alert: bool = False

class AlertResponse(BaseModel):
    status: str
    alert_id: str
    message: str
    broadcast_count: int = 0

# Global services
fire_system = None
air_quality_system = None
radio_scheduler = None
radio_broadcaster = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global fire_system, air_quality_system, radio_scheduler, radio_broadcaster
    
    logger.info("🚀 Starting Radio Edge Server")
    
    try:
        # Initialize fire system
        fire_system = FireSystem()
        logger.info("✅ Fire system initialized")
        
        # Initialize air quality system
        air_quality_system = AirQualityMainSystem()
        await air_quality_system.initialize_components()
        logger.info("✅ Air quality system initialized")
        
        # Initialize radio scheduler with analysis system
        radio_scheduler = RadioScheduler()
        await radio_scheduler.initialize()
        await radio_scheduler.start_scheduler()
        logger.info("✅ Radio analysis scheduler initialized")
        
        # Initialize radio broadcaster (simulated by default)
        import os
        broadcaster_type = os.getenv("BROADCASTER_TYPE", "simulated")
        radio_broadcaster = RadioBroadcaster(broadcaster_type)
        await radio_broadcaster.initialize()
        logger.info(f"✅ Radio broadcaster ({broadcaster_type}) initialized")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "radio-edge-server"
    }

@app.get("/status")
async def get_status():
    """Get service status"""
    return {
        "service": "radio-edge-server",
        "status": "running",
        "fire_system": "initialized" if fire_system else "not_initialized",
        "air_quality_system": "initialized" if air_quality_system else "not_initialized",
        "radio_scheduler": "initialized" if radio_scheduler else "not_initialized",
        "radio_broadcaster": "initialized" if radio_broadcaster else "not_initialized",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/alert", response_model=AlertResponse)
async def process_alert(alert: AlertRequest):
    """Process and broadcast an alert via radio"""
    try:
        logger.info(f"📻 Processing radio alert: {alert.title}")
        
        if not radio_broadcaster:
            raise HTTPException(status_code=503, detail="Radio broadcaster not initialized")
        
        # Prepare alert data
        alert_data = {
            "alert_type": alert.alert_type,
            "priority": alert.priority,
            "title": alert.title,
            "message": alert.message,
            "location": alert.location,
            "coordinates": alert.coordinates
        }
        
        # Broadcast on each frequency
        broadcast_results = []
        for frequency in alert.broadcast_frequencies:
            for _ in range(alert.repeat_count):
                result = await radio_broadcaster.broadcast_alert(alert_data, frequency)
                broadcast_results.append(result)
        
        # Count successful broadcasts
        successful_broadcasts = sum(1 for r in broadcast_results if r.get("success", False))
        
        return AlertResponse(
            status="broadcasted" if successful_broadcasts > 0 else "failed",
            alert_id=f"radio_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            message=f"Alert broadcasted on {successful_broadcasts}/{len(broadcast_results)} attempts",
            broadcast_count=successful_broadcasts
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
async def test_broadcast(frequency: str, message: str):
    """Test radio broadcast"""
    try:
        logger.info(f"📻 Testing broadcast on {frequency}: {message}")
        
        # TODO: Implement actual radio broadcast
        # For now, just log
        logger.info("✅ Broadcast test completed (simulated)")
        
        return {
            "status": "success",
            "message": "Broadcast test completed",
            "frequency": frequency,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Broadcast test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/audio")
async def test_audio(text: str, output_file: str = None):
    """Test audio generation"""
    try:
        logger.info(f"🔊 Testing audio generation: {text}")
        
        # TODO: Implement actual audio generation
        # For now, just log
        logger.info("✅ Audio generation test completed (simulated)")
        
        return {
            "status": "success",
            "message": "Audio generation test completed",
            "text": text,
            "output_file": output_file,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Audio generation test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/status")
async def get_analysis_status():
    """Get radio analysis system status"""
    try:
        if not radio_scheduler:
            raise HTTPException(status_code=503, detail="Radio scheduler not initialized")
        
        status = await radio_scheduler.get_scheduler_status()
        return status
        
    except Exception as e:
        logger.error(f"❌ Failed to get analysis status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/insights")
async def get_latest_insights():
    """Get latest radio insights"""
    try:
        if not radio_scheduler:
            raise HTTPException(status_code=503, detail="Radio scheduler not initialized")
        
        insights = await radio_scheduler.get_latest_insights()
        return insights
        
    except Exception as e:
        logger.error(f"❌ Failed to get latest insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/history")
async def get_analysis_history(limit: int = 20):
    """Get analysis history"""
    try:
        if not radio_scheduler:
            raise HTTPException(status_code=503, detail="Radio scheduler not initialized")
        
        history = await radio_scheduler.get_analysis_history(limit)
        return {
            "history": history,
            "count": len(history),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get analysis history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analysis/run")
async def run_manual_analysis(analysis_type: str = "hourly"):
    """Run manual analysis"""
    try:
        if not radio_scheduler:
            raise HTTPException(status_code=503, detail="Radio scheduler not initialized")
        
        if analysis_type not in ["hourly", "daily"]:
            raise HTTPException(status_code=400, detail="Invalid analysis type. Use 'hourly' or 'daily'")
        
        result = await radio_scheduler.run_manual_analysis(analysis_type)
        return result
        
    except Exception as e:
        logger.error(f"❌ Manual analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analysis/test")
async def test_analysis_system():
    """Test the complete analysis system"""
    try:
        if not radio_scheduler:
            raise HTTPException(status_code=503, detail="Radio scheduler not initialized")
        
        test_result = await radio_scheduler.test_scheduler()
        return test_result
        
    except Exception as e:
        logger.error(f"❌ Analysis system test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broadcaster/status")
async def get_broadcaster_status():
    """Get radio broadcaster status"""
    try:
        if not radio_broadcaster:
            raise HTTPException(status_code=503, detail="Radio broadcaster not initialized")
        
        status = await radio_broadcaster.get_status()
        return status
        
    except Exception as e:
        logger.error(f"❌ Failed to get broadcaster status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broadcaster/frequencies")
async def get_available_frequencies():
    """Get available broadcasting frequencies"""
    try:
        if not radio_broadcaster:
            raise HTTPException(status_code=503, detail="Radio broadcaster not initialized")
        
        frequencies = radio_broadcaster.get_available_frequencies()
        return {
            "frequencies": frequencies,
            "count": len(frequencies),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get frequencies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broadcaster/broadcast")
async def broadcast_insights(frequency: str = "FM"):
    """Broadcast latest insights"""
    try:
        if not radio_broadcaster or not radio_scheduler:
            raise HTTPException(status_code=503, detail="Services not initialized")
        
        # Get latest insights
        insights = await radio_scheduler.get_latest_insights()
        if not insights or not insights.get("available"):
            raise HTTPException(status_code=404, detail="No insights available for broadcasting")
        
        # Broadcast the insights
        result = await radio_broadcaster.broadcast_insights(insights, frequency)
        return result
        
    except Exception as e:
        logger.error(f"❌ Failed to broadcast insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broadcaster/test")
async def test_broadcaster():
    """Test the radio broadcaster"""
    try:
        if not radio_broadcaster:
            raise HTTPException(status_code=503, detail="Radio broadcaster not initialized")
        
        # Test connection
        connection_ok = await radio_broadcaster.test_connection()
        
        # Test broadcast
        test_result = await radio_broadcaster.broadcast_text(
            "This is a test broadcast from the NSAC Radio Edge Server.",
            "FM",
            {"test": True, "timestamp": datetime.now().isoformat()}
        )
        
        return {
            "connection_test": connection_ok,
            "broadcast_test": test_result.get("success", False),
            "overall_success": connection_ok and test_result.get("success", False),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Broadcaster test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def main():
    """Main entry point"""
    logger.info("🚀 Starting NSAC Radio Edge Server")
    
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
