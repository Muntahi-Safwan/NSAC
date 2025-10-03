import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Brain, TrendingUp, Wind } from 'lucide-react';

interface AILocationInsightsProps {
  location: string;
  aqi: number;
  pm25?: number;
  no2?: number;
  o3?: number;
}

const AILocationInsights: React.FC<AILocationInsightsProps> = ({
  location,
  aqi,
  pm25,
  no2,
  o3
}) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocationInsights();
  }, [location, aqi]);

  const fetchLocationInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://nsac-mu.vercel.app/api/chatbot/location-insights', {
        location,
        aqi,
        pm25,
        no2,
        o3,
        conditions: getAQICategory(aqi)
      });

      if (response.data.success) {
        setInsight(response.data.data.insight);
      }
    } catch (error) {
      console.error('Error fetching location insights:', error);
      setInsight(
        `The air quality in ${location} is currently at AQI ${aqi}. ${getDefaultRecommendation(aqi)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const getAQICategory = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getDefaultRecommendation = (aqi: number): string => {
    if (aqi <= 50) return 'Perfect conditions for outdoor activities!';
    if (aqi <= 100) return 'Generally acceptable, but sensitive individuals should consider limiting prolonged outdoor exertion.';
    if (aqi <= 150) return 'Sensitive groups should reduce outdoor activities.';
    if (aqi <= 200) return 'Everyone should limit outdoor activities.';
    return 'Avoid all outdoor activities. Stay indoors with air purification if possible.';
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return 'from-green-400 to-emerald-500';
    if (aqi <= 100) return 'from-yellow-400 to-orange-400';
    if (aqi <= 150) return 'from-orange-400 to-red-400';
    if (aqi <= 200) return 'from-red-400 to-red-600';
    if (aqi <= 300) return 'from-red-600 to-purple-600';
    return 'from-purple-600 to-pink-600';
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.04] backdrop-blur-xl border border-white/[0.15] rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:border-indigo-400/30">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-display font-bold text-white">
                AI Location Insights
              </h3>
              <div className="flex items-center space-x-2 text-xs md:text-sm text-blue-300">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          {/* AQI Badge */}
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${getAQIColor(aqi)} rounded-xl shadow-lg`}>
              <Wind className="w-4 h-4 text-white mr-2" />
              <span className="text-white font-bold">AQI {aqi}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">{getAQICategory(aqi)}</p>
          </div>
        </div>

        {/* AI Insight */}
        <div className="relative">
          <div className="flex items-start space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
            <p className="text-base md:text-lg text-white/90 leading-relaxed">
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  <span className="text-white/60">Analyzing air quality data...</span>
                </span>
              ) : (
                insight
              )}
            </p>
          </div>

          {/* Pollutant Indicators */}
          {!loading && (pm25 || no2 || o3) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {pm25 && (
                <div className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg">
                  <span className="text-white/60 text-xs">PM2.5:</span>
                  <span className="text-white font-semibold text-xs ml-1">{pm25} µg/m³</span>
                </div>
              )}
              {no2 && (
                <div className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg">
                  <span className="text-white/60 text-xs">NO₂:</span>
                  <span className="text-white font-semibold text-xs ml-1">{no2} ppb</span>
                </div>
              )}
              {o3 && (
                <div className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg">
                  <span className="text-white/60 text-xs">O₃:</span>
                  <span className="text-white font-semibold text-xs ml-1">{o3} ppb</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default AILocationInsights;
