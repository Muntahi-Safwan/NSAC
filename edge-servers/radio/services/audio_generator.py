#!/usr/bin/env python3
"""
Radio Edge Server Audio Generator
Generates audio content from radio insights for broadcasting
"""

import asyncio
import logging
import os
import json
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path
import tempfile

# Text-to-speech libraries
try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False


class AudioGenerator:
    """Generates audio content from radio insights for broadcasting"""
    
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
                # Configure voice properties
                voices = self.tts_engine.getProperty('voices')
                if voices:
                    # Use the first available voice
                    self.tts_engine.setProperty('voice', voices[0].id)
                
                # Set speech rate and volume
                self.tts_engine.setProperty('rate', 180)  # Speed of speech
                self.tts_engine.setProperty('volume', 0.9)  # Volume level
                
                self.logger.info("✅ TTS engine initialized with pyttsx3")
            elif GTTS_AVAILABLE:
                self.logger.info("✅ gTTS available for text-to-speech")
            else:
                self.logger.warning("⚠️ No TTS libraries available")
                
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize TTS: {e}")
    
    async def generate_audio_insights(self, radio_insights: Dict[str, Any]) -> Dict[str, Any]:
        """Generate audio content from radio insights"""
        try:
            self.logger.info("🎵 Generating audio insights")
            
            # Extract content from insights
            radio_script = radio_insights.get("radio_script", "")
            headline = radio_insights.get("headline", "Environmental Update")
            safety_advice = radio_insights.get("safety_advice", "")
            
            if not radio_script:
                raise ValueError("No radio script provided")
            
            # Generate audio files
            audio_files = {}
            
            # Generate main script audio
            if radio_script:
                script_audio = await self._generate_script_audio(radio_script, "main_script")
                if script_audio:
                    audio_files["main_script"] = script_audio
            
            # Generate headline audio
            if headline:
                headline_audio = await self._generate_script_audio(headline, "headline")
                if headline_audio:
                    audio_files["headline"] = headline_audio
            
            # Generate safety advice audio
            if safety_advice:
                safety_audio = await self._generate_script_audio(safety_advice, "safety_advice")
                if safety_audio:
                    audio_files["safety_advice"] = safety_audio
            
            # Create audio package
            audio_package = {
                "timestamp": datetime.now().isoformat(),
                "insights_id": radio_insights.get("timestamp", ""),
                "audio_files": audio_files,
                "total_duration": self._calculate_total_duration(audio_files),
                "format": "wav",
                "sample_rate": 44100,
                "channels": 1,
                "ready_for_broadcast": len(audio_files) > 0
            }
            
            self.logger.info(f"✅ Audio insights generated: {len(audio_files)} files")
            return audio_package
            
        except Exception as e:
            self.logger.error(f"❌ Audio generation failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "ready_for_broadcast": False
            }
    
    async def _generate_script_audio(self, text: str, filename_prefix: str) -> Optional[Dict[str, Any]]:
        """Generate audio file from text script"""
        try:
            if not text.strip():
                return None
            
            # Clean and prepare text
            clean_text = self._clean_text_for_speech(text)
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{filename_prefix}_{timestamp}.wav"
            filepath = self.audio_dir / filename
            
            # Generate audio using available TTS method
            success = False
            
            if PYTTSX3_AVAILABLE and self.tts_engine:
                success = await self._generate_with_pyttsx3(clean_text, filepath)
            
            if not success and GTTS_AVAILABLE:
                success = await self._generate_with_gtts(clean_text, filepath)
            
            if not success:
                # Create a placeholder audio file
                success = await self._create_placeholder_audio(filepath, text)
            
            if success and filepath.exists():
                # Get file info
                file_size = filepath.stat().st_size
                duration = self._estimate_duration(text)
                
                return {
                    "filename": filename,
                    "filepath": str(filepath),
                    "file_size": file_size,
                    "duration_seconds": duration,
                    "text": clean_text,
                    "word_count": len(clean_text.split()),
                    "generated_at": datetime.now().isoformat()
                }
            
            return None
            
        except Exception as e:
            self.logger.error(f"❌ Failed to generate audio for {filename_prefix}: {e}")
            return None
    
    async def _generate_with_pyttsx3(self, text: str, filepath: Path) -> bool:
        """Generate audio using pyttsx3"""
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.tts_engine.save_to_file(text, str(filepath))
            )
            
            # Wait for file to be created
            await asyncio.sleep(1)
            return filepath.exists()
            
        except Exception as e:
            self.logger.error(f"❌ pyttsx3 generation failed: {e}")
            return False
    
    async def _generate_with_gtts(self, text: str, filepath: Path) -> bool:
        """Generate audio using gTTS"""
        try:
            if not GTTS_AVAILABLE:
                return False
            
            # Create temporary file for gTTS
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Generate speech
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(temp_path)
            
            # Convert MP3 to WAV (simplified - would need ffmpeg in production)
            # For now, just move the MP3 file
            filepath.with_suffix('.mp3').write_bytes(Path(temp_path).read_bytes())
            
            # Clean up temp file
            os.unlink(temp_path)
            
            return filepath.with_suffix('.mp3').exists()
            
        except Exception as e:
            self.logger.error(f"❌ gTTS generation failed: {e}")
            return False
    
    async def _create_placeholder_audio(self, filepath: Path, text: str) -> bool:
        """Create a placeholder audio file when TTS is not available"""
        try:
            # Create a simple text file as placeholder
            placeholder_content = f"""Radio Script Audio Placeholder
Generated: {datetime.now().isoformat()}
Text: {text[:100]}...
Duration: {self._estimate_duration(text)} seconds
Status: Ready for manual recording
"""
            
            filepath.with_suffix('.txt').write_text(placeholder_content)
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Placeholder creation failed: {e}")
            return False
    
    def _clean_text_for_speech(self, text: str) -> str:
        """Clean and prepare text for speech synthesis"""
        # Remove special characters and normalize
        import re
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove quotes and brackets
        text = text.replace('"', '').replace("'", '').replace('[', '').replace(']', '')
        
        # Ensure proper punctuation
        if not text.endswith(('.', '!', '?')):
            text += '.'
        
        return text.strip()
    
    def _estimate_duration(self, text: str) -> float:
        """Estimate audio duration based on text length"""
        # Average speaking rate: ~150 words per minute
        words = len(text.split())
        duration_minutes = words / 150.0
        return duration_minutes * 60.0  # Convert to seconds
    
    def _calculate_total_duration(self, audio_files: Dict[str, Any]) -> float:
        """Calculate total duration of all audio files"""
        total = 0.0
        for file_info in audio_files.values():
            if isinstance(file_info, dict):
                duration = file_info.get("duration_seconds", 0)
                total += duration
        return total
    
    async def cleanup_old_audio(self, max_age_hours: int = 24):
        """Clean up old audio files to save space"""
        try:
            cutoff_time = datetime.now().timestamp() - (max_age_hours * 3600)
            cleaned_count = 0
            
            for audio_file in self.audio_dir.glob("*.wav"):
                if audio_file.stat().st_mtime < cutoff_time:
                    audio_file.unlink()
                    cleaned_count += 1
            
            for audio_file in self.audio_dir.glob("*.mp3"):
                if audio_file.stat().st_mtime < cutoff_time:
                    audio_file.unlink()
                    cleaned_count += 1
            
            for audio_file in self.audio_dir.glob("*.txt"):
                if audio_file.stat().st_mtime < cutoff_time:
                    audio_file.unlink()
                    cleaned_count += 1
            
            if cleaned_count > 0:
                self.logger.info(f"🧹 Cleaned up {cleaned_count} old audio files")
                
        except Exception as e:
            self.logger.error(f"❌ Audio cleanup failed: {e}")

