import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, Sparkles, RefreshCw } from 'lucide-react';

const AITipOfTheDay: React.FC = () => {
  const [tip, setTip] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyTip();
  }, []);

  const fetchDailyTip = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://nsac-mu.vercel.app/api/chatbot/daily-tip');
      if (response.data.success) {
        setTip(response.data.data.tip);
        setDate(response.data.data.date);
      }
    } catch (error) {
      console.error('Error fetching daily tip:', error);
      setTip('Check your local air quality before planning outdoor activities. Small actions like checking AQI levels can make a big difference for your health!');
      setDate(new Date().toDateString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.04] backdrop-blur-xl border border-white/[0.15] rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:border-cyan-400/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-display font-bold text-white flex items-center">
                AI Tip of the Day
                <Sparkles className="w-4 h-4 ml-2 text-cyan-400" />
              </h3>
              <p className="text-blue-300 text-xs md:text-sm">{date}</p>
            </div>
          </div>

          <button
            onClick={fetchDailyTip}
            disabled={loading}
            className="p-2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh tip"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tip Content */}
        <div className="relative">
          <div className="absolute -left-4 top-0 text-6xl text-cyan-400/20 font-serif leading-none">"</div>
          <p className="text-base md:text-lg text-white/90 leading-relaxed pl-6">
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </span>
            ) : (
              tip
            )}
          </p>
          <div className="absolute -right-4 bottom-0 text-6xl text-cyan-400/20 font-serif leading-none">"</div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default AITipOfTheDay;
