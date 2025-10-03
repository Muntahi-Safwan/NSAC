#!/usr/bin/env python3
"""
Simple Radio Edge Server - Audio File Generator
Generates audio files from environmental insights and saves them to a folder
"""

import logging
import os
from datetime import datetime
from typing import Dict, Any
from pathlib import Path
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json

# Import simple audio generation service
from simple_audio_generator import SimpleAudioGenerator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Simple Radio Edge Server",
    description="Simple audio file generator for environmental insights",
    version="1.0.0"
)

# Data models
class InsightRequest(BaseModel):
    title: str
    message: str
    priority: str = "medium"
    location: str = "North America"

class AudioResponse(BaseModel):
    success: bool
    audio_file: str
    message: str
    timestamp: str

# Global services
audio_generator = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global audio_generator
    
    logger.info("🚀 Starting Simple Radio Edge Server")
    
    try:
        # Initialize audio generator
        audio_generator = SimpleAudioGenerator()
        logger.info("✅ Simple audio generator initialized")
        
        # Create audio output directory
        audio_dir = Path("/app/audio")
        audio_dir.mkdir(exist_ok=True)
        logger.info(f"✅ Audio directory ready: {audio_dir}")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "simple-radio-edge-server",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/status")
async def get_status():
    """Get service status"""
    audio_dir = Path("/app/audio")
    audio_files = list(audio_dir.glob("*.wav")) if audio_dir.exists() else []
    
    return {
        "service": "simple-radio-edge-server",
        "status": "running",
        "audio_generator": "initialized" if audio_generator else "not_initialized",
        "audio_directory": str(audio_dir),
        "audio_files_count": len(audio_files),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/generate-audio", response_model=AudioResponse)
async def generate_audio(insight: InsightRequest):
    """Generate audio file from text insight"""
    try:
        if not audio_generator:
            raise HTTPException(status_code=503, detail="Audio generator not initialized")
        
        logger.info(f"🎵 Generating audio for: {insight.title}")
        
        # Create insights data structure
        insights_data = {
            "radio_script": insight.message,
            "headline": insight.title,
            "safety_advice": f"Stay safe in {insight.location}",
            "priority": insight.priority,
            "timestamp": datetime.now().isoformat()
        }
        
        # Generate audio package
        audio_package = await audio_generator.generate_audio_insights(insights_data)
        
        if audio_package.get("success", False):
            audio_file = audio_package.get("audio_file", "")
            logger.info(f"✅ Audio generated successfully: {audio_file}")
            
            return AudioResponse(
                success=True,
                audio_file=audio_file,
                message=f"Audio file generated and saved to: {audio_file}",
                timestamp=datetime.now().isoformat()
            )
        else:
            error_msg = audio_package.get("error", "Unknown error")
            logger.error(f"❌ Audio generation failed: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Audio generation failed: {error_msg}")
        
    except Exception as e:
        logger.error(f"❌ Error generating audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/audio-files")
async def list_audio_files():
    """List all generated audio files"""
    try:
        audio_dir = Path("/app/audio")
        
        if not audio_dir.exists():
            return {
                "audio_files": [],
                "count": 0,
                "directory": str(audio_dir),
                "message": "Audio directory does not exist"
            }
        
        audio_files = []
        for file_path in audio_dir.glob("*.wav"):
            stat = file_path.stat()
            audio_files.append({
                "filename": file_path.name,
                "path": str(file_path),
                "size_bytes": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
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

@app.post("/test-audio")
async def test_audio_generation():
    """Test audio generation with sample data"""
    try:
        if not audio_generator:
            raise HTTPException(status_code=503, detail="Audio generator not initialized")
        
        # Create test insight
        test_insight = InsightRequest(
            title="Test Environmental Alert",
            message="This is a test broadcast from the NSAC Radio Edge Server. Air quality is good today with no significant environmental concerns.",
            priority="low",
            location="Test Area"
        )
        
        logger.info("🧪 Testing audio generation...")
        
        # Generate test audio
        result = await generate_audio(test_insight)
        
        return {
            "test_result": result.dict(),
            "message": "Test audio generation completed successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Test audio generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/audio-files/{filename}")
async def delete_audio_file(filename: str):
    """Delete a specific audio file"""
    try:
        audio_dir = Path("/app/audio")
        file_path = audio_dir / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Audio file not found: {filename}")
        
        # Verify it's a wav file for safety
        if file_path.suffix.lower() != '.wav':
            raise HTTPException(status_code=400, detail="Only .wav files can be deleted")
        
        file_path.unlink()
        logger.info(f"🗑️ Deleted audio file: {filename}")
        
        return {
            "success": True,
            "message": f"Audio file deleted: {filename}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error deleting audio file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def main():
    """Main entry point"""
    logger.info("🚀 Starting Simple NSAC Radio Edge Server")
    
    # Print startup info
    audio_dir = Path("/app/audio")
    print(f"📁 Audio files will be saved to: {audio_dir}")
    print(f"🌐 Server will be available at: http://localhost:8000")
    print(f"📋 API documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
