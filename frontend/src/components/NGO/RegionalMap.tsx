import React, { useState, useEffect, useMemo } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { MapPin, Phone, Heart, Calendar, CheckCircle, AlertCircle, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: string[];
  primaryPhone?: string;
  age?: number;
  diseases?: string[];
  allergies?: string[];
  isSafe: boolean;
  safetyUpdatedAt?: string;
  lastLocation?: {
    city?: string;
    region?: string;
    country?: string;
    lat: number;
    lng: number;
  };
}

interface RegionalMapProps {
  users: User[];
  ngoRegion?: string;
}

const RegionalMap: React.FC<RegionalMapProps> = ({ users, ngoRegion }) => {
  const [center, setCenter] = useState<[number, number]>([23.8103, 90.4125]);
  const [zoom, setZoom] = useState(12);
  const [mapProvider, setMapProvider] = useState<'osm' | 'satellite'>('osm');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Filter users with location
  const usersWithLocation = useMemo(() =>
    users.filter(u => u.lastLocation?.lat && u.lastLocation?.lng),
    [users]
  );

  const safeCount = usersWithLocation.filter(u => u.isSafe).length;
  const atRiskCount = usersWithLocation.filter(u => !u.isSafe).length;

  // Auto-center map on users
  useEffect(() => {
    if (usersWithLocation.length > 0) {
      const lats = usersWithLocation.map(u => u.lastLocation!.lat);
      const lngs = usersWithLocation.map(u => u.lastLocation!.lng);

      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      const latSpread = Math.max(...lats) - Math.min(...lats);
      const lngSpread = Math.max(...lngs) - Math.min(...lngs);
      const maxSpread = Math.max(latSpread, lngSpread);

      let newZoom = 12;
      if (maxSpread < 0.01) newZoom = 15;
      else if (maxSpread < 0.05) newZoom = 13;
      else if (maxSpread < 0.1) newZoom = 12;
      else if (maxSpread < 0.5) newZoom = 10;
      else if (maxSpread < 1) newZoom = 9;
      else newZoom = 8;

      setCenter([avgLat, avgLng]);
      setZoom(newZoom);
    }
  }, [usersWithLocation]);

  // Map tile providers - using working tile servers
  const osmProvider = (x: number, y: number, z: number) => {
    const s = String.fromCharCode(97 + ((x + y + z) % 3)); // a, b, or c
    return `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  const satelliteProvider = (x: number, y: number, z: number) => {
    // Using ESRI World Imagery
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  };

  // Custom marker component
  const UserMarkerIcon = ({ user, isHovered }: { user: User; isHovered: boolean }) => {
    const isSafe = user.isSafe;
    const color = isSafe ? '#10b981' : '#ef4444';
    const size = isHovered ? 48 : 40;

    return (
      <div className="relative" style={{ width: `${size}px`, height: `${size * 1.2}px` }}>
        {/* Pulsing ring for at-risk users */}
        {!isSafe && (
          <div className="absolute -inset-2 bg-red-500/30 rounded-full animate-ping"></div>
        )}

        <svg width={size} height={size * 1.2} viewBox="0 0 40 48" className="drop-shadow-lg relative z-10">
          <defs>
            <linearGradient id={`gradient-${user.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          <path
            d="M20 0C12.268 0 6 6.268 6 14c0 10.5 14 34 14 34s14-23.5 14-34c0-7.732-6.268-14-14-14z"
            fill={`url(#gradient-${user.id})`}
            stroke="white"
            strokeWidth="3"
          />
          <circle cx="20" cy="14" r="7" fill="white" />
          {isSafe ? (
            <path
              d="M17 14l2.5 2.5L24 12"
              stroke={color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <circle cx="20" cy="14" r="3" fill={color} />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-white/10 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Regional Coverage Map</h3>
              <p className="text-sm text-blue-300">
                {ngoRegion ? `${ngoRegion} Region` : 'All Regions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Map Style Selector */}
            <div className="flex items-center gap-1 bg-slate-700/50 rounded-xl p-1 backdrop-blur-sm">
              <button
                onClick={() => setMapProvider('osm')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mapProvider === 'osm'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-blue-300 hover:bg-slate-600/50'
                }`}
              >
                🗺️ Street
              </button>
              <button
                onClick={() => setMapProvider('satellite')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mapProvider === 'satellite'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-blue-300 hover:bg-slate-600/50'
                }`}
              >
                🛰️ Satellite
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-sm font-bold text-green-300">{safeCount} Safe</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 rounded-lg border border-red-400/30">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-red-300">{atRiskCount} At Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative w-full">
        {usersWithLocation.length > 0 ? (
          <Map
            height={500}
            defaultCenter={center}
            defaultZoom={zoom}
            provider={mapProvider === 'osm' ? osmProvider : satelliteProvider}
            dprs={[1, 2]}
          >
            {/* User Markers */}
            {usersWithLocation.map((user) => (
              <Marker
                key={user.id}
                width={hoveredUser === user.id ? 48 : 40}
                anchor={[user.lastLocation!.lat, user.lastLocation!.lng]}
                onClick={() => setSelectedUser(user)}
                onMouseOver={() => setHoveredUser(user.id)}
                onMouseOut={() => setHoveredUser(null)}
              >
                <div className="cursor-pointer">
                  <UserMarkerIcon user={user} isHovered={hoveredUser === user.id} />
                </div>
              </Marker>
            ))}

            {/* User Info Popup */}
            {selectedUser && selectedUser.lastLocation && (
              <Overlay
                anchor={[selectedUser.lastLocation.lat, selectedUser.lastLocation.lng]}
                offset={[0, -60]}
              >
                <div className="relative animate-fade-in">
                  <div className="bg-white rounded-xl shadow-2xl p-5 min-w-[320px] max-w-[360px] border-2 border-gray-200">
                    {/* Close Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(null);
                      }}
                      className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors z-10"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* Header */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-1 pr-8">
                        {selectedUser.firstName || 'Unknown'} {selectedUser.lastName || ''}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">{selectedUser.email}</p>

                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        selectedUser.isSafe
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-red-100 text-red-700 border-2 border-red-300 animate-pulse'
                      }`}>
                        {selectedUser.isSafe ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Safe
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            At Risk
                          </>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Location</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {selectedUser.lastLocation.city}
                            {selectedUser.lastLocation.region && `, ${selectedUser.lastLocation.region}`}
                          </p>
                        </div>
                      </div>

                      {selectedUser.primaryPhone && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">Contact</p>
                            <p className="text-sm text-gray-900 font-semibold">{selectedUser.primaryPhone}</p>
                          </div>
                        </div>
                      )}

                      {selectedUser.age && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">Age</p>
                            <p className="text-sm text-gray-900 font-semibold">{selectedUser.age} years</p>
                          </div>
                        </div>
                      )}

                      {selectedUser.diseases && selectedUser.diseases.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <Heart className="w-4 h-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium mb-2">Medical Conditions</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedUser.diseases.map((disease, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-200 font-medium"
                                >
                                  {disease}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Popup arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 rotate-45"></div>
                </div>
              </Overlay>
            )}
          </Map>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-700/50 rounded-full mb-4 ring-4 ring-slate-600/30">
                <MapPin className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Location Data</h3>
              <p className="text-blue-300 text-sm max-w-md px-4">
                User locations will appear on the map once they share their location data
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-t border-white/10 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-t-full border-2 border-white shadow-lg"></div>
              <span className="text-sm text-green-300 font-semibold">Safe User</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-t-full border-2 border-white shadow-lg"></div>
              <span className="text-sm text-red-300 font-semibold">At Risk User</span>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-blue-300 font-medium">
              Showing <span className="text-white font-bold text-base">{usersWithLocation.length}</span> of{' '}
              <span className="text-white font-bold text-base">{users.length}</span> users
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalMap;
