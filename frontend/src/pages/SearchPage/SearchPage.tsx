import { useState } from 'react';
import { Search, Users, CheckCircle, XCircle, MapPin, Phone, Mail, Calendar, Heart, AlertTriangle, Loader2, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import Background from '../../components/Background';

interface SearchResult {
  id: string;
  name: string;
  email: string;
  primaryPhone?: string;
  phoneNumbers?: string[];
  age?: number;
  diseases?: string[];
  allergies?: string[];
  isSafe: boolean;
  safetyStatus: string;
  safetyUpdatedAt?: string;
  location?: {
    city: string;
    region?: string;
    country: string;
  };
  socialProfiles?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  lastUpdated: string;
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await axios.get(`http://localhost:3000/api/search/users?query=${encodeURIComponent(searchQuery)}`);

      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError('Failed to search users');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Background>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-3">
              Safety Status Search
            </h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              Find users by name, phone number, or social media handle to check their safety status
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone number, or social username..."
                  className="w-full pl-12 pr-32 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Search Examples */}
          {!searched && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-400" />
                  Search Tips
                </h3>
                <div className="space-y-2 text-sm text-blue-200">
                  <p>• Try searching by full name (e.g., "John Doe")</p>
                  <p>• Use phone numbers with or without formatting</p>
                  <p>• Search social media handles (Twitter, LinkedIn, GitHub, Instagram)</p>
                  <p>• Partial matches are supported</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {searched && (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                  <p className="text-blue-200">Searching users...</p>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="mb-6">
                    <p className="text-blue-200 text-center">
                      Found <span className="font-bold text-white">{results.length}</span> {results.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((user) => (
                      <div
                        key={user.id}
                        className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:bg-white/10 transition-all ${
                          user.isSafe
                            ? 'border-green-400/30'
                            : 'border-red-400/30'
                        }`}
                      >
                        {/* Safety Status Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                            user.isSafe
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.isSafe ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-semibold">Safe</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm font-semibold">Need Help</span>
                              </>
                            )}
                          </div>
                          <span className="text-xs text-blue-300">
                            {user.safetyUpdatedAt ? getTimeAgo(user.safetyUpdatedAt) : 'No update'}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                              <UserIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold text-lg truncate">
                                {user.name}
                              </h3>
                              <p className="text-blue-300 text-sm truncate">{user.email}</p>
                            </div>
                          </div>

                          {user.primaryPhone && (
                            <div className="flex items-center gap-2 text-sm text-blue-200">
                              <Phone className="w-4 h-4 text-blue-400" />
                              <span>{user.primaryPhone}</span>
                            </div>
                          )}

                          {user.location && (
                            <div className="flex items-center gap-2 text-sm text-blue-200">
                              <MapPin className="w-4 h-4 text-blue-400" />
                              <span>
                                {user.location.city}
                                {user.location.region && `, ${user.location.region}`}
                                {`, ${user.location.country}`}
                              </span>
                            </div>
                          )}

                          {user.age && (
                            <div className="flex items-center gap-2 text-sm text-blue-200">
                              <Calendar className="w-4 h-4 text-blue-400" />
                              <span>{user.age} years old</span>
                            </div>
                          )}

                          {user.diseases && user.diseases.length > 0 && (
                            <div className="pt-3 border-t border-white/10">
                              <div className="flex items-start gap-2">
                                <Heart className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs text-blue-300 mb-1">Health Conditions:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {user.diseases.slice(0, 2).map((disease, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded"
                                      >
                                        {disease}
                                      </span>
                                    ))}
                                    {user.diseases.length > 2 && (
                                      <span className="text-xs px-2 py-0.5 bg-white/10 text-white/70 rounded">
                                        +{user.diseases.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Social Profiles */}
                          {user.socialProfiles && Object.values(user.socialProfiles).some(v => v) && (
                            <div className="pt-3 border-t border-white/10">
                              <p className="text-xs text-blue-300 mb-2">Social Profiles:</p>
                              <div className="flex flex-wrap gap-2">
                                {user.socialProfiles.twitter && (
                                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                                    @{user.socialProfiles.twitter}
                                  </span>
                                )}
                                {user.socialProfiles.github && (
                                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                                    {user.socialProfiles.github}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-blue-300 opacity-50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                  <p className="text-blue-200 mb-4">
                    No users found matching "{searchQuery}"
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearched(false);
                      setResults([]);
                    }}
                    className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition-all"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Background>
  );
};

export default SearchPage;
