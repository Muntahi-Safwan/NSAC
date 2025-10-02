const { GoogleGenAI } = require('@google/genai');

class ChatbotService {
  constructor() {
    // Initialize Gemini AI with new package
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // System prompt for environmental expert persona
    this.systemPrompt = `You are an expert Environmental Health Scientist and Air Quality Specialist working with NASA's Earth Observing System data. Your role is to provide professional, scientifically accurate advice on air quality, environmental hazards, and health protection measures.

Key Responsibilities:
1. Analyze air quality data (Aerosol Optical Depth, PM2.5, NO2, O3, etc.)
2. Provide actionable health recommendations
3. Explain environmental hazards in accessible language
4. Suggest practical prevention and mitigation strategies
5. Reference NASA satellite data when relevant
6. Prioritize public health and safety

Communication Style:
- Professional yet approachable
- Evidence-based and scientific
- Clear, concise explanations
- Actionable recommendations
- Empathetic to health concerns

Always:
- Cite data sources when available
- Provide specific, practical advice
- Consider vulnerable populations (children, elderly, respiratory conditions)
- Explain the "why" behind recommendations
- Offer both immediate and long-term solutions

Never:
- Provide medical diagnoses (refer to healthcare providers)
- Make unfounded claims
- Use overly technical jargon without explanation
- Ignore context or user-specific situations`;
  }

  /**
   * Generate AI response with context
   */
  async generateResponse(userMessage, context = {}) {
    try {
      // Build context-aware prompt
      const contextualPrompt = this.buildContextualPrompt(userMessage, context);

      // Generate response using new API
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contextualPrompt
      });

      return {
        success: true,
        message: response.text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Build context-aware prompt with air quality data
   */
  buildContextualPrompt(userMessage, context) {
    let prompt = `${this.systemPrompt}\n\n`;

    // Add location context
    if (context.location) {
      prompt += `User Location: ${context.location.city || 'Unknown'}, ${context.location.country || 'Unknown'}\n`;
      prompt += `Coordinates: ${context.location.lat?.toFixed(4)}°N, ${context.location.lng?.toFixed(4)}°E\n\n`;
    }

    // Add air quality context
    if (context.airQuality) {
      prompt += `Current Air Quality Data (NASA MODIS/OMI):\n`;

      if (context.airQuality.aqi) {
        prompt += `- Air Quality Index: ${context.airQuality.aqi} (${this.getAQICategory(context.airQuality.aqi)})\n`;
      }

      if (context.airQuality.pm25) {
        prompt += `- PM2.5: ${context.airQuality.pm25} µg/m³\n`;
      }

      if (context.airQuality.no2) {
        prompt += `- NO2: ${context.airQuality.no2} molecules/cm²\n`;
      }

      if (context.airQuality.o3) {
        prompt += `- Ozone (O3): ${context.airQuality.o3} DU\n`;
      }

      if (context.airQuality.aerosol) {
        prompt += `- Aerosol Optical Depth: ${context.airQuality.aerosol}\n`;
      }

      prompt += `- Data Source: NASA GIBS (${context.airQuality.date || 'Latest available'})\n\n`;
    }

    // Add weather context if available
    if (context.weather) {
      prompt += `Weather Conditions:\n`;
      prompt += `- Temperature: ${context.weather.temperature}°C\n`;
      prompt += `- Humidity: ${context.weather.humidity}%\n`;
      prompt += `- Wind Speed: ${context.weather.windSpeed} km/h\n\n`;
    }

    // Add user message
    prompt += `User Question: ${userMessage}\n\n`;
    prompt += `Please provide a detailed, professional response that:
1. Addresses the user's question directly
2. References the provided air quality data if relevant
3. Offers specific, actionable recommendations
4. Explains potential health impacts
5. Suggests both immediate actions and long-term strategies
6. Is empathetic and supportive\n\n`;

    prompt += `Response:`;

    return prompt;
  }

  /**
   * Get AQI category description
   */
  getAQICategory(aqi) {
    if (aqi <= 50) return 'Good - Air quality is satisfactory';
    if (aqi <= 100) return 'Moderate - Acceptable for most people';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy - Everyone may experience effects';
    if (aqi <= 300) return 'Very Unhealthy - Health alert';
    return 'Hazardous - Emergency conditions';
  }

  /**
   * Generate quick tips based on air quality
   */
  async generateQuickTips(airQualityData) {
    try {
      const prompt = `${this.systemPrompt}\n\nBased on the following air quality data, provide 5 concise, actionable tips for staying healthy:\n\n${JSON.stringify(airQualityData, null, 2)}\n\nProvide tips as a numbered list, one tip per line.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text;

      // Extract tips from the response text
      // Look for numbered items or bullet points
      const lines = text.split('\n').filter(line => line.trim());
      const tips = [];

      for (const line of lines) {
        // Match lines that start with numbers (1., 2., etc.) or bullets (-, *, •)
        const match = line.match(/^[\d\*\-\•\#]+[\.\):\s]+(.+)$/);
        if (match && match[1]) {
          tips.push(match[1].trim());
        }
      }

      // If we found tips, return them; otherwise use the whole text split smartly
      const finalTips = tips.length >= 3 ? tips.slice(0, 5) : [
        'Check air quality before outdoor activities',
        'Keep windows closed during high pollution periods',
        'Use air purifiers indoors if available',
        'Wear N95 masks during poor air quality',
        'Stay hydrated and maintain healthy diet'
      ];

      return {
        success: true,
        tips: finalTips,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating quick tips:', error);
      // Fallback tips
      return {
        success: true,
        tips: [
          'Check air quality before outdoor activities',
          'Keep windows closed during high pollution periods',
          'Use air purifiers indoors if available',
          'Wear N95 masks during poor air quality',
          'Stay hydrated and maintain healthy diet'
        ],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze air quality trends and provide insights
   */
  async analyzeTrends(historicalData) {
    try {
      const prompt = `${this.systemPrompt}\n\nAnalyze the following air quality trend data and provide insights:\n\n${JSON.stringify(historicalData, null, 2)}\n\nProvide:\n1. Key observations\n2. Potential causes\n3. Health implications\n4. Recommendations\n\nBe concise but thorough.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        success: true,
        analysis: response.text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw new Error('Failed to analyze air quality trends');
    }
  }

  /**
   * Get health recommendations for specific activities
   */
  async getActivityRecommendations(activity, airQuality) {
    try {
      const prompt = `${this.systemPrompt}\n\nUser wants to: ${activity}\n\nCurrent Air Quality:\n${JSON.stringify(airQuality, null, 2)}\n\nProvide specific recommendations about whether it's safe to do this activity and what precautions to take.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        success: true,
        recommendations: response.text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating activity recommendations:', error);
      throw new Error('Failed to generate activity recommendations');
    }
  }

  /**
   * Explain air quality metric in simple terms
   */
  async explainMetric(metric, value) {
    try {
      const prompt = `${this.systemPrompt}\n\nExplain what "${metric}" means and what a value of "${value}" indicates in terms of health and air quality. Keep it under 150 words and use simple language.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        success: true,
        explanation: response.text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error explaining metric:', error);
      throw new Error('Failed to explain air quality metric');
    }
  }

  /**
   * Generate daily AI tip
   */
  async generateDailyTip() {
    try {
      const today = new Date().toDateString();
      const prompt = `Generate ONE inspiring, actionable tip about air quality and health for today (${today}).

The tip should:
- Be 2-3 sentences maximum
- Include a specific, practical action people can take
- Be positive and empowering
- Relate to environmental health or air quality
- Be suitable for display as "Tip of the Day"

Return only the tip text, no title or formatting.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        success: true,
        tip: response.text.trim(),
        date: today
      };
    } catch (error) {
      console.error('Error generating daily tip:', error);
      // Fallback tip
      return {
        success: true,
        tip: "Check your local air quality before planning outdoor activities. Use the AQI scale to make informed decisions about exercise and time spent outside, especially if you're in a sensitive group.",
        date: new Date().toDateString()
      };
    }
  }

  /**
   * Generate location-based insights
   */
  async generateLocationInsights(locationData) {
    try {
      const { location, aqi, pm25, no2, o3, conditions } = locationData;

      const prompt = `Explain the current air quality situation in ${location} in simple, everyday language that anyone can understand.

Current Data:
- AQI: ${aqi || 'N/A'}
- PM2.5: ${pm25 || 'N/A'} µg/m³
- NO2: ${no2 || 'N/A'}
- Ozone: ${o3 || 'N/A'}
- Conditions: ${conditions || 'N/A'}

Provide a friendly, 3-4 sentence explanation that:
1. Describes what the air quality means in practical terms
2. Compares it to something relatable (like "as clear as a mountain morning" or "like a busy city street")
3. Gives one specific recommendation for the day
4. Uses encouraging, non-alarming language

Avoid technical jargon. Write like you're explaining to a friend.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        success: true,
        insight: response.text.trim(),
        location
      };
    } catch (error) {
      console.error('Error generating location insights:', error);
      return {
        success: true,
        insight: `The air quality in ${locationData.location} is being monitored. Check back soon for personalized insights about your local air quality.`,
        location: locationData.location
      };
    }
  }
}

module.exports = new ChatbotService();
