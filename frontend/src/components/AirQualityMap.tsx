import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import {
  Satellite, ExternalLink, Layers, Cloud, Wind, Activity, Eye, Calendar,
  Maximize2, ZoomIn, ZoomOut, Crosshair, Info, TrendingUp, Map as MapIcon, Loader
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom map controller with enhanced features
const MapController = ({ center, zoom, onMapReady }: { center: LatLngExpression; zoom: number; onMapReady?: (map: L.Map) => void }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
    onMapReady?.(map);
  }, [map, center, zoom, onMapReady]);

  return null;
};

// Interactive map event handler
const MapEventHandler = ({ onCoordinatesChange }: { onCoordinatesChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    mousemove: (e) => {
      onCoordinatesChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const AirQualityMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [center] = useState<LatLngExpression>([40, -100]);
  const [zoom, setZoom] = useState(4);
  const [activeLayer, setActiveLayer] = useState<'Aerosol' | 'NO2' | 'CO' | 'Satellite'>('Aerosol');
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 40, lng: -100 });
  const [isLoading, setIsLoading] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // NASA GIBS layers with enhanced metadata
  const getTileLayer = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const dateStr = today.toISOString().split('T')[0];

    const layers = {
      Aerosol: {
        url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Aerosol/default/${dateStr}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
        name: 'Aerosol Optical Depth',
        description: 'Atmospheric aerosol particles - key air quality indicator',
        color: 'from-orange-500 to-red-500',
        icon: Cloud,
        dataType: 'Air Quality',
        unit: 'AOD',
        range: '0.0 - 5.0',
        satellite: 'MODIS Terra'
      },
      NO2: {
        url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/OMI_Aerosol_Index/default/${dateStr}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
        name: 'Aerosol Index',
        description: 'UV Aerosol Index from OMI - indicates air quality',
        color: 'from-purple-500 to-pink-500',
        icon: Activity,
        dataType: 'Air Quality',
        unit: 'Index',
        range: '-2.0 - 5.0',
        satellite: 'OMI/Aura'
      },
      CO: {
        url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Aerosol/default/${dateStr}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
        name: 'Aerosol (Aqua)',
        description: 'Atmospheric aerosol from MODIS Aqua satellite',
        color: 'from-yellow-500 to-orange-500',
        icon: Wind,
        dataType: 'Air Quality',
        unit: 'AOD',
        range: '0.0 - 5.0',
        satellite: 'MODIS Aqua'
      },
      Satellite: {
        url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
        name: 'True Color Satellite',
        description: 'Real satellite imagery from MODIS Terra',
        color: 'from-blue-500 to-cyan-500',
        icon: Eye,
        dataType: 'Imagery',
        unit: 'RGB',
        range: 'Visual',
        satellite: 'MODIS Terra'
      }
    };

    return layers[activeLayer];
  };

  const tileLayer = getTileLayer();
  const LayerIcon = tileLayer.icon;

  const today = new Date();
  today.setDate(today.getDate() - 1);
  const displayDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const worldviewUrl = `https://worldview.earthdata.nasa.gov/?v=-130,15,-60,55&l=Reference_Labels_15m,Reference_Features_15m,Coastlines_15m,${
    activeLayer === 'Aerosol' ? 'MODIS_Terra_Aerosol' :
    activeLayer === 'NO2' ? 'OMI_Aerosol_Index' :
    activeLayer === 'CO' ? 'MODIS_Aqua_Aerosol' :
    'MODIS_Terra_CorrectedReflectance_TrueColor'
  }`;

  const layerButtons = [
    { key: 'Aerosol', label: 'Aerosol', icon: Cloud, gradient: 'from-orange-500 to-red-500' },
    { key: 'NO2', label: 'Aerosol Index', icon: Activity, gradient: 'from-purple-500 to-pink-500' },
    { key: 'CO', label: 'Aqua', icon: Wind, gradient: 'from-yellow-500 to-orange-500' },
    { key: 'Satellite', label: 'Satellite', icon: Eye, gradient: 'from-blue-500 to-cyan-500' }
  ] as const;

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
      setZoom(mapRef.current.getZoom());
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
      setZoom(mapRef.current.getZoom());
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleLayerChange = (layer: typeof activeLayer) => {
    setIsLoading(true);
    setActiveLayer(layer);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950`}>
      {/* Main Map Container */}
      <div className="h-full flex flex-col">

        {/* Top Control Bar - Floating Glass Panel */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between gap-4">

          {/* Left: Title & Layer Info */}
          <div className="flex-1 flex items-center gap-4">
            <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${tileLayer.color} rounded-xl flex items-center justify-center shadow-lg animate-pulse`}>
                  <LayerIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    {tileLayer.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${tileLayer.color} text-white`}>
                      {tileLayer.dataType}
                    </span>
                  </h3>
                  <p className="text-xs text-white/60">{tileLayer.satellite} • {displayDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: External Link */}
          <a
            href={worldviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 border border-white/20"
          >
            <ExternalLink className="w-4 h-4" />
            <span>NASA Worldview</span>
          </a>
        </div>

        {/* Left Side Panel - Layer Selector */}
        <div className="absolute top-24 left-4 z-[1000] w-72">
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h4 className="font-bold text-white">Data Layers</h4>
            </div>

            <div className="space-y-2">
              {layerButtons.map((layer) => {
                const Icon = layer.icon;
                return (
                  <button
                    key={layer.key}
                    onClick={() => handleLayerChange(layer.key)}
                    className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                      activeLayer === layer.key
                        ? `bg-gradient-to-r ${layer.gradient} shadow-lg scale-105`
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="relative z-10 flex items-center gap-3 p-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeLayer === layer.key ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-white text-sm">{layer.label}</div>
                      </div>
                      {activeLayer === layer.key && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                    {activeLayer === layer.key && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${layer.gradient} opacity-20 animate-pulse`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Layer Controls */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  showLabels ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-white/5 border border-white/10'
                }`}
              >
                <span className="text-white text-sm font-medium">Map Labels</span>
                <div className={`w-12 h-6 rounded-full transition-all ${showLabels ? 'bg-blue-500' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all ${showLabels ? 'ml-6' : 'ml-0.5'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Panel - Data Statistics */}
        {showStats && (
          <div className="absolute top-24 right-4 z-[1000] w-80">
            <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-white">Live Statistics</h4>
                </div>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {/* Data Range */}
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/60 mb-1">Data Range</div>
                  <div className="font-bold text-white">{tileLayer.range}</div>
                  <div className="text-xs text-white/50 mt-1">{tileLayer.unit}</div>
                </div>

                {/* Coverage */}
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/60 mb-1">Coverage</div>
                  <div className="font-bold text-white">Global</div>
                  <div className="text-xs text-white/50 mt-1">All continents</div>
                </div>

                {/* Resolution */}
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/60 mb-1">Resolution</div>
                  <div className="font-bold text-white">
                    {activeLayer === 'Satellite' ? '250m' : '1km'}
                  </div>
                  <div className="text-xs text-white/50 mt-1">Spatial</div>
                </div>

                {/* Update Frequency */}
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/60 mb-1">Update</div>
                  <div className="font-bold text-white">Daily</div>
                  <div className="text-xs text-white/50 mt-1">Last: {displayDate}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Left - Legend */}
        {showLegend && activeLayer !== 'Satellite' && (
          <div className="absolute bottom-8 left-4 z-[1000] w-80">
            <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-white text-sm">Color Scale</h4>
                </div>
                <button
                  onClick={() => setShowLegend(false)}
                  className="text-white/50 hover:text-white transition-colors text-xs"
                >
                  Hide
                </button>
              </div>

              {/* Gradient Bar */}
              <div className="relative h-8 rounded-lg overflow-hidden mb-2">
                <div className={`absolute inset-0 bg-gradient-to-r ${tileLayer.color}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-yellow-500 to-red-600 opacity-75" />
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-xs text-white/70">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>

              <div className="mt-3 text-xs text-white/50">
                {tileLayer.description}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Right - Coordinates & Controls */}
        <div className="absolute bottom-8 right-4 z-[1000] flex flex-col gap-4">

          {/* Coordinates Display */}
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 py-2 shadow-2xl">
            <div className="flex items-center gap-3 text-xs">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <div className="font-mono text-white/80">
                <span className="text-white/50">Lat:</span> {coordinates.lat.toFixed(4)}°
                <span className="mx-2 text-white/30">|</span>
                <span className="text-white/50">Lng:</span> {coordinates.lng.toFixed(4)}°
              </div>
            </div>
          </div>

          {/* Custom Zoom Controls */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="w-12 h-12 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-white shadow-2xl hover:scale-105"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-12 h-12 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-white shadow-2xl hover:scale-105"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleFullscreen}
              className="w-12 h-12 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-white shadow-2xl hover:scale-105"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[2000] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <Loader className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-semibold">Loading layer data...</p>
            </div>
          </div>
        )}

        {/* Map Canvas */}
        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', backgroundColor: '#000814' }}
            className="z-0"
            zoomControl={false}
            attributionControl={false}
          >
            <MapController
              center={center}
              zoom={zoom}
              onMapReady={(map) => {
                mapRef.current = map;
              }}
            />
            <MapEventHandler onCoordinatesChange={(lat, lng) => setCoordinates({ lat, lng })} />

            {/* Dark Base Layer */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* NASA GIBS Data Layer */}
            <TileLayer
              url={tileLayer.url}
              attribution='&copy; <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>'
              opacity={activeLayer === 'Satellite' ? 1 : 0.8}
              key={activeLayer}
            />

            {/* Optional Labels Layer */}
            {showLabels && (
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
                opacity={0.9}
              />
            )}
          </MapContainer>

          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse" />

          {/* Vignette Effect */}
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-slate-950/40" />
        </div>

        {/* NASA Branding Footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 shadow-2xl flex items-center gap-3">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <div className="text-xs">
              <span className="text-white/50">Powered by</span>
              <span className="text-white font-bold ml-1">NASA Earth Observing System</span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Toggle Stats Button (when hidden) */}
      {!showStats && (
        <button
          onClick={() => setShowStats(true)}
          className="absolute top-24 right-4 z-[1000] w-12 h-12 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-white shadow-2xl"
        >
          <TrendingUp className="w-5 h-5" />
        </button>
      )}

      {/* Toggle Legend Button (when hidden) */}
      {!showLegend && activeLayer !== 'Satellite' && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-8 left-4 z-[1000] w-12 h-12 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-white shadow-2xl"
        >
          <Info className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default AirQualityMap;
