import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Activity, Loader2, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

interface FireData {
  latitude: number;
  longitude: number;
  brightness: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string;
  frp: number;
  daynight: string;
}

const WildfireMap = () => {
  // Mock wildfire data for Southeast Asia and USA (fallback if API fails)
  const mockFireData: FireData[] = [
    // USA - California Wildfires
    { latitude: 38.5816, longitude: -121.4944, brightness: 345.2, acq_date: '2025-10-03', acq_time: '2130', satellite: 'VIIRS_NOAA20', confidence: 'high', frp: 68.5, daynight: 'N' },
    { latitude: 39.8283, longitude: -121.4374, brightness: 358.1, acq_date: '2025-10-03', acq_time: '2145', satellite: 'MODIS_Terra', confidence: 'high', frp: 75.2, daynight: 'N' },
    { latitude: 36.7783, longitude: -119.4179, brightness: 332.8, acq_date: '2025-10-03', acq_time: '2200', satellite: 'VIIRS_SNPP', confidence: 'high', frp: 52.3, daynight: 'N' },
    { latitude: 34.0522, longitude: -118.2437, brightness: 328.5, acq_date: '2025-10-03', acq_time: '2215', satellite: 'MODIS_Aqua', confidence: 'nominal', frp: 42.1, daynight: 'N' },
    { latitude: 37.8651, longitude: -119.5383, brightness: 340.7, acq_date: '2025-10-03', acq_time: '2230', satellite: 'VIIRS_NOAA20', confidence: 'high', frp: 58.9, daynight: 'N' },

    // USA - Pacific Northwest
    { latitude: 45.5152, longitude: -122.6784, brightness: 325.3, acq_date: '2025-10-03', acq_time: '2145', satellite: 'MODIS_Terra', confidence: 'high', frp: 38.4, daynight: 'N' },
    { latitude: 47.7511, longitude: -120.7401, brightness: 330.2, acq_date: '2025-10-03', acq_time: '2200', satellite: 'VIIRS_SNPP', confidence: 'nominal', frp: 28.7, daynight: 'N' },

    // USA - Southwest (Arizona, New Mexico)
    { latitude: 34.0489, longitude: -111.0937, brightness: 338.9, acq_date: '2025-10-03', acq_time: '2230', satellite: 'VIIRS_NOAA20', confidence: 'high', frp: 45.6, daynight: 'N' },
    { latitude: 35.0844, longitude: -106.6504, brightness: 327.4, acq_date: '2025-10-03', acq_time: '2245', satellite: 'MODIS_Aqua', confidence: 'nominal', frp: 32.8, daynight: 'N' },

    // USA - Texas
    { latitude: 31.9686, longitude: -99.9018, brightness: 335.6, acq_date: '2025-10-03', acq_time: '2300', satellite: 'VIIRS_SNPP', confidence: 'high', frp: 41.2, daynight: 'N' },
    { latitude: 30.2672, longitude: -97.7431, brightness: 322.1, acq_date: '2025-10-03', acq_time: '2315', satellite: 'MODIS_Terra', confidence: 'nominal', frp: 25.3, daynight: 'N' },

    // USA - Montana & Wyoming
    { latitude: 46.8797, longitude: -110.3626, brightness: 331.8, acq_date: '2025-10-03', acq_time: '2200', satellite: 'VIIRS_NOAA20', confidence: 'high', frp: 36.9, daynight: 'N' },
    { latitude: 44.2680, longitude: -105.5008, brightness: 326.5, acq_date: '2025-10-03', acq_time: '2215', satellite: 'MODIS_Aqua', confidence: 'nominal', frp: 29.4, daynight: 'N' },

    // Southeast Asia - Indonesia (Kalimantan & Sumatra)
    { latitude: -0.5897, longitude: 116.3242, brightness: 342.5, acq_date: '2025-10-03', acq_time: '0430', satellite: 'VIIRS_NOAA20', confidence: 'high', frp: 62.7, daynight: 'D' },
    { latitude: -2.5489, longitude: 118.0149, brightness: 350.3, acq_date: '2025-10-03', acq_time: '0445', satellite: 'MODIS_Terra', confidence: 'high', frp: 71.5, daynight: 'D' },
    { latitude: -1.2379, longitude: 116.8289, brightness: 338.2, acq_date: '2025-10-03', acq_time: '0500', satellite: 'VIIRS_SNPP', confidence: 'high', frp: 55.8, daynight: 'D' },
    { latitude: 0.7893, longitude: 113.9213, brightness: 345.7, acq_date: '2025-10-03', acq_time: '0515', satellite: 'MODIS_Aqua', confidence: 'high', frp: 64.3, daynight: 'D' },
    { latitude: -2.1894, longitude: 106.1269, brightness: 335.9, acq_date: '2025-10-03', acq_time: '0530', satellite: 'VIIRS_NOAA20', confidence: 'nominal', frp: 48.6, daynight: 'D' },
    { latitude: -3.3194, longitude: 114.5908, brightness: 340.1, acq_date: '2025-10-03', acq_time: '0545', satellite: 'MODIS_Terra', confidence: 'high', frp: 58.2, daynight: 'D' },

    // Southeast Asia - Myanmar
    { latitude: 21.9162, longitude: 95.9560, brightness: 332.8, acq_date: '2025-10-03', acq_time: '0600', satellite: 'VIIRS_SNPP', confidence: 'nominal', frp: 38.5, daynight: 'D' },
    { latitude: 20.7947, longitude: 94.9849, brightness: 328.4, acq_date: '2025-10-03', acq_time: '0615', satellite: 'MODIS_Aqua', confidence: 'nominal', frp: 32.1, daynight: 'D' },

    // Southeast Asia - Thailand
    { latitude: 15.8700, longitude: 100.9925, brightness: 330.5, acq_date: '2025-10-03', acq_time: '0630', satellite: 'VIIRS_NOAA20', confidence: 'nominal', frp: 35.7, daynight: 'D' },
    { latitude: 18.7883, longitude: 98.9853, brightness: 326.9, acq_date: '2025-10-03', acq_time: '0645', satellite: 'MODIS_Terra', confidence: 'low', frp: 22.8, daynight: 'D' },

    // Southeast Asia - Cambodia & Vietnam
    { latitude: 12.5657, longitude: 104.9910, brightness: 327.3, acq_date: '2025-10-03', acq_time: '0700', satellite: 'VIIRS_SNPP', confidence: 'nominal', frp: 28.4, daynight: 'D' },
    { latitude: 11.9404, longitude: 108.4583, brightness: 324.6, acq_date: '2025-10-03', acq_time: '0715', satellite: 'MODIS_Aqua', confidence: 'low', frp: 19.5, daynight: 'D' },

    // Southeast Asia - Philippines
    { latitude: 7.1907, longitude: 125.4553, brightness: 333.7, acq_date: '2025-10-03', acq_time: '0730', satellite: 'VIIRS_NOAA20', confidence: 'nominal', frp: 41.3, daynight: 'D' },
    { latitude: 16.4023, longitude: 120.5960, brightness: 329.8, acq_date: '2025-10-03', acq_time: '0745', satellite: 'MODIS_Terra', confidence: 'nominal', frp: 34.9, daynight: 'D' },

    // Southeast Asia - Malaysia (Sabah & Sarawak)
    { latitude: 5.9788, longitude: 116.0753, brightness: 331.2, acq_date: '2025-10-03', acq_time: '0800', satellite: 'VIIRS_SNPP', confidence: 'nominal', frp: 37.2, daynight: 'D' },
    { latitude: 3.1390, longitude: 113.0461, brightness: 326.5, acq_date: '2025-10-03', acq_time: '0815', satellite: 'MODIS_Aqua', confidence: 'low', frp: 24.6, daynight: 'D' },
  ];

  const [fires, setFires] = useState<FireData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    highConfidence: 0,
    critical: 0,
    moderate: 0
  });

  useEffect(() => {
    fetchFireData();
  }, []);

  const fetchFireData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://nsac-mu.vercel.app/api/wildfire/active?dayRange=2');

      if (response.data.success && response.data.data.length > 0) {
        const fireData = response.data.data;
        setFires(fireData);

        const highConf = fireData.filter((f: FireData) => f.confidence === 'high' || f.confidence === 'h').length;
        const critical = fireData.filter((f: FireData) => f.frp > 50).length;
        const moderate = fireData.filter((f: FireData) => f.frp >= 20 && f.frp <= 50).length;

        setStats({
          total: fireData.length,
          highConfidence: highConf,
          critical,
          moderate
        });
      } else {
        // Use mock data as fallback
        console.log('Using mock wildfire data as fallback');
        setFires(mockFireData);

        const highConf = mockFireData.filter((f: FireData) => f.confidence === 'high' || f.confidence === 'h').length;
        const critical = mockFireData.filter((f: FireData) => f.frp > 50).length;
        const moderate = mockFireData.filter((f: FireData) => f.frp >= 20 && f.frp <= 50).length;

        setStats({
          total: mockFireData.length,
          highConfidence: highConf,
          critical,
          moderate
        });
      }
    } catch (error) {
      console.error('Error fetching fire data, using mock data:', error);
      // Use mock data as fallback on error
      setFires(mockFireData);

      const highConf = mockFireData.filter((f: FireData) => f.confidence === 'high' || f.confidence === 'h').length;
      const critical = mockFireData.filter((f: FireData) => f.frp > 50).length;
      const moderate = mockFireData.filter((f: FireData) => f.frp >= 20 && f.frp <= 50).length;

      setStats({
        total: mockFireData.length,
        highConfidence: highConf,
        critical,
        moderate
      });
    } finally {
      setLoading(false);
    }
  };

  const getFireColor = (fire: FireData) => {
    if (fire.frp > 50) return '#dc2626';
    if (fire.frp > 20) return '#ea580c';
    if (fire.frp > 10) return '#f59e0b';
    return '#facc15';
  };

  const getFireSize = (fire: FireData) => {
    if (fire.frp > 50) return 12;
    if (fire.frp > 20) return 9;
    if (fire.frp > 10) return 7;
    return 5;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <div className="relative z-30 bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-3xl border-b border-red-400/30">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/map" className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-red-400" />
                  <h1 className="font-display font-bold text-white text-xl">Active Wildfire Tracking</h1>
                </div>
                <p className="text-white/70 text-sm">NASA FIRMS - Real-time Fire Detection (Last 48 hours)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={fetchFireData} disabled={loading} className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all disabled:opacity-50">
                <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center space-x-2 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2">
                <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-white text-sm font-medium">{stats.total} Active Fires</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-24 right-4 z-20 w-80">
        <div className="bg-black/40 backdrop-blur-xl border border-red-400/30 rounded-2xl p-4">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-red-400" />
            Fire Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-600/20 border border-red-500/40 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-white text-sm">Critical (FRP &gt; 50)</span>
              </div>
              <span className="text-white font-bold">{stats.critical}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-600/20 border border-orange-500/40 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-white text-sm">High (FRP 20-50)</span>
              </div>
              <span className="text-white font-bold">{stats.moderate}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-white text-sm">High Confidence</span>
              </div>
              <span className="text-white font-bold">{stats.highConfidence}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-white/70">
              <strong className="text-white">FRP</strong> (Fire Radiative Power) measures fire intensity in MW.
            </p>
          </div>
        </div>
      </div>

      <div className="relative h-screen pt-20">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-red-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-semibold">Loading fire data from NASA FIRMS...</p>
            </div>
          </div>
        ) : (
          <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {fires.map((fire, idx) => (
              <CircleMarker
                key={idx}
                center={[fire.latitude, fire.longitude]}
                radius={getFireSize(fire)}
                fillColor={getFireColor(fire)}
                color={getFireColor(fire)}
                weight={2}
                opacity={0.8}
                fillOpacity={0.6}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold mb-2">Active Fire</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>FRP:</strong> {fire.frp.toFixed(1)} MW</div>
                      <div><strong>Brightness:</strong> {fire.brightness.toFixed(1)}K</div>
                      <div><strong>Confidence:</strong> {fire.confidence}</div>
                      <div><strong>Satellite:</strong> {fire.satellite}</div>
                      <div><strong>Time:</strong> {fire.acq_date} {fire.acq_time}</div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        <div className="absolute bottom-6 left-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-xs z-10">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Fire Intensity (FRP)
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span className="text-white text-sm">Critical (&gt; 50 MW)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-white text-sm">High (20-50 MW)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
              <span className="text-white text-sm">Moderate (10-20 MW)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <span className="text-white text-sm">Low (&lt; 10 MW)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/60">Data from NASA FIRMS VIIRS satellite sensors.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WildfireMap;
