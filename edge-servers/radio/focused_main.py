#!/usr/bin/env python3
"""
Focused Radio Edge Server
Gets latest data from database, generates insights with Gemini AI, and creates audio files
"""

import logging
import os
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List
from pathlib import Path
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json

# Database imports
import asyncpg
from prisma import Prisma

# AI imports
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Audio imports
try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Focused Radio Edge Server",
    description="Gets latest data from database and generates audio insights with Gemini AI",
    version="1.0.0"
)

# Data models
class InsightResponse(BaseModel):
    success: bool
    audio_file: str
    insight_text: str
    data_summary: Dict[str, Any]
    timestamp: str

# Global variables
prisma = None
gemini_model = None
audio_dir = Path("/app/audio")
tts_engine = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global prisma, gemini_model, tts_engine
    
    logger.info("🚀 Starting Focused Radio Edge Server")
    
    try:
        # Initialize database
        prisma = Prisma()
        await prisma.connect()
        logger.info("✅ Database connected")
        
        # Initialize Gemini AI
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key and GEMINI_AVAILABLE:
            genai.configure(api_key=gemini_api_key)
            gemini_model = genai.GenerativeModel('gemini-pro')
            logger.info("✅ Gemini AI initialized")
        else:
            logger.warning("⚠️ Gemini AI not available - will use fallback insights")
        
        # Initialize TTS
        if PYTTSX3_AVAILABLE:
            tts_engine = pyttsx3.init()
            tts_engine.setProperty('rate', 150)
            tts_engine.setProperty('volume', 0.9)
            logger.info("✅ TTS engine initialized")
        else:
            logger.warning("⚠️ TTS not available - will create text files")
        
        # Create audio directory
        audio_dir.mkdir(exist_ok=True)
        logger.info(f"✅ Audio directory ready: {audio_dir}")
        
        # Get radio coverage area from environment
        coverage_area = os.getenv("RADIO_COVERAGE_AREA", "North America")
        logger.info(f"📡 Radio coverage area: {coverage_area}")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "focused-radio-edge-server",
        "gemini_available": GEMINI_AVAILABLE and gemini_model is not None,
        "tts_available": PYTTSX3_AVAILABLE and tts_engine is not None,
        "coverage_area": os.getenv("RADIO_COVERAGE_AREA", "North America"),
        "timestamp": datetime.now().isoformat()
    }

async def get_latest_environmental_data() -> Dict[str, Any]:
    """Get latest environmental data from database for the radio coverage area"""
    try:
        coverage_area = os.getenv("RADIO_COVERAGE_AREA", "North America")
        
        # Get latest air quality data
        air_quality_data = []
        try:
            # Query air quality data for the last 24 hours
            query = """
            SELECT 
                location,
                "aqiValue",
                "pm25Value",
                "pm10Value",
                "o3Value",
                "coValue",
                "no2Value",
                "so2Value",
                "recordedAt"
            FROM air_quality_data 
            WHERE "recordedAt" >= NOW() - INTERVAL '24 hours'
            AND (location ILIKE $1 OR $1 = 'World')
            ORDER BY "recordedAt" DESC
            LIMIT 50
            """
            
            result = await prisma.execute_raw(query, f"%{coverage_area}%")
            
            if isinstance(result, list) and len(result) > 0:
                for row in result:
                    if isinstance(row, (list, tuple)) and len(row) >= 9:
                        air_quality_data.append({
                            "location": row[0],
                            "aqi": row[1],
                            "pm25": row[2],
                            "pm10": row[3],
                            "o3": row[4],
                            "co": row[5],
                            "no2": row[6],
                            "so2": row[7],
                            "timestamp": row[8]
                        })
                    elif isinstance(row, dict):
                        air_quality_data.append({
                            "location": row.get("location"),
                            "aqi": row.get("aqiValue"),
                            "pm25": row.get("pm25Value"),
                            "pm10": row.get("pm10Value"),
                            "o3": row.get("o3Value"),
                            "co": row.get("coValue"),
                            "no2": row.get("no2Value"),
                            "so2": row.get("so2Value"),
                            "timestamp": row.get("recordedAt")
                        })
        except Exception as e:
            logger.warning(f"⚠️ Could not fetch air quality data: {e}")
        
        # Get latest wildfire data
        wildfire_data = []
        try:
            # Query wildfire data for the last 24 hours
            query = """
            SELECT 
                latitude,
                longitude,
                brightness,
                frp,
                "acqDate",
                "acqTime",
                satellite,
                confidence
            FROM fire_detections 
            WHERE "acqDate" >= CURRENT_DATE - INTERVAL '1 day'
            ORDER BY "acqDate" DESC, "acqTime" DESC
            LIMIT 20
            """
            
            result = await prisma.execute_raw(query)
            
            if isinstance(result, list) and len(result) > 0:
                for row in result:
                    if isinstance(row, (list, tuple)) and len(row) >= 8:
                        wildfire_data.append({
                            "latitude": row[0],
                            "longitude": row[1],
                            "brightness": row[2],
                            "frp": row[3],
                            "date": row[4],
                            "time": row[5],
                            "satellite": row[6],
                            "confidence": row[7]
                        })
                    elif isinstance(row, dict):
                        wildfire_data.append({
                            "latitude": row.get("latitude"),
                            "longitude": row.get("longitude"),
                            "brightness": row.get("brightness"),
                            "frp": row.get("frp"),
                            "date": row.get("acqDate"),
                            "time": row.get("acqTime"),
                            "satellite": row.get("satellite"),
                            "confidence": row.get("confidence")
                        })
        except Exception as e:
            logger.warning(f"⚠️ Could not fetch wildfire data: {e}")
        
        return {
            "coverage_area": coverage_area,
            "air_quality_data": air_quality_data,
            "wildfire_data": wildfire_data,
            "data_timestamp": datetime.now().isoformat(),
            "air_quality_count": len(air_quality_data),
            "wildfire_count": len(wildfire_data)
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting environmental data: {e}")
        return {
            "coverage_area": coverage_area,
            "air_quality_data": [],
            "wildfire_data": [],
            "error": str(e),
            "data_timestamp": datetime.now().isoformat()
        }

async def generate_insight_with_gemini(data: Dict[str, Any]) -> str:
    """Generate environmental insight using Gemini AI"""
    try:
        if not gemini_model:
            return await generate_fallback_insight(data)
        
        coverage_area = data.get("coverage_area", "North America")
        air_quality_data = data.get("air_quality_data", [])
        wildfire_data = data.get("wildfire_data", [])
        
        # Create prompt for Gemini
        prompt = f"""
Create a 30-60 second radio broadcast script for environmental conditions in {coverage_area}.

DATA SUMMARY:
- Air Quality Stations: {len(air_quality_data)}
- Wildfire Detections: {len(wildfire_data)}

AIR QUALITY DATA (last 24 hours):
"""
        
        if air_quality_data:
            # Add sample air quality data
            for i, station in enumerate(air_quality_data[:3]):  # Show first 3 stations
                location = station.get("location", "Unknown")
                aqi = station.get("aqi", "N/A")
                timestamp = station.get("timestamp", "Unknown")
                prompt += f"- {location}: AQI {aqi} at {timestamp}\n"
        else:
            prompt += "- No recent air quality data available\n"
        
        prompt += f"""
WILDFIRE DATA (last 24 hours):
"""
        
        if wildfire_data:
            # Add sample wildfire data
            for i, fire in enumerate(wildfire_data[:3]):  # Show first 3 fires
                lat = fire.get("latitude", "N/A")
                lon = fire.get("longitude", "N/A")
                confidence = fire.get("confidence", "N/A")
                satellite = fire.get("satellite", "N/A")
                prompt += f"- Fire detection at {lat}, {lon} (confidence: {confidence}, satellite: {satellite})\n"
        else:
            prompt += "- No recent wildfire detections\n"
        
        prompt += """
REQUIREMENTS:
- Write for radio broadcast (spoken word)
- Keep it conversational and informative
- Include specific data when available
- Mention safety advice if needed
- Keep it under 60 seconds when spoken
- Start with "This is your environmental update for [area]"
- End with safety reminders if applicable

Generate the radio script now:
"""
        
        # Generate response with Gemini
        response = gemini_model.generate_content(prompt)
        insight_text = response.text.strip()
        
        logger.info("✅ Gemini insight generated successfully")
        return insight_text
        
    except Exception as e:
        logger.error(f"❌ Gemini insight generation failed: {e}")
        return await generate_fallback_insight(data)

async def generate_fallback_insight(data: Dict[str, Any]) -> str:
    """Generate fallback insight without Gemini"""
    coverage_area = data.get("coverage_area", "North America")
    air_quality_count = len(data.get("air_quality_data", []))
    wildfire_count = len(data.get("wildfire_data", []))
    
    insight = f"""
This is your environmental update for {coverage_area}.

We have {air_quality_count} air quality stations reporting data in the last 24 hours. 
Wildfire monitoring shows {wildfire_count} fire detections in the region.

Please stay informed about local environmental conditions and follow safety guidelines from local authorities.

This environmental update was generated by the NSAC Radio Edge Server.
"""
    
    return insight.strip()

async def create_audio_file(insight_text: str, filename: str) -> str:
    """Create audio file from text"""
    try:
        if tts_engine:
            # Generate audio file
            audio_file_path = audio_dir / f"{filename}.wav"
            tts_engine.save_to_file(insight_text, str(audio_file_path))
            tts_engine.runAndWait()
            
            if audio_file_path.exists() and audio_file_path.stat().st_size > 0:
                logger.info(f"✅ Audio file created: {audio_file_path}")
                return str(audio_file_path)
        
        # Fallback: create text file
        text_file_path = audio_dir / f"{filename}.txt"
        with open(text_file_path, 'w', encoding='utf-8') as f:
            f.write(f"RADIO BROADCAST SCRIPT\n")
            f.write(f"Generated: {datetime.now().isoformat()}\n")
            f.write(f"Coverage Area: {os.getenv('RADIO_COVERAGE_AREA', 'North America')}\n\n")
            f.write(f"--- SCRIPT ---\n{insight_text}\n")
            f.write(f"\n--- TECHNICAL NOTES ---\n")
            f.write(f"- Estimated duration: {len(insight_text.split()) * 0.5:.1f} seconds\n")
            f.write(f"- Word count: {len(insight_text.split())}\n")
        
        logger.info(f"✅ Text file created: {text_file_path}")
        return str(text_file_path)
        
    except Exception as e:
        logger.error(f"❌ Error creating audio file: {e}")
        raise

@app.post("/generate-insight", response_model=InsightResponse)
async def generate_environmental_insight():
    """Generate environmental insight from latest database data"""
    try:
        logger.info("🔍 Getting latest environmental data...")
        
        # Get latest data
        data = await get_latest_environmental_data()
        
        # Generate insight with Gemini
        logger.info("🤖 Generating insight with Gemini AI...")
        insight_text = await generate_insight_with_gemini(data)
        
        # Create audio file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"environmental_insight_{timestamp}"
        
        logger.info("🎵 Creating audio file...")
        audio_file = await create_audio_file(insight_text, filename)
        
        # Create data summary
        data_summary = {
            "coverage_area": data.get("coverage_area"),
            "air_quality_stations": len(data.get("air_quality_data", [])),
            "wildfire_detections": len(data.get("wildfire_data", [])),
            "data_timestamp": data.get("data_timestamp"),
            "insight_length": len(insight_text.split()),
            "estimated_duration_seconds": len(insight_text.split()) * 0.5
        }
        
        logger.info("✅ Environmental insight generated successfully")
        
        return InsightResponse(
            success=True,
            audio_file=audio_file,
            insight_text=insight_text,
            data_summary=data_summary,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"❌ Error generating environmental insight: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def get_status():
    """Get service status and latest data summary"""
    try:
        data = await get_latest_environmental_data()
        
        return {
            "service": "focused-radio-edge-server",
            "status": "running",
            "coverage_area": data.get("coverage_area"),
            "latest_data": {
                "air_quality_stations": len(data.get("air_quality_data", [])),
                "wildfire_detections": len(data.get("wildfire_data", [])),
                "data_timestamp": data.get("data_timestamp")
            },
            "capabilities": {
                "gemini_available": GEMINI_AVAILABLE and gemini_model is not None,
                "tts_available": PYTTSX3_AVAILABLE and tts_engine is not None,
                "database_connected": prisma is not None
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/audio-files")
async def list_audio_files():
    """List generated audio files"""
    try:
        audio_files = []
        for file_path in audio_dir.glob("*"):
            if file_path.is_file():
                stat = file_path.stat()
                audio_files.append({
                    "filename": file_path.name,
                    "path": str(file_path),
                    "size_bytes": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "type": "audio" if file_path.suffix == ".wav" else "text"
                })
        
        # Sort by creation time (newest first)
        audio_files.sort(key=lambda x: x["created"], reverse=True)
        
        return {
            "audio_files": audio_files,
            "count": len(audio_files),
            "directory": str(audio_dir),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error listing audio files: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def main():
    """Main entry point"""
    logger.info("🚀 Starting Focused NSAC Radio Edge Server")
    
    # Print startup info
    coverage_area = os.getenv("RADIO_COVERAGE_AREA", "North America")
    print(f"📡 Radio coverage area: {coverage_area}")
    print(f"🎵 Audio files will be saved to: {audio_dir}")
    print(f"🌐 Server will be available at: http://localhost:8000")
    print(f"📋 API documentation: http://localhost:8000/docs")
    print(f"🤖 Gemini AI: {'✅ Available' if GEMINI_AVAILABLE else '❌ Not available'}")
    
    uvicorn.run(
        "focused_main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
