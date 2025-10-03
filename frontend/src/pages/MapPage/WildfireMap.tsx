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

      if (response.data.success) {
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
      }
    } catch (error) {
      console.error('Error fetching fire data:', error);
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
