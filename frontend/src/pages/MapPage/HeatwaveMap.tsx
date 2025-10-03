import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, AlertTriangle, MapPin, Flame } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HeatwaveMap = () => {
  const [mapType, setMapType] = useState<'current' | 'forecast'>('current');

  // Mock heatwave data - in production, this would come from NASA/weather APIs
  const heatwaveData = [
    // USA - Western States (High Heat)
    { lat: 36.7783, lng: -119.4179, location: 'Central California', temp: 115, severity: 'Extreme', risk: 'Critical' },
    { lat: 33.4484, lng: -112.0740, location: 'Phoenix, Arizona', temp: 117, severity: 'Extreme', risk: 'Critical' },
    { lat: 36.1699, lng: -115.1398, location: 'Las Vegas, Nevada', temp: 113, severity: 'Extreme', risk: 'Critical' },
    { lat: 31.9686, lng: -99.9018, location: 'Central Texas', temp: 112, severity: 'Extreme', risk: 'Critical' },
    { lat: 34.0522, lng: -118.2437, location: 'Los Angeles, CA', temp: 108, severity: 'Severe', risk: 'High' },
    { lat: 32.7157, lng: -117.1611, location: 'San Diego, CA', temp: 102, severity: 'Severe', risk: 'High' },
    { lat: 37.7749, lng: -122.4194, location: 'San Francisco, CA', temp: 98, severity: 'Moderate', risk: 'Medium' },

    // USA - Southern States
    { lat: 29.7604, lng: -95.3698, location: 'Houston, Texas', temp: 110, severity: 'Extreme', risk: 'Critical' },
    { lat: 32.7767, lng: -96.7970, location: 'Dallas, Texas', temp: 109, severity: 'Extreme', risk: 'Critical' },
    { lat: 29.4241, lng: -98.4936, location: 'San Antonio, Texas', temp: 108, severity: 'Severe', risk: 'High' },
    { lat: 30.2672, lng: -97.7431, location: 'Austin, Texas', temp: 107, severity: 'Severe', risk: 'High' },
    { lat: 35.2271, lng: -80.8431, location: 'Charlotte, NC', temp: 102, severity: 'Severe', risk: 'High' },
    { lat: 33.7490, lng: -84.3880, location: 'Atlanta, Georgia', temp: 101, severity: 'Severe', risk: 'High' },
    { lat: 30.3322, lng: -81.6557, location: 'Jacksonville, FL', temp: 100, severity: 'Moderate', risk: 'Medium' },
    { lat: 25.7617, lng: -80.1918, location: 'Miami, Florida', temp: 99, severity: 'Moderate', risk: 'Medium' },

    // USA - Central States
    { lat: 35.4676, lng: -97.5164, location: 'Oklahoma City, OK', temp: 106, severity: 'Severe', risk: 'High' },
    { lat: 39.0997, lng: -94.5786, location: 'Kansas City, MO', temp: 104, severity: 'Severe', risk: 'High' },
    { lat: 38.6270, lng: -90.1994, location: 'St. Louis, MO', temp: 103, severity: 'Severe', risk: 'High' },
    { lat: 35.1495, lng: -90.0490, location: 'Memphis, TN', temp: 102, severity: 'Severe', risk: 'High' },

    // USA - New Mexico & Desert Southwest
    { lat: 35.0844, lng: -106.6504, location: 'Albuquerque, NM', temp: 108, severity: 'Severe', risk: 'High' },
    { lat: 32.2226, lng: -110.9747, location: 'Tucson, Arizona', temp: 114, severity: 'Extreme', risk: 'Critical' },
    { lat: 31.7619, lng: -106.4850, location: 'El Paso, Texas', temp: 109, severity: 'Extreme', risk: 'Critical' },

    // Southeast Asia - Tropical Heat & Humidity
    { lat: 13.7563, lng: 100.5018, location: 'Bangkok, Thailand', temp: 106, severity: 'Extreme', risk: 'Critical' },
    { lat: 14.5995, lng: 120.9842, location: 'Manila, Philippines', temp: 104, severity: 'Extreme', risk: 'Critical' },
    { lat: 10.8231, lng: 106.6297, location: 'Ho Chi Minh City, Vietnam', temp: 103, severity: 'Severe', risk: 'High' },
    { lat: 21.0285, lng: 105.8542, location: 'Hanoi, Vietnam', temp: 102, severity: 'Severe', risk: 'High' },
    { lat: -6.2088, lng: 106.8456, location: 'Jakarta, Indonesia', temp: 101, severity: 'Severe', risk: 'High' },
    { lat: 1.3521, lng: 103.8198, location: 'Singapore', temp: 100, severity: 'Severe', risk: 'High' },
    { lat: 3.1390, lng: 101.6869, location: 'Kuala Lumpur, Malaysia', temp: 102, severity: 'Severe', risk: 'High' },
    { lat: 16.8661, lng: 96.1951, location: 'Yangon, Myanmar', temp: 105, severity: 'Extreme', risk: 'Critical' },
    { lat: 11.5564, lng: 104.9282, location: 'Phnom Penh, Cambodia', temp: 104, severity: 'Extreme', risk: 'Critical' },
    { lat: 17.9757, lng: 102.6331, location: 'Vientiane, Laos', temp: 103, severity: 'Severe', risk: 'High' },

    // Southeast Asia - Indonesia & Malaysia Region
    { lat: -6.9175, lng: 107.6191, location: 'Bandung, Indonesia', temp: 98, severity: 'Moderate', risk: 'Medium' },
    { lat: -7.2575, lng: 112.7521, location: 'Surabaya, Indonesia', temp: 100, severity: 'Severe', risk: 'High' },
    { lat: 5.4141, lng: 100.3288, location: 'George Town, Malaysia', temp: 99, severity: 'Moderate', risk: 'Medium' },
    { lat: 1.5535, lng: 110.3593, location: 'Kuching, Malaysia', temp: 98, severity: 'Moderate', risk: 'Medium' },
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
