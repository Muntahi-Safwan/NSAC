import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  BarChart3
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
        axios.get(`http://localhost:3000/api/ngo/${ngo?.id}/stats`),
        axios.get(`http://localhost:3000/api/ngo/${ngo?.id}/regional-users`),
        axios.get(`http://localhost:3000/api/ngo/${ngo?.id}/notifications`)
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (notificationsRes.data.success) setNotifications(notificationsRes.data.data);
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
      const response = await axios.post('http://localhost:3000/api/notifications/send', {
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
      <Background>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-blue-400 animate-pulse mx-auto mb-4" />
            <p className="text-blue-200">Loading dashboard...</p>
          </div>
        </div>
      </Background>
    );
  }

  const safetyPercentage = stats.totalUsers > 0
    ? Math.round((stats.safeUsers / stats.totalUsers) * 100)
    : 0;

  return (
    <Background>
      {/* Hero Header */}
      <div className="relative h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop"
          alt="NGO community support"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-transparent"></div>

        {/* Top Action Bar */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <button
            onClick={() => setShowProfileModal(true)}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-3 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-xl border border-red-400/30 text-red-300 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Organization Info */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl mb-5 shadow-2xl">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
              {ngo?.name}
            </h1>
            <div className="flex items-center justify-center gap-3 text-blue-200 text-lg mb-3">
              <MapPin className="w-5 h-5" />
              <span>{ngo?.region}, {ngo?.country}</span>
            </div>
            {ngo?.verified && (
              <span className="inline-flex items-center px-4 py-2 bg-green-500/30 border border-green-400/50 rounded-full text-green-300 text-sm font-medium backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified Organization
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 pb-12 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-2xl border border-blue-400/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-500/30 rounded-xl">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</h3>
            <p className="text-blue-200 text-sm">Total Users</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-2xl border border-green-400/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-500/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-300" />
              </div>
              <span className="text-sm font-semibold text-green-300">{safetyPercentage}%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.safeUsers}</h3>
            <p className="text-green-200 text-sm">Marked Safe</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-2xl border border-red-400/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-500/30 rounded-xl">
                <XCircle className="w-6 h-6 text-red-300" />
              </div>
              <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.atRiskUsers}</h3>
            <p className="text-red-200 text-sm">Need Help</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-2xl border border-purple-400/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-500/30 rounded-xl">
                <Bell className="w-6 h-6 text-purple-300" />
              </div>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.recentNotifications}</h3>
            <p className="text-purple-200 text-sm">Notifications Sent</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <button
            onClick={() => setShowNotificationModal(true)}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-2xl transition-all shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Send Alert to Regional Users
          </button>
        </div>

        {/* Users Section */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8">
          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-7 h-7 text-blue-400" />
                Regional Users
              </h2>
              <p className="text-blue-200 text-sm mt-1">Monitor and assist users in your region</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-gray-800">All Users</option>
                <option value="safe" className="bg-gray-800">Safe Only</option>
                <option value="at-risk" className="bg-gray-800">At Risk Only</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`bg-white/5 border rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer ${
                  user.isSafe ? 'border-green-400/30' : 'border-red-400/30'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-lg truncate">
                      {user.firstName || 'Unknown'} {user.lastName || ''}
                    </h4>
                    <p className="text-blue-300 text-sm truncate">{user.email}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                    user.isSafe
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400 animate-pulse'
                  }`}>
                    {user.isSafe ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Safe
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        At Risk
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {user.primaryPhone && (
                    <div className="flex items-center gap-2 text-blue-200">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span>{user.primaryPhone}</span>
                    </div>
                  )}
                  {user.age && (
                    <div className="flex items-center gap-2 text-blue-200">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>{user.age} years old</span>
                    </div>
                  )}
                  {user.diseases && user.diseases.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1">
                          {user.diseases.slice(0, 2).map((disease, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">
                              {disease}
                            </span>
                          ))}
                          {user.diseases.length > 2 && (
                            <span className="text-xs px-2 py-0.5 bg-white/10 text-white/60 rounded">
                              +{user.diseases.length - 2}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-blue-300 opacity-30 mx-auto mb-4" />
              <p className="text-blue-200">No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-3xl shadow-2xl w-full max-w-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Send className="w-6 h-6 text-cyan-400" />
              Send Regional Alert
            </h2>

            <form onSubmit={handleSendNotification} className="space-y-5">
              <div>
                <label className="block text-white font-medium mb-2">Alert Title</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Air Quality Emergency"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Message</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  placeholder="Enter your alert message..."
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Severity Level</label>
                <select
                  value={notificationForm.severity}
                  onChange={(e) => setNotificationForm({ ...notificationForm, severity: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="info" className="bg-gray-800">Information</option>
                  <option value="warning" className="bg-gray-800">Warning</option>
                  <option value="error" className="bg-gray-800">Critical</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-200 text-sm">
                  This alert will be sent to all users in your region: <strong>{ngo?.region}</strong>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg"
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
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </Background>
  );
};

export default ImprovedNGODashboard;
