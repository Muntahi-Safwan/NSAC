import React from 'react';
import type { AQIData } from '../data/mockData';
import { MapPin, Satellite } from 'lucide-react';

interface AQISpeedometerProps {
  data: AQIData;
  location: {
    city: string;
    country: string;
  };
}

const AQISpeedometer: React.FC<AQISpeedometerProps> = ({ data, location }) => {
  // Calculate percentage for circular progress (0-300 scale)
  const percentage = Math.min((data.value / 300) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Define AQI ranges and colors with modern palette
  const aqiRanges = [
    { min: 0, max: 50, color: '#10b981', bgColor: '#10b981', label: 'Good', textColor: '#10b981' },
    { min: 51, max: 100, color: '#f59e0b', bgColor: '#f59e0b', label: 'Moderate', textColor: '#f59e0b' },
    { min: 101, max: 150, color: '#f97316', bgColor: '#f97316', label: 'Unhealthy for Sensitive', textColor: '#f97316' },
    { min: 151, max: 200, color: '#ef4444', bgColor: '#ef4444', label: 'Unhealthy', textColor: '#ef4444' },
    { min: 201, max: 300, color: '#dc2626', bgColor: '#dc2626', label: 'Very Unhealthy', textColor: '#dc2626' },
    { min: 301, max: 500, color: '#991b1b', bgColor: '#991b1b', label: 'Hazardous', textColor: '#991b1b' }
  ];

  const currentRange = aqiRanges.find(range => data.value >= range.min && data.value <= range.max);

  return (
    <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-4 h-full flex flex-col overflow-hidden group hover:border-white/[0.12] transition-all duration-500">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.01] via-blue-500/[0.02] to-indigo-500/[0.01] rounded-3xl" />

      {/* Clean Header */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-400/20 rounded-xl flex items-center justify-center">
            <Satellite className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg">Air Quality Index</h3>
            <p className="text-white/60 text-xs font-medium">Real-time monitoring</p>
          </div>
        </div>
      </div>

      {/* Centered Circular Progress */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-2">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 lg:w-52 lg:h-52">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke={currentRange?.color || '#6b7280'}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-2000 ease-out"
              style={{
                filter: `drop-shadow(0 0 12px ${currentRange?.color}30)`,
              }}
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-display font-black text-white mb-1 group-hover:scale-105 transition-transform duration-300">
                {data.value}
              </div>
              <div className="text-xs text-white/60 font-medium mb-2 tracking-wider">AQI LEVEL</div>
              <div
                className="inline-flex items-center text-xs font-bold px-2 py-1 rounded-full border backdrop-blur-xl"
                style={{
                  backgroundColor: `${currentRange?.color}12`,
                  borderColor: `${currentRange?.color}25`,
                  color: currentRange?.color,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse"
                  style={{ backgroundColor: currentRange?.color }}
                />
                {data.level.toUpperCase().replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Scale Indicators */}
          <div className="absolute inset-0">
            {[0, 25, 50, 75, 100].map((tick, index) => {
              const angle = (tick / 100) * 270 - 135;
              const x = 50 + 46 * Math.cos((angle * Math.PI) / 180);
              const y = 50 + 46 * Math.sin((angle * Math.PI) / 180);

              return (
                <div
                  key={index}
                  className="absolute w-0.5 h-0.5 bg-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Description */}
      <div className="relative z-10 text-center mb-3">
        <p className="text-white/80 text-xs font-medium mb-2">{data.description}</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center justify-center space-x-1 bg-white/[0.03] rounded py-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-white/70">Good</span>
          </div>
          <div className="flex items-center justify-center space-x-1 bg-white/[0.03] rounded py-1">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            <span className="text-white/70">Moderate</span>
          </div>
          <div className="flex items-center justify-center space-x-1 bg-white/[0.03] rounded py-1">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            <span className="text-white/70">Unhealthy</span>
          </div>
          <div className="flex items-center justify-center space-x-1 bg-white/[0.03] rounded py-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span className="text-white/70">Hazardous</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-white/50">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{location.city}</span>
            <span>•</span>
            <span>Updated 2 mins ago</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">N</span>
            </div>
            <span className="text-blue-400 font-semibold">NASA EOS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AQISpeedometer;