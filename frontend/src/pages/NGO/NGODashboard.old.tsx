import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Building2,
  Users,
  Shield,
  AlertTriangle,
  Bell,
  Send,
  LogOut,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Settings,
  TrendingUp,
  Activity,
  MapPin,
  Phone,
  Globe,
  Clock,
  AlertCircle as AlertCircleIcon,
  ChevronDown,
  Search,
  Filter
} from 'lucide-react';
import { useNGOAuth } from '../../contexts/NGOAuthContext';
import Background from '../../components/Background';
import NGOProfileModal from '../../components/NGO/NGOProfileModal';

interface NGOData {
  id: string;
  email: string;
  name: string;
  description?: string;
  website?: string;
  address?: string;
  region: string;
  country: string;
  contactPhone?: string;
  emergencyPhone?: string;
  operatingHours?: string;
  verified: boolean;
}

interface Stats {
  totalUsers: number;
  safeUsers: number;
  atRiskUsers: number;
  recentNotifications: number;
}

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
}

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: string;
  recipientCount: number;
  createdAt: string;
}

const NGODashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [ngoProfile, setNgoProfile] = useState<NGOData | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'safe' | 'at-risk'>('all');

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    severity: 'info',
    isAlert: false
  });

  const navigate = useNavigate();
  const { ngo, isNGOAuthenticated, logoutNGO, updateNGO } = useNGOAuth();

  useEffect(() => {
    if (!isNGOAuthenticated) {
      navigate('/ngo/login');
      return;
    }

    if (ngo) {
      // Fetch dashboard data
      setNgoProfile(ngo);
      fetchStats(ngo.id);
      fetchUsers(ngo.id);
      fetchNotifications(ngo.id);
    }
  }, [ngo, isNGOAuthenticated, navigate]);

  useEffect(() => {
    // Filter users based on search and status
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = user.email.toLowerCase();
        const phones = user.phoneNumbers?.join(' ').toLowerCase() || '';
        return fullName.includes(searchTerm.toLowerCase()) ||
               email.includes(searchTerm.toLowerCase()) ||
               phones.includes(searchTerm.toLowerCase());
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user =>
        filterStatus === 'safe' ? user.isSafe : !user.isSafe
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);

  const fetchStats = async (ngoId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/ngo/stats/${ngoId}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async (ngoId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/ngo/users/${ngoId}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setFilteredUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchNotifications = async (ngoId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/notifications/ngo/${ngoId}`);
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngo) return;

    try {
      const response = await axios.post('http://localhost:3000/api/notifications/create', {
        ngoId: ngo.id,
        ...notificationForm
      });

      if (response.data.success) {
        setShowNotificationModal(false);
        setNotificationForm({
          title: '',
          message: '',
          severity: 'info',
          isAlert: false
        });
        fetchNotifications(ngo.id);
        fetchStats(ngo.id);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  const handleLogout = () => {
    logoutNGO();
    navigate('/ngo/login');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'danger':
        return 'from-orange-500 to-red-500';
      case 'warning':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'danger':
        return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
    }
  };

  if (!ngo || !stats) {
    return (
      <Background>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading dashboard...</div>
        </div>
      </Background>
    );
  }

  const safetyPercentage = stats.totalUsers > 0
    ? Math.round((stats.safeUsers / stats.totalUsers) * 100)
    : 0;

  return (
    <Background>
      {/* Hero Header with Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop"
          alt="NGO community support"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl mb-4 shadow-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">
              {ngo.name}
            </h1>
            <div className="flex items-center justify-center gap-2 text-blue-200 text-lg mb-2">
              <MapPin className="w-5 h-5" />
              <span>{ngo.region}, {ngo.country}</span>
            </div>
            {ngo.verified && (
              <span className="inline-flex items-center px-3 py-1.5 bg-green-500/30 border border-green-400/50 rounded-full text-green-300 text-sm font-medium backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Verified Organization
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Quick Actions Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              {ngo.description && (
                <p className="text-blue-200 text-sm max-w-2xl">{ngo.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setShowNotificationModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>New Alert</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Organization Info Cards */}
          {(ngo.website || ngo.contactPhone || ngo.emergencyPhone || ngo.operatingHours) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {ngo.website && (
                <a
                  href={ngo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-xl hover:bg-white/[0.12] transition-all"
                >
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-blue-200 text-xs">Website</p>
                    <p className="text-white text-sm truncate">Visit Site</p>
                  </div>
                </a>
              )}
              {ngo.contactPhone && (
                <div className="flex items-center space-x-3 p-4 bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-xl">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-blue-200 text-xs">Contact</p>
                    <p className="text-white text-sm">{ngo.contactPhone}</p>
                  </div>
                </div>
              )}
              {ngo.emergencyPhone && (
                <div className="flex items-center space-x-3 p-4 bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-xl">
                  <AlertCircleIcon className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-blue-200 text-xs">Emergency</p>
                    <p className="text-white text-sm">{ngo.emergencyPhone}</p>
                  </div>
                </div>
              )}
              {ngo.operatingHours && (
                <div className="flex items-center space-x-3 p-4 bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-xl">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-blue-200 text-xs">Hours</p>
                    <p className="text-white text-sm truncate">{ngo.operatingHours}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 hover:bg-white/[0.12] transition-all">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-cyan-400" />
                <span className="text-3xl font-bold text-white">{stats.totalUsers}</span>
              </div>
              <p className="text-blue-200 font-medium">Total Users</p>
              <p className="text-blue-300 text-xs mt-1">In your region</p>
            </div>

            <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 hover:bg-white/[0.12] transition-all">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">{stats.safeUsers}</span>
              </div>
              <p className="text-blue-200 font-medium">Safe Users</p>
              <div className="mt-2 flex items-center">
                <div className="flex-1 h-2 bg-white/[0.1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                    style={{ width: `${safetyPercentage}%` }}
                  />
                </div>
                <span className="ml-2 text-green-400 text-sm font-semibold">{safetyPercentage}%</span>
              </div>
            </div>

            <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 hover:bg-white/[0.12] transition-all">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-400" />
                <span className="text-3xl font-bold text-white">{stats.atRiskUsers}</span>
              </div>
              <p className="text-blue-200 font-medium">At Risk</p>
              <p className="text-orange-300 text-xs mt-1">Requires attention</p>
            </div>

            <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 hover:bg-white/[0.12] transition-all">
              <div className="flex items-center justify-between mb-4">
                <Bell className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-white">{stats.recentNotifications}</span>
              </div>
              <p className="text-blue-200 font-medium">Alerts Sent</p>
              <p className="text-blue-300 text-xs mt-1">Last 30 days</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Regional Users */}
            <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-3 text-cyan-400" />
                  Regional Users
                </h2>
                <span className="text-blue-300 text-sm">{filteredUsers.length} of {users.length}</span>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'all'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/[0.05] text-blue-200 hover:bg-white/[0.08]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('safe')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'safe'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/[0.05] text-blue-200 hover:bg-white/[0.08]'
                    }`}
                  >
                    Safe
                  </button>
                  <button
                    onClick={() => setFilterStatus('at-risk')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'at-risk'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/[0.05] text-blue-200 hover:bg-white/[0.08]'
                    }`}
                  >
                    At Risk
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredUsers.length === 0 ? (
                  <p className="text-blue-200 text-center py-8">
                    {searchTerm || filterStatus !== 'all'
                      ? 'No users match your search'
                      : 'No users in this region yet'}
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                      className="p-4 bg-white/[0.05] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : user.email}
                          </p>
                          <p className="text-blue-200 text-sm truncate">{user.email}</p>
                          {user.primaryPhone && (
                            <p className="text-blue-300 text-xs mt-1 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {user.primaryPhone}
                            </p>
                          )}
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          {user.isSafe ? (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 border border-green-400/30 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-300 text-sm font-medium">Safe</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-orange-500/20 border border-orange-400/30 rounded-lg">
                              <XCircle className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-300 text-sm font-medium">At Risk</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {selectedUser?.id === user.id && (
                        <div className="mt-4 pt-4 border-t border-white/[0.1] space-y-2">
                          {user.age && (
                            <div className="text-sm">
                              <span className="text-blue-300">Age:</span>{' '}
                              <span className="text-white">{user.age}</span>
                            </div>
                          )}
                          {user.diseases && user.diseases.length > 0 && (
                            <div className="text-sm">
                              <span className="text-blue-300">Conditions:</span>{' '}
                              <div className="mt-1 flex flex-wrap gap-1">
                                {user.diseases.map((disease, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs"
                                  >
                                    {disease}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {user.allergies && user.allergies.length > 0 && (
                            <div className="text-sm">
                              <span className="text-blue-300">Allergies:</span>{' '}
                              <div className="mt-1 flex flex-wrap gap-1">
                                {user.allergies.map((allergy, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs"
                                  >
                                    {allergy}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {user.phoneNumbers && user.phoneNumbers.length > 1 && (
                            <div className="text-sm">
                              <span className="text-blue-300">Other Phones:</span>{' '}
                              <div className="mt-1 space-y-1">
                                {user.phoneNumbers
                                  .filter(p => p !== user.primaryPhone)
                                  .map((phone, idx) => (
                                    <p key={idx} className="text-white text-xs">{phone}</p>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6">
              <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center">
                <Bell className="w-6 h-6 mr-3 text-cyan-400" />
                Recent Notifications
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-blue-200 text-center py-8">No notifications sent yet</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 bg-white/[0.05] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold flex-1">{notification.title}</h3>
                        <div
                          className={`px-2 py-1 rounded-lg text-white text-xs font-medium border ${getSeverityBadgeColor(
                            notification.severity
                          )}`}
                        >
                          {notification.severity}
                        </div>
                      </div>
                      <p className="text-blue-200 text-sm mb-3 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-300 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {notification.recipientCount} recipients
                        </span>
                        <span className="text-blue-300">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Modal */}
        {ngoProfile && (
          <NGOProfileModal
            ngo={ngoProfile}
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onUpdate={(updatedNgo) => {
              setNgoProfile(updatedNgo);
              updateNGO(updatedNgo); // Update context and localStorage
              setShowProfileModal(false);
            }}
          />
        )}

        {/* Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-white/[0.1] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl">
              <h2 className="text-2xl font-display font-bold text-white mb-6">
                Send Regional Notification
              </h2>
              <form onSubmit={handleSendNotification} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Title *</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) =>
                      setNotificationForm({ ...notificationForm, title: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Alert title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Message *</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) =>
                      setNotificationForm({ ...notificationForm, message: e.target.value })
                    }
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
                    placeholder="Notification message..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Severity</label>
                    <select
                      value={notificationForm.severity}
                      onChange={(e) =>
                        setNotificationForm({ ...notificationForm, severity: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="danger">Danger</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationForm.isAlert}
                        onChange={(e) =>
                          setNotificationForm({ ...notificationForm, isAlert: e.target.checked })
                        }
                        className="w-5 h-5 rounded bg-white/[0.05] border-white/[0.1] text-cyan-500 focus:ring-cyan-400/50"
                      />
                      <span className="text-blue-200">Disaster Alert</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send to {stats.totalUsers} Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNotificationModal(false)}
                    className="px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </Background>
  );
};

export default NGODashboard;
