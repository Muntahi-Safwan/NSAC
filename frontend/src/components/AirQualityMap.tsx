import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { mockMapZones, getAQIColor, northAmericaLocation } from '../data/mockData';
import { Satellite, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom hook to handle map initialization
const MapController = () => {
  const map = useMap();

  useEffect(() => {
    // Set the view to North America
    map.setView([northAmericaLocation.lat, northAmericaLocation.lng], 4);
  }, [map]);

  return null;
};

const AirQualityMap: React.FC = () => {
  const center: LatLngExpression = [northAmericaLocation.lat, northAmericaLocation.lng];

  const getRadius = (aqi: number) => {
    // Scale radius based on AQI value for better visualization
    return Math.max(15, Math.min(aqi / 10, 35));
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <h3 className="font-display font-bold text-white text-base sm:text-lg md:text-xl">Air Quality Zones</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs sm:text-sm text-white/70">
          <Satellite className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Live Satellite Data</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-white/70">Good</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-white/70">Moderate</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-xs text-white/70">Unhealthy</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 min-h-[400px] relative">
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapController />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            className="map-layer"
          />

          {mockMapZones.map((zone, index) => (
            <CircleMarker
              key={index}
              center={[zone.lat, zone.lng]}
              radius={getRadius(zone.aqi)}
              color={getAQIColor(zone.level)}
              fillColor={getAQIColor(zone.level)}
              fillOpacity={0.4}
              weight={2}
              opacity={0.8}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="font-bold text-gray-800 text-base mb-2">
                    {zone.city}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">AQI:</span>
                      <span className="font-bold text-lg" style={{ color: getAQIColor(zone.level) }}>
                        {zone.aqi}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Status:</span>
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                        style={{
                          backgroundColor: `${getAQIColor(zone.level)}20`,
                          color: getAQIColor(zone.level)
                        }}
                      >
                        {zone.level.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      NASA Earth Observing System Data
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Overlay gradient for better integration */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Coverage: Bangladesh Region</span>
          <span>Updated: Real-time</span>
        </div>
      </div>
    </div>
  );
};

export default AirQualityMap;