import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, AlertTriangle, MapPin, Flame } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HeatwaveMap = () => {
  const [mapType, setMapType] = useState<'current' | 'forecast'>('current');

  // Mock heatwave data - in production, this would come from NASA/weather APIs
  const heatwaveData = [
    { lat: 36.7783, lng: -119.4179, location: 'California', temp: 115, severity: 'Extreme', risk: 'Critical' },
    { lat: 33.4484, lng: -112.0740, location: 'Arizona', temp: 110, severity: 'Severe', risk: 'High' },
    { lat: 36.1699, lng: -115.1398, location: 'Nevada', temp: 105, severity: 'Moderate', risk: 'Medium' },
    { lat: 31.9686, lng: -99.9018, location: 'Texas', temp: 112, severity: 'Extreme', risk: 'Critical' },
    { lat: 34.0522, lng: -118.2437, location: 'Los Angeles', temp: 108, severity: 'Severe', risk: 'High' },
    { lat: 33.4484, lng: -112.0740, location: 'Phoenix', temp: 117, severity: 'Extreme', risk: 'Critical' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return '#dc2626';
      case 'Severe': return '#ea580c';
      case 'Moderate': return '#f59e0b';
      default: return '#facc15';
    }
  };

  const getSeveritySize = (severity: string) => {
    switch (severity) {
      case 'Extreme': return 15;
      case 'Severe': return 12;
      case 'Moderate': return 9;
      default: return 6;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Header */}
      <div className="relative z-30 bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-3xl border-b border-orange-400/30">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/map"
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-6 h-6 text-orange-400" />
                  <h1 className="font-display font-bold text-white text-xl">Heatwave Monitoring</h1>
                </div>
                <p className="text-white/70 text-sm">Real-time Temperature Tracking & Heat Advisories</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-white text-sm font-medium">{heatwaveData.length} Active Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Type Selector */}
      <div className="absolute top-24 left-4 z-20 flex gap-2">
        <button
          onClick={() => setMapType('current')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            mapType === 'current'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Current
        </button>
        <button
          onClick={() => setMapType('forecast')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            mapType === 'forecast'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Forecast
        </button>
      </div>

      {/* Alerts Panel */}
      <div className="absolute top-24 right-4 z-20 w-80 max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="bg-black/40 backdrop-blur-xl border border-orange-400/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Active Heatwaves
            </h3>
          </div>

          {heatwaveData.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${
                alert.severity === 'Extreme'
                  ? 'bg-red-500/20 border-red-400/40'
                  : alert.severity === 'Severe'
                  ? 'bg-orange-500/20 border-orange-400/40'
                  : 'bg-yellow-500/20 border-yellow-400/40'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/70" />
                    <h4 className="text-white font-medium">{alert.location}</h4>
                  </div>
                  <p className="text-xs text-white/60 mt-1">{alert.severity} Heat Advisory</p>
                </div>
                <span className="text-2xl font-bold text-white">{alert.temp}°F</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Risk Level:</span>
                <span className={`font-semibold ${
                  alert.risk === 'Critical' ? 'text-red-400' :
                  alert.risk === 'High' ? 'text-orange-400' : 'text-yellow-400'
                }`}>{alert.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative h-screen pt-20">
        <MapContainer
          center={[37.0902, -95.7129]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {heatwaveData.map((location, idx) => (
            <CircleMarker
              key={idx}
              center={[location.lat, location.lng]}
              radius={getSeveritySize(location.severity)}
              fillColor={getSeverityColor(location.severity)}
              color={getSeverityColor(location.severity)}
              weight={2}
              opacity={0.8}
              fillOpacity={0.5}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <h4 className="font-bold text-gray-900">{location.location}</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-bold text-red-600">{location.temp}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Severity:</span>
                      <span className="font-semibold text-gray-900">{location.severity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk:</span>
                      <span className={`font-semibold ${
                        location.risk === 'Critical' ? 'text-red-600' :
                        location.risk === 'High' ? 'text-orange-600' : 'text-yellow-600'
                      }`}>{location.risk}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-6 left-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-xs z-10">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Temperature Scale
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-gradient-to-r from-red-600 to-red-800 rounded"></div>
                <span className="text-white text-sm">Extreme</span>
              </div>
              <span className="text-white/70 text-sm">&gt;110°F</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                <span className="text-white text-sm">Severe</span>
              </div>
              <span className="text-white/70 text-sm">100-110°F</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded"></div>
                <span className="text-white text-sm">Moderate</span>
              </div>
              <span className="text-white/70 text-sm">90-100°F</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-gradient-to-r from-green-400 to-yellow-400 rounded"></div>
                <span className="text-white text-sm">Normal</span>
              </div>
              <span className="text-white/70 text-sm">&lt;90°F</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatwaveMap;
