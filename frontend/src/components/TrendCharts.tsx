import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockPastTrendData, mockFutureTrendData } from '../data/mockData';
import { BarChart3, TrendingUp } from 'lucide-react';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-xl">
        <p className="text-white/80 text-sm font-medium mb-2">Time: {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white text-sm">
              {entry.dataKey}: <span className="font-bold">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PastTrendChart: React.FC = () => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4 sm:mb-5 md:mb-6">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-base sm:text-lg md:text-xl">Past 24 Hours</h3>
          <p className="text-white/60 text-xs sm:text-sm">Predicted vs Actual AQI Trends</p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[250px] sm:min-h-[280px] md:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockPastTrendData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06d6a0" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              interval={3}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
              iconType="line"
            />

            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              name="Predicted"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#06d6a0"
              strokeWidth={3}
              dot={{ fill: '#06d6a0', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#06d6a0', strokeWidth: 2 }}
              name="Actual"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/60">
        <span>Historical data accuracy: 94.2%</span>
      </div>
    </div>
  );
};

const FutureTrendChart: React.FC = () => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4 sm:mb-5 md:mb-6">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-base sm:text-lg md:text-xl">Next 24 Hours</h3>
          <p className="text-white/60 text-xs sm:text-sm">AI-Powered AQI Prediction</p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[250px] sm:min-h-[280px] md:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockFutureTrendData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="futureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              interval={3}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
              iconType="line"
            />

            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#10b981"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              name="Predicted AQI"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Confidence */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Prediction confidence: 89.7%</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>ML Model Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PastTrendChart, FutureTrendChart };