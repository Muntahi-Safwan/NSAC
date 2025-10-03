import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Users,
  Send,
  LogOut,
  CheckCircle,
  XCircle,
  Settings,
  TrendingUp,
  MapPin,
  Phone,
  Globe,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Bell,
  Heart,
  Calendar,
  Activity,
  BarChart3,
  Shield,
  Award,
  Target
} from 'lucide-react';
import { useNGOAuth } from '../../contexts/NGOAuthContext';
import Background from '../../components/Background';
import NGOProfileModal from '../../components/NGO/NGOProfileModal';
import RegionalMap from '../../components/NGO/RegionalMap';

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
  lastLocation?: {
    city?: string;
    region?: string;
    country?: string;
    lat: number;
    lng: number;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: string;
  recipientCount: number;
  createdAt: string;
}

const ImprovedNGODashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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
  const { ngo, isNGOAuthenticated, logoutNGO } = useNGOAuth();

  useEffect(() => {
    if (!isNGOAuthenticated) {
      navigate('/ngo/login');
      return;
    }
    fetchDashboardData();
  }, [isNGOAuthenticated]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, notificationsRes] = await Promise.all([
        api.get(`/api/ngo/stats/${ngo?.id}`),
        api.get(`/api/ngo/users/${ngo?.id}`),
        api.get(`/api/notifications/ngo/${ngo?.id}`)
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data.users || []);
      if (notificationsRes.data.success) setNotifications(notificationsRes.data.data.notifications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.primaryPhone?.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user =>
        filterStatus === 'safe' ? user.isSafe : !user.isSafe
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/notifications/create', {
        ngoId: ngo?.id,
        title: notificationForm.title,
        message: notificationForm.message,
        severity: notificationForm.severity,
        isAlert: notificationForm.isAlert
      });

      if (response.data.success) {
        setShowNotificationModal(false);
        setNotificationForm({ title: '', message: '', severity: 'info', isAlert: false });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleLogout = () => {
    logoutNGO();
    navigate('/ngo/login');
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <Activity className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xl text-blue-100 font-medium">Loading dashboard...</p>
          <p className="text-sm text-blue-300 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  const safetyPercentage = stats.totalUsers > 0
    ? Math.round((stats.safeUsers / stats.totalUsers) * 100)
    : 0;

  return (
    <div className="min-h-screen ">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Org Name */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{ngo?.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-sm text-blue-300">{ngo?.region}, {ngo?.country}</span>
                  {ngo?.verified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 text-red-300 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back! 👋</h2>
              <p className="text-blue-200 text-lg">
                Monitor your regional impact and assist those in need
              </p>
              {ngo?.description && (
                <p className="text-blue-300 mt-3 text-sm leading-relaxed max-w-2xl">
                  {ngo.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowNotificationModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              <span className="hidden md:inline">Send Alert</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-200">Total Users</p>
                <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          {/* Safe Users Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-xl border border-green-400/20 rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Shield className="w-6 h-6 text-green-300" />
                </div>
                <div className="px-3 py-1 bg-green-500/20 rounded-full">
                  <span className="text-sm font-bold text-green-300">{safetyPercentage}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-200">Marked Safe</p>
                <p className="text-4xl font-bold text-white">{stats.safeUsers}</p>
              </div>
            </div>
          </div>

          {/* At Risk Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-orange-600/5 backdrop-blur-xl border border-red-400/20 rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-300" />
                </div>
                {stats.atRiskUsers > 0 && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-200">Need Help</p>
                <p className="text-4xl font-bold text-white">{stats.atRiskUsers}</p>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-600/5 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Bell className="w-6 h-6 text-purple-300" />
                </div>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-200">Alerts Sent</p>
                <p className="text-4xl font-bold text-white">{stats.recentNotifications}</p>
                <p className="text-xs text-purple-300">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Map Section */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="h-[500px]">
            <RegionalMap users={users} ngoRegion={ngo?.region} />
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-b border-white/5 px-6 py-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-1">
                  <Users className="w-7 h-7 text-blue-400" />
                  Regional Users
                </h2>
                <p className="text-blue-300 text-sm">Monitor and assist users in your service region</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  <option value="safe" className="bg-slate-800">✓ Safe Only</option>
                  <option value="at-risk" className="bg-slate-800">⚠ At Risk Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="p-6">
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`relative bg-slate-800/40 border rounded-xl p-5 hover:bg-slate-800/60 transition-all cursor-pointer group ${
                      user.isSafe ? 'border-green-400/20 hover:border-green-400/40' : 'border-red-400/20 hover:border-red-400/40'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        user.isSafe
                          ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                          : 'bg-red-500/20 text-red-300 border border-red-400/30 animate-pulse'
                      }`}>
                        {user.isSafe ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Safe
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            At Risk
                          </>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="pr-20 mb-4">
                      <h4 className="text-white font-semibold text-lg mb-1">
                        {user.firstName || 'Unknown'} {user.lastName || ''}
                      </h4>
                      <p className="text-blue-300 text-sm truncate">{user.email}</p>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-2.5">
                      {user.primaryPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Phone className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <span className="text-blue-200">{user.primaryPhone}</span>
                        </div>
                      )}

                      {user.age && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <span className="text-blue-200">{user.age} years old</span>
                        </div>
                      )}

                      {user.diseases && user.diseases.length > 0 && (
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-red-500/10 rounded-lg mt-0.5">
                            <Heart className="w-3.5 h-3.5 text-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-1.5">
                              {user.diseases.slice(0, 2).map((disease, idx) => (
                                <span key={idx} className="text-xs px-2 py-0.5 bg-red-500/10 text-red-300 rounded border border-red-400/20">
                                  {disease}
                                </span>
                              ))}
                              {user.diseases.length > 2 && (
                                <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded border border-slate-600/30">
                                  +{user.diseases.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-4">
                  <Users className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                <p className="text-blue-300">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-400/30 rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-400/20 px-6 py-5">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-xl">
                  <Send className="w-6 h-6 text-cyan-400" />
                </div>
                Send Regional Alert
              </h2>
              <p className="text-blue-300 text-sm mt-2">
                This alert will be sent to all users in <strong>{ngo?.region}</strong>
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendNotification} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Alert Title *</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="e.g., Air Quality Emergency Alert"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Message *</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                  placeholder="Enter your detailed alert message here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Severity Level</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setNotificationForm({ ...notificationForm, severity: 'info' })}
                    className={`px-4 py-3 rounded-xl border font-medium transition-all ${
                      notificationForm.severity === 'info'
                        ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                        : 'bg-slate-800/30 border-white/10 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    ℹ️ Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationForm({ ...notificationForm, severity: 'warning' })}
                    className={`px-4 py-3 rounded-xl border font-medium transition-all ${
                      notificationForm.severity === 'warning'
                        ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
                        : 'bg-slate-800/30 border-white/10 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    ⚠️ Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationForm({ ...notificationForm, severity: 'error' })}
                    className={`px-4 py-3 rounded-xl border font-medium transition-all ${
                      notificationForm.severity === 'error'
                        ? 'bg-red-500/20 border-red-400/50 text-red-300'
                        : 'bg-slate-800/30 border-white/10 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    🚨 Critical
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-400/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-200 text-sm">
                  Recipients will receive this alert immediately via their registered notification channels
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-white/10 text-white font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25"
                >
                  Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <NGOProfileModal
        ngo={ngo || undefined}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default ImprovedNGODashboard;
