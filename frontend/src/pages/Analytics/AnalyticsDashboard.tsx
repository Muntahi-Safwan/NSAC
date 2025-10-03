import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Zap, Wind, Droplets, Cloud, Sun, AlertTriangle, Thermometer, Flame, MapPin } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Background from '../../components/Background';

const AnalyticsDashboard = () => {
  // Mock comprehensive data - in production, fetch from backend APIs
  const [activeTab, setActiveTab] = useState<'overview' | 'air' | 'heatwave' | 'wildfire'>('overview');

  // Air Quality Historical Data
  const airQualityTrend = [
    { date: 'Mon', pm25: 45, pm10: 65, no2: 35, o3: 50, aqi: 78 },
    { date: 'Tue', pm25: 52, pm10: 72, no2: 38, o3: 55, aqi: 85 },
    { date: 'Wed', pm25: 38, pm10: 58, no2: 32, o3: 48, aqi: 68 },
    { date: 'Thu', pm25: 48, pm10: 68, no2: 36, o3: 52, aqi: 80 },
    { date: 'Fri', pm25: 42, pm10: 62, no2: 34, o3: 49, aqi: 72 },
    { date: 'Sat', pm25: 35, pm10: 55, no2: 30, o3: 45, aqi: 62 },
    { date: 'Sun', pm25: 40, pm10: 60, no2: 33, o3: 47, aqi: 70 },
  ];

  // Pollutant Distribution
  const pollutantDistribution = [
    { name: 'PM2.5', value: 35, color: '#ef4444' },
    { name: 'PM10', value: 25, color: '#f97316' },
    { name: 'NO₂', value: 20, color: '#eab308' },
    { name: 'O₃', value: 15, color: '#22c55e' },
    { name: 'SO₂', value: 5, color: '#3b82f6' },
  ];

  // Heatwave Data
  const heatwaveData = [
    { region: 'California', temp: 115, risk: 'Critical', affected: 12500 },
    { region: 'Arizona', temp: 110, risk: 'High', affected: 8200 },
    { region: 'Nevada', temp: 105, risk: 'Medium', affected: 5600 },
    { region: 'Texas', temp: 112, risk: 'Critical', affected: 15300 },
    { region: 'New Mexico', temp: 102, risk: 'Medium', affected: 4100 },
  ];

  // Wildfire Statistics
  const wildfireStats = [
    { month: 'Jan', fires: 45, acres: 12500 },
    { month: 'Feb', fires: 38, acres: 9800 },
    { month: 'Mar', fires: 52, acres: 15200 },
    { month: 'Apr', fires: 68, acres: 22400 },
    { month: 'May', fires: 85, acres: 31800 },
    { month: 'Jun', fires: 122, acres: 48600 },
  ];

  // Real-time Statistics
  const stats = [
    {
      label: 'Average AQI',
      value: '75',
      change: '-5%',
      trend: 'down',
      icon: Wind,
      color: 'blue'
    },
    {
      label: 'Active Heatwaves',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: Thermometer,
      color: 'orange'
    },
    {
      label: 'Active Wildfires',
      value: '247',
      change: '+18',
      trend: 'up',
      icon: Flame,
      color: 'red'
    },
    {
      label: 'Monitored Regions',
      value: '19',
      change: 'stable',
      trend: 'neutral',
      icon: MapPin,
      color: 'cyan'
    },
  ];

  const getStatColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-cyan-500';
      case 'orange': return 'from-orange-500 to-red-500';
      case 'red': return 'from-red-500 to-pink-500';
      case 'cyan': return 'from-cyan-500 to-teal-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    // <Background>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-white">
                  Analytics Dashboard
                </h1>
                <p className="text-blue-200 mt-1">Real-time environmental data & insights</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${getStatColor(stat.color)} rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.trend !== 'neutral' && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        stat.trend === 'up' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                        {stat.change}
                      </div>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-blue-200 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'air', label: 'Air Quality', icon: Wind },
              { id: 'heatwave', label: 'Heatwave', icon: Thermometer },
              { id: 'wildfire', label: 'Wildfire', icon: Flame },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Air Quality Trend Chart */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  7-Day Air Quality Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={airQualityTrend}>
                    <defs>
                      <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #ffffff20',
                        borderRadius: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="aqi"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#aqiGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Pollutant Distribution */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-purple-400" />
                    Pollutant Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pollutantDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pollutantDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Wildfire Trend */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-400" />
                    Wildfire Activity (6 Months)
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={wildfireStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #ffffff20',
                          borderRadius: '12px'
                        }}
                      />
                      <Bar dataKey="fires" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'air' && (
            <div className="space-y-8">
              {/* Detailed Air Quality Chart */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Pollutant Levels Over Time</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={airQualityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #ffffff20',
                        borderRadius: '12px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="no2" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="o3" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'heatwave' && (
            <div className="space-y-8">
              {/* Heatwave Regions */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Active Heatwave Regions</h3>
                <div className="space-y-4">
                  {heatwaveData.map((region, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-500/20 rounded-xl">
                            <Thermometer className="w-6 h-6 text-orange-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-lg">{region.region}</h4>
                            <p className="text-blue-200 text-sm">{region.affected.toLocaleString()} people affected</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white">{region.temp}°F</div>
                          <span className={`text-sm font-semibold ${
                            region.risk === 'Critical' ? 'text-red-400' :
                            region.risk === 'High' ? 'text-orange-400' : 'text-yellow-400'
                          }`}>{region.risk} Risk</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wildfire' && (
            <div className="space-y-8">
              {/* Wildfire Statistics */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Wildfire Statistics</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={wildfireStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #ffffff20',
                          borderRadius: '12px'
                        }}
                      />
                      <Bar dataKey="fires" fill="#ef4444" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="acres" fill="#f97316" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                      <h4 className="text-red-300 font-semibold mb-2">Total Active Fires</h4>
                      <p className="text-4xl font-bold text-white">247</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-4">
                      <h4 className="text-orange-300 font-semibold mb-2">Acres Burned (YTD)</h4>
                      <p className="text-4xl font-bold text-white">140.3K</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
                      <h4 className="text-yellow-300 font-semibold mb-2">Containment Rate</h4>
                      <p className="text-4xl font-bold text-white">52.7%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    // </Background>
  );
};

export default AnalyticsDashboard;
