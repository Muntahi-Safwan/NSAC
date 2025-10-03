#!/usr/bin/env python3
"""
Radio Edge Server Gemini AI Analyzer
Uses Google Gemini API to analyze environmental data and generate radio insights
"""

import asyncio
import logging
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold


class GeminiAnalyzer:
    """Uses Gemini AI to analyze environmental data and generate radio insights"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.model = None
        self._initialize_gemini()
    
    def _initialize_gemini(self):
        """Initialize Gemini AI with API key"""
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                self.logger.warning("⚠️ GEMINI_API_KEY not found in environment variables")
                return
            
            genai.configure(api_key=api_key)
            
            # Initialize the model with safety settings
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
            
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                safety_settings=safety_settings
            )
            
            self.logger.info("✅ Gemini AI initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize Gemini AI: {e}")
            self.model = None
    
    async def generate_radio_insights(self, data_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate radio-friendly insights from environmental data analysis"""
        try:
            if not self.model:
                return self._generate_fallback_insights(data_analysis)
            
            self.logger.info("🤖 Generating radio insights with Gemini AI")
            
            # Prepare the prompt for Gemini
            prompt = self._create_analysis_prompt(data_analysis)
            
            # Generate response
            response = await self._generate_response(prompt)
            
            # Parse and structure the response
            insights = self._parse_gemini_response(response, data_analysis)
            
            self.logger.info("✅ Radio insights generated successfully")
            return insights
            
        except Exception as e:
            self.logger.error(f"❌ Failed to generate radio insights: {e}")
            return self._generate_fallback_insights(data_analysis)
    
    def _create_analysis_prompt(self, data_analysis: Dict[str, Any]) -> str:
        """Create a comprehensive prompt for Gemini AI analysis"""
        
        wildfire_data = data_analysis.get("wildfire_insights", {})
        air_quality_data = data_analysis.get("air_quality_insights", {})
        trends = data_analysis.get("trends", {})
        overall_risk = data_analysis.get("overall_risk", "low")
        
        prompt = f"""
You are an environmental analyst creating radio broadcast content for North American audiences. Analyze the following environmental data and create radio-friendly insights.

ENVIRONMENTAL DATA ANALYSIS:
- Analysis Type: {data_analysis.get('analysis_type', 'unknown')}
- Timestamp: {data_analysis.get('timestamp', 'unknown')}
- Overall Risk Level: {overall_risk.upper()}

WILDFIRE DATA:
- Fire Count: {wildfire_data.get('fire_count', 0)}
- High Intensity Fires: {wildfire_data.get('high_intensity_fires', 0)}
- Risk Level: {wildfire_data.get('risk_level', 'unknown')}
- Description: {wildfire_data.get('risk_description', 'No data')}

AIR QUALITY DATA:
- AQI Average: {air_quality_data.get('aqi_average', 'unknown')}
- AQI Range: {air_quality_data.get('aqi_range', 'unknown')}
- Risk Level: {air_quality_data.get('risk_level', 'unknown')}
- Description: {air_quality_data.get('risk_description', 'No data')}

TRENDS (if available):
- Air Quality Trend: {trends.get('air_quality_trend', 'unknown')}
- Wildfire Trend: {trends.get('wildfire_trend', 'unknown')}
- Temperature Trend: {trends.get('temperature_trend', 'unknown')}

RECOMMENDATIONS:
{json.dumps(data_analysis.get('recommendations', []), indent=2)}

Please provide a JSON response with the following structure:
{{
    "radio_script": "A 30-60 second radio script for environmental conditions",
    "headline": "A catchy headline for the broadcast",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "safety_advice": "Specific safety advice for listeners",
    "tone": "professional|urgent|informative|reassuring",
    "priority": "low|medium|high|critical",
    "broadcast_recommendation": "immediate|scheduled|optional"
}}

Guidelines:
- Keep the radio script conversational and accessible
- Use clear, simple language
- Include specific actionable advice
- Match the tone to the risk level
- Be accurate and avoid speculation
- Focus on what listeners can do to stay safe
- Keep the script between 30-60 seconds when read aloud
"""
        
        return prompt
    
    async def _generate_response(self, prompt: str) -> str:
        """Generate response from Gemini AI"""
        try:
            # Use asyncio to run the synchronous Gemini call
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.model.generate_content(prompt)
            )
            
            if response.text:
                return response.text
            else:
                raise Exception("Empty response from Gemini")
                
        except Exception as e:
            self.logger.error(f"❌ Gemini API call failed: {e}")
            raise
    
    def _parse_gemini_response(self, response: str, original_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Gemini response and structure it for radio broadcasting"""
        try:
            # Try to extract JSON from the response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                gemini_data = json.loads(json_str)
            else:
                # Fallback if JSON parsing fails
                gemini_data = {
                    "radio_script": response[:200] + "...",
                    "headline": "Environmental Update",
                    "key_points": ["Data analysis completed"],
                    "safety_advice": "Stay informed about local conditions",
                    "tone": "informative",
                    "priority": "medium",
                    "broadcast_recommendation": "scheduled"
                }
            
            # Structure the final insights
            insights = {
                "timestamp": datetime.now().isoformat(),
                "ai_generated": True,
                "ai_model": "gemini-1.5-flash",
                "radio_script": gemini_data.get("radio_script", ""),
                "headline": gemini_data.get("headline", "Environmental Update"),
                "key_points": gemini_data.get("key_points", []),
                "safety_advice": gemini_data.get("safety_advice", ""),
                "tone": gemini_data.get("tone", "informative"),
                "priority": gemini_data.get("priority", "medium"),
                "broadcast_recommendation": gemini_data.get("broadcast_recommendation", "scheduled"),
                "raw_analysis": original_analysis,
                "confidence": 0.85  # Default confidence for AI-generated content
            }
            
            return insights
            
        except Exception as e:
            self.logger.error(f"❌ Failed to parse Gemini response: {e}")
            return self._generate_fallback_insights(original_analysis)
    
    def _generate_fallback_insights(self, data_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate fallback insights when AI is not available"""
        try:
            wildfire_data = data_analysis.get("wildfire_insights", {})
            air_quality_data = data_analysis.get("air_quality_insights", {})
            overall_risk = data_analysis.get("overall_risk", "low")
            
            # Generate simple radio script based on risk level
            if overall_risk == "high":
                radio_script = "This is an important environmental update. High-risk conditions detected in your area. Please stay informed and follow local safety guidelines."
                tone = "urgent"
                priority = "high"
            elif overall_risk == "moderate":
                radio_script = "Environmental conditions are moderate today. Please stay aware of local conditions and take appropriate precautions."
                tone = "informative"
                priority = "medium"
            else:
                radio_script = "Environmental conditions are generally good. Continue to stay informed about local air quality and weather conditions."
                tone = "reassuring"
                priority = "low"
            
            insights = {
                "timestamp": datetime.now().isoformat(),
                "ai_generated": False,
                "ai_model": "fallback",
                "radio_script": radio_script,
                "headline": "Environmental Update",
                "key_points": data_analysis.get("recommendations", []),
                "safety_advice": "Stay informed about local conditions",
                "tone": tone,
                "priority": priority,
                "broadcast_recommendation": "scheduled",
                "raw_analysis": data_analysis,
                "confidence": 0.7
            }
            
            self.logger.info("📝 Generated fallback insights")
            return insights
            
        except Exception as e:
            self.logger.error(f"❌ Fallback insights generation failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "ai_generated": False,
                "error": str(e),
                "radio_script": "Environmental data analysis is currently unavailable.",
                "headline": "System Update",
                "priority": "low"
            }

