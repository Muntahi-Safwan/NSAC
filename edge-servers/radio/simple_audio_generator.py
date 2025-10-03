#!/usr/bin/env python3
"""
Simple Audio Generator for Radio Edge Server
Generates basic audio files from text
"""

import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

# Simple TTS using pyttsx3
try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False

# Fallback: create text files if TTS fails
import json


class SimpleAudioGenerator:
    """Simple audio generator that creates audio files or text files"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.audio_dir = Path("/app/audio")
        self.audio_dir.mkdir(exist_ok=True)
        
        # Initialize TTS engine
        self.tts_engine = None
        self._initialize_tts()
    
    def _initialize_tts(self):
        """Initialize text-to-speech engine"""
        try:
            if PYTTSX3_AVAILABLE:
                self.tts_engine = pyttsx3.init()
                self.logger.info("✅ TTS engine initialized with pyttsx3")
            else:
                self.logger.warning("⚠️ pyttsx3 not available, will create text files instead")
        except Exception as e:
            self.logger.warning(f"⚠️ TTS initialization failed: {e}")
            self.logger.info("📝 Will create text files instead of audio files")
    
    def _clean_text_for_speech(self, text: str) -> str:
        """Clean text for better speech synthesis"""
        # Remove URLs
        import re
        text = re.sub(r'http[s]?://\S+', '', text)
        text = re.sub(r'www\.\S+', '', text)
        
        # Clean up extra spaces
        text = ' '.join(text.split())
        
        # Remove special characters that might cause issues
        text = re.sub(r'[^\w\s.,!?;:-]', '', text)
        
        return text.strip()
    
    def _estimate_duration(self, text: str) -> float:
        """Estimate audio duration in seconds"""
        # Rough estimate: 3 words per second
        word_count = len(text.split())
        return max(5.0, word_count / 3.0)
    
    async def generate_audio_insights(self, insights: Dict[str, Any]) -> Dict[str, Any]:
        """Generate audio file from insights"""
        try:
            self.logger.info("🎵 Generating audio insights")
            
            # Extract content
            radio_script = insights.get("radio_script", "")
            headline = insights.get("headline", "Environmental Update")
            priority = insights.get("priority", "medium")
            
            if not radio_script:
                return {
                    "success": False,
                    "error": "No radio script provided"
                }
            
            # Clean text for speech
            clean_text = self._clean_text_for_speech(radio_script)
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"radio_insight_{priority}_{timestamp}"
            
            # Try to generate audio file
            audio_file_path = None
            if self.tts_engine:
                try:
                    audio_file_path = await self._generate_audio_file(clean_text, filename)
                    if audio_file_path:
                        self.logger.info(f"✅ Audio file generated: {audio_file_path}")
                    else:
                        self.logger.warning("⚠️ Audio generation failed, creating text file instead")
                except Exception as e:
                    self.logger.warning(f"⚠️ Audio generation error: {e}, creating text file instead")
            
            # If audio generation failed, create text file
            if not audio_file_path:
                text_file_path = await self._generate_text_file(clean_text, filename, insights)
                if text_file_path:
                    self.logger.info(f"✅ Text file generated: {text_file_path}")
                    return {
                        "success": True,
                        "audio_file": str(text_file_path),
                        "type": "text",
                        "duration_seconds": self._estimate_duration(clean_text),
                        "ready_for_broadcast": True
                    }
                else:
                    return {
                        "success": False,
                        "error": "Failed to generate both audio and text files"
                    }
            else:
                return {
                    "success": True,
                    "audio_file": str(audio_file_path),
                    "type": "audio",
                    "duration_seconds": self._estimate_duration(clean_text),
                    "ready_for_broadcast": True
                }
                
        except Exception as e:
            self.logger.error(f"❌ Error generating audio insights: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _generate_audio_file(self, text: str, filename: str) -> Optional[str]:
        """Generate actual audio file using TTS"""
        try:
            if not self.tts_engine:
                return None
            
            audio_file_path = self.audio_dir / f"{filename}.wav"
            
            # Configure TTS
            self.tts_engine.setProperty('rate', 150)  # Speed of speech
            self.tts_engine.setProperty('volume', 0.9)  # Volume level
            
            # Save to file
            self.tts_engine.save_to_file(text, str(audio_file_path))
            self.tts_engine.runAndWait()
            
            # Check if file was created
            if audio_file_path.exists() and audio_file_path.stat().st_size > 0:
                return str(audio_file_path)
            else:
                return None
                
        except Exception as e:
            self.logger.error(f"❌ Audio file generation failed: {e}")
            return None
    
    async def _generate_text_file(self, text: str, filename: str, insights: Dict[str, Any]) -> Optional[str]:
        """Generate text file as fallback"""
        try:
            text_file_path = self.audio_dir / f"{filename}.txt"
            
            # Create formatted text content
            content = f"""RADIO BROADCAST SCRIPT
Generated: {datetime.now().isoformat()}
Priority: {insights.get('priority', 'medium')}
Headline: {insights.get('headline', 'Environmental Update')}

--- BROADCAST SCRIPT ---
{text}

--- TECHNICAL NOTES ---
- Estimated duration: {self._estimate_duration(text):.1f} seconds
- Word count: {len(text.split())}
- Generated by: NSAC Radio Edge Server
- Type: Text file (audio generation not available)
"""
            
            with open(text_file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Also create a JSON metadata file
            metadata_file_path = self.audio_dir / f"{filename}.json"
            metadata = {
                "filename": text_file_path.name,
                "type": "text_broadcast",
                "timestamp": datetime.now().isoformat(),
                "priority": insights.get("priority", "medium"),
                "headline": insights.get("headline", "Environmental Update"),
                "text_content": text,
                "estimated_duration": self._estimate_duration(text),
                "word_count": len(text.split()),
                "ready_for_broadcast": True
            }
            
            with open(metadata_file_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2)
            
            return str(text_file_path)
            
        except Exception as e:
            self.logger.error(f"❌ Text file generation failed: {e}")
            return None
    
    async def get_status(self) -> Dict[str, Any]:
        """Get audio generator status"""
        audio_files = list(self.audio_dir.glob("*.wav")) if self.audio_dir.exists() else []
        text_files = list(self.audio_dir.glob("*.txt")) if self.audio_dir.exists() else []
        
        return {
            "initialized": True,
            "tts_available": PYTTSX3_AVAILABLE and self.tts_engine is not None,
            "audio_directory": str(self.audio_dir),
            "audio_files_count": len(audio_files),
            "text_files_count": len(text_files),
            "total_files": len(audio_files) + len(text_files),
            "timestamp": datetime.now().isoformat()
        }
