import React from 'react';
import type { PollutantData } from '../data/mockData';
import { getPollutantColor } from '../data/mockData';
import { AlertTriangle, CheckCircle, AlertCircle, Skull, Activity } from 'lucide-react';

interface PollutantDetailsProps {
  pollutants: PollutantData[];
}

const PollutantDetails: React.FC<PollutantDetailsProps> = ({ pollutants }) => {
  const getIcon = (level: string) => {
    switch (level) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'moderate':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'unhealthy':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'hazardous':
        return <Skull className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'good':
        return 'Good';
      case 'moderate':
        return 'Moderate';
      case 'unhealthy':
        return 'Unhealthy';
      case 'hazardous':
        return 'Hazardous';
      default:
        return 'Unknown';
    }
  };

  const getProgressPercentage = (pollutant: PollutantData) => {
    // Different scales for different pollutants based on WHO/EPA standards
    const maxValues: { [key: string]: number } = {
      'NH₃': 100,    // Ammonia safe limit
      'HCHO': 30,    // Formaldehyde safe limit
      'O₃': 120,     // Ozone 8-hour standard
      'PM2.5': 35,   // PM2.5 annual standard
      'PM10': 50     // PM10 annual standard
    };

    const max = maxValues[pollutant.name] || 100;
    return Math.min((pollutant.value / max) * 100, 100);
  };

  return (
    <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-4 flex flex-col overflow-hidden group hover:border-white/[0.12] transition-all duration-500">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.01] via-red-500/[0.02] to-pink-500/[0.01] rounded-3xl" />

      {/* Clean Header */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl border border-orange-400/20 rounded-xl flex items-center justify-center">
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg">
              Pollutant Analysis
            </h3>
            <p className="text-white/60 text-xs font-medium">Real-time atmospheric monitoring</p>
          </div>
        </div>

        {/* Compact Summary Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-white mb-0.5">{pollutants.length}</div>
            <div className="text-xs text-white/60 uppercase tracking-wide">Tracked</div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-400 mb-0.5">
              {pollutants.filter(p => p.level === 'unhealthy').length}
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wide">Unhealthy</div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-yellow-400 mb-0.5">
              {pollutants.filter(p => p.level === 'moderate').length}
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wide">Moderate</div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-400 mb-0.5">
              {pollutants.filter(p => p.level === 'good').length}
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wide">Good</div>
          </div>
        </div>
      </div>

      {/* Compact Pollutant List */}
      <div className="relative z-10 space-y-2 max-h-[400px] md:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
        {pollutants.map((pollutant, index) => (
          <div
            key={index}
            className="group/item bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/[0.05] hover:border-white/[0.1] rounded-lg p-3 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              {/* Pollutant Header */}
              <div className="flex items-center space-x-2">
                <div className="font-display font-bold text-white text-base">
                  {pollutant.name}
                </div>
                {getIcon(pollutant.level)}
                <div
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full backdrop-blur-xl border"
                  style={{
                    backgroundColor: `${getPollutantColor(pollutant.level)}12`,
                    borderColor: `${getPollutantColor(pollutant.level)}25`,
                    color: getPollutantColor(pollutant.level),
                  }}
                >
                  {getLevelText(pollutant.level)}
                </div>
              </div>

              {/* Value Display */}
              <div className="text-right">
                <div className="font-display font-black text-white text-lg group-hover/item:scale-105 transition-transform duration-300">
                  {pollutant.value}
                </div>
                <div className="text-white/60 text-xs font-medium">
                  {pollutant.unit}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/70 text-xs mb-2 line-clamp-1">{pollutant.description}</p>

            {/* Progress Bar */}
            <div className="relative">
              <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                <span>Concentration Level</span>
                <span className="font-semibold">{getProgressPercentage(pollutant).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/[0.05] rounded-full h-1 overflow-hidden">
                <div
                  className="h-1 rounded-full transition-all duration-1500 ease-out"
                  style={{
                    width: `${getProgressPercentage(pollutant)}%`,
                    backgroundColor: getPollutantColor(pollutant.level),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-3 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between text-xs">
          <div className="text-white/50">
            Updated: <span className="text-white/70 font-medium">2 minutes ago</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">N</span>
              </div>
              <span className="text-blue-400 font-semibold">NASA</span>
            </div>
            <div className="w-0.5 h-0.5 bg-white/30 rounded-full" />
            <div className="text-green-400 font-medium flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span>Live Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollutantDetails;