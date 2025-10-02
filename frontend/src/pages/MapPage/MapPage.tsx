import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Info,
  Search,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BarChart3,
  Globe,
  Wind,
  Thermometer,
  Droplets,
  TrendingUp,
  Flame
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AirQualityMap from '../../components/AirQualityMap';
import AIChatbot from '../../components/AIChatbot';
import { mockMapZones, getAQIColor, mockPollutants } from '../../data/mockData';

const MapPage = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'analytics'>('overview');
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  // const [mapView, setMapView] = useState<'satellite' | 'standard' | 'terrain'>('satellite');
  const [showPollutantLayers, setShowPollutantLayers] = useState({
    pm25: true,
    pm10: true,
    no2: true,
    so2: true,
    co: false,
    o3: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  // const [isRealTime, setIsRealTime] = useState(true);

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getRegionStats = () => {
    const total = mockMapZones.length;
    const good = mockMapZones.filter(z => z.level === 'good').length;
    const moderate = mockMapZones.filter(z => z.level === 'moderate').length;
    const unhealthy = mockMapZones.filter(z => z.level === 'unhealthy' || z.level === 'very_unhealthy').length;
    const avgAQI = Math.round(mockMapZones.reduce((sum, zone) => sum + zone.aqi, 0) / total);
    const critical = mockMapZones.filter(z => z.aqi > 200).length;

    return { total, good, moderate, unhealthy, avgAQI, critical };
  };

  const getPollutantStats = () => {
    return mockPollutants.map(pollutant => ({
      ...pollutant,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: (Math.random() * 20 - 10).toFixed(1)
    }));
  };

  const stats = getRegionStats();
  const pollutantStats = getPollutantStats();

  const filteredRegions = mockMapZones.filter(zone =>
    zone?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) || false
  );

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-96';
  // const mapMargin = sidebarCollapsed ? 'ml-16' : 'ml-96';

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Enhanced Header */}
      <div className="relative z-30 bg-gradient-to-r from-white/[0.05] to-white/[0.1] backdrop-blur-3xl border-b border-white/[0.15]">
        <div className="max-w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div>
                  <h1 className="font-display font-bold text-white text-lg sm:text-xl">Air Quality Intelligence Map</h1>
                  <p className="text-white/70 text-xs sm:text-sm">Real-time satellite monitoring • {stats.total} regions</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Map Type Selector */}
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium">
                  <Wind className="w-3.5 h-3.5" />
                  Air Quality
                </button>
                <button
                  onClick={() => navigate('/map/heatwave')}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-xs font-medium transition-all"
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  Heatwave
                </button>
                <button
                  onClick={() => navigate('/map/wildfire')}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-xs font-medium transition-all"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Wildfire
                </button>
              </div>

              {/* Live Status */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-semibold text-xs sm:text-sm">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-88px)] overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className={`${sidebarWidth} transition-all duration-300 bg-gradient-to-b from-white/[0.05] to-white/[0.08] backdrop-blur-3xl border-r border-white/[0.15] flex flex-col overflow-y-auto`}>
          {/* Sidebar Header */}
          <div className="p-3 sm:p-4 border-b border-white/[0.1] flex-shrink-0">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="font-display font-bold text-white text-base sm:text-lg">Control Panel</h2>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 sm:p-2 bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-xl border border-white/[0.15] rounded-lg sm:rounded-xl transition-all duration-300"
              >
                {sidebarCollapsed ? <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" /> : <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />}
              </button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <>
              {/* Tab Navigation */}
              <div className="p-4 border-b border-white/[0.1]">
                <div className="flex space-x-1 bg-white/[0.05] rounded-2xl p-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'regions', label: 'Regions', icon: Globe },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeTab === 'overview' && (
                  <>
                    {/* Critical Alerts */}
                    {stats.critical > 0 && (
                      <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <span className="font-bold text-red-400">Critical Alert</span>
                        </div>
                        <p className="text-white/80 text-sm">
                          {stats.critical} region{stats.critical > 1 ? 's' : ''} showing hazardous air quality levels
                        </p>
                      </div>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-cyan-500/15 to-blue-500/15 backdrop-blur-xl border border-cyan-400/25 rounded-2xl p-4 text-center group hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl font-black text-cyan-400">{stats.total}</div>
                        <div className="text-xs text-white/70 font-medium">Total Regions</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500/15 to-red-500/15 backdrop-blur-xl border border-orange-400/25 rounded-2xl p-4 text-center group hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl font-black text-orange-400">{stats.avgAQI}</div>
                        <div className="text-xs text-white/70 font-medium">Average AQI</div>
                      </div>
                    </div>

                    {/* Air Quality Distribution */}
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-white text-base">Air Quality Distribution</h4>
                      <div className="space-y-3">
                        {[
                          { level: 'Good', count: stats.good, color: 'bg-green-500', textColor: 'text-green-400' },
                          { level: 'Moderate', count: stats.moderate, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
                          { level: 'Unhealthy', count: stats.unhealthy, color: 'bg-red-500', textColor: 'text-red-400' }
                        ].map((item) => (
                          <div key={item.level} className="flex items-center justify-between text-sm group">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 ${item.color} rounded-full`} />
                              <span className="text-white/80 group-hover:text-white transition-colors">{item.level}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`${item.textColor} font-bold`}>{item.count}</span>
                              <span className="text-white/50 text-xs">
                                ({Math.round((item.count / stats.total) * 100)}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Weather */}
                    <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.08] backdrop-blur-xl border border-white/[0.15] rounded-2xl p-4">
                      <h4 className="font-display font-bold text-white text-base mb-3 flex items-center space-x-2">
                        <Wind className="w-4 h-4 text-blue-400" />
                        <span>Environmental Conditions</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="w-4 h-4 text-orange-400" />
                          <div>
                            <div className="text-white font-semibold text-sm">28°C</div>
                            <div className="text-white/60 text-xs">Temperature</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="text-white font-semibold text-sm">75%</div>
                            <div className="text-white/60 text-xs">Humidity</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'regions' && (
                  <>
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                      <input
                        type="text"
                        placeholder="Search regions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    {/* Region List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredRegions.map((region) => (
                        <button
                          key={region.id}
                          onClick={() => setSelectedRegion(region)}
                          className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                            selectedRegion?.id === region.id
                              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/30'
                              : 'bg-white/[0.05] hover:bg-white/[0.08] border-white/[0.1] hover:border-white/[0.2]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white text-sm">{region.name}</span>
                            <div className={`w-3 h-3 rounded-full ${getAQIColor(region.aqi)}`} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60 text-xs">AQI: {region.aqi}</span>
                            <span className={`text-xs font-medium ${
                              region.level === 'good' ? 'text-green-400' :
                              region.level === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {region.level.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'analytics' && (
                  <>
                    {/* Pollutant Layers */}
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-white text-base flex items-center space-x-2">
                        <Layers className="w-4 h-4" />
                        <span>Pollutant Layers</span>
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(showPollutantLayers).map(([pollutant, visible]) => (
                          <div key={pollutant} className="flex items-center justify-between p-3 bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-xl transition-all duration-300">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                pollutant === 'pm25' ? 'bg-red-500' :
                                pollutant === 'pm10' ? 'bg-orange-500' :
                                pollutant === 'no2' ? 'bg-yellow-500' :
                                pollutant === 'so2' ? 'bg-green-500' :
                                pollutant === 'co' ? 'bg-purple-500' : 'bg-blue-500'
                              }`} />
                              <span className="text-white/80 text-sm font-medium">{pollutant.toUpperCase()}</span>
                            </div>
                            <button
                              onClick={() => setShowPollutantLayers(prev => ({ ...prev, [pollutant]: !visible }))}
                              className={`w-10 h-6 rounded-full transition-all duration-300 ${
                                visible ? 'bg-blue-500' : 'bg-white/[0.2]'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                                visible ? 'ml-5' : 'ml-1'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pollutant Statistics */}
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-white text-base">Current Levels</h4>
                      <div className="space-y-2">
                        {pollutantStats.slice(0, 4).map((pollutant) => (
                          <div key={pollutant.name} className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white/80 text-sm font-medium">{pollutant.name}</span>
                              <span className={`text-xs ${
                                pollutant.trend === 'up' ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {Number(pollutant.change) > 0 ? '+' : ''}{pollutant.change}%
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-white/[0.1] rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min((pollutant.value / pollutant.limit) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-white text-xs font-semibold">{pollutant.value}{pollutant.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {sidebarCollapsed && (
            <div className="flex flex-col items-center py-4 space-y-4">
              <button className="p-3 bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-xl border border-white/[0.15] rounded-xl transition-all duration-300">
                <BarChart3 className="w-5 h-5 text-white/70" />
              </button>
              <button className="p-3 bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-xl border border-white/[0.15] rounded-xl transition-all duration-300">
                <Globe className="w-5 h-5 text-white/70" />
              </button>
              <button className="p-3 bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-xl border border-white/[0.15] rounded-xl transition-all duration-300">
                <Layers className="w-5 h-5 text-white/70" />
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Map Area */}
        <div className="flex-1 relative">
          <AirQualityMap />

          

          {/* Live Status Panel */}
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-gradient-to-br from-white/[0.1] to-white/[0.15] backdrop-blur-3xl border border-white/[0.2] rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-[280px] sm:max-w-xs">
            <div className="flex items-center space-x-1.5 sm:space-x-2 mb-2 sm:mb-3">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span className="font-semibold text-white text-xs sm:text-sm">Live Monitoring</span>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Last update:</span>
                <span className="text-white font-medium">2 min ago</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Active regions:</span>
                <span className="text-cyan-400 font-medium">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Data source:</span>
                <span className="text-blue-400 font-medium">NASA EOS</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs pt-1.5 sm:pt-2 border-t border-white/[0.1]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium">Real-time monitoring active</span>
              </div>
            </div>
          </div>

          {/* Selected Region Info */}
          {selectedRegion && (
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-br from-white/[0.1] to-white/[0.15] backdrop-blur-3xl border border-white/[0.2] rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-[280px] sm:max-w-sm">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="font-bold text-white text-base sm:text-lg">{selectedRegion.name}</h3>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="p-1 bg-white/[0.1] hover:bg-white/[0.2] rounded-lg transition-all duration-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Air Quality Index</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getAQIColor(selectedRegion.aqi)}`} />
                    <span className="text-white font-bold text-lg">{selectedRegion.aqi}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Status</span>
                  <span className={`font-semibold text-sm ${
                    selectedRegion.level === 'good' ? 'text-green-400' :
                    selectedRegion.level === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {selectedRegion.level.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/[0.1]">
                  <span className="text-white/70 text-xs">
                    Last updated: 2 minutes ago • Population: ~2.1M
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot
        airQualityContext={{
          location: selectedRegion?.name,
          aqi: selectedRegion?.aqi || stats.avgAQI,
          conditions: selectedRegion?.level || 'moderate'
        }}
      />
    </div>
  );
};

export default MapPage;