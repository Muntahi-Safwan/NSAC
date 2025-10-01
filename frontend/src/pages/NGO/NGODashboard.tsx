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
  Trash2
} from 'lucide-react';

interface NGOData {
  id: string;
  name: string;
  region: string;
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
  const [ngoData, setNgoData] = useState<NGOData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    severity: 'info',
    isAlert: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedNGOData = localStorage.getItem('ngoData');
    if (!storedNGOData) {
      navigate('/ngo/login');
      return;
    }

    const ngo = JSON.parse(storedNGOData);
    setNgoData(ngo);

    // Fetch dashboard data
    fetchStats(ngo.id);
    fetchUsers(ngo.id);
    fetchNotifications(ngo.id);
  }, [navigate]);

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
    if (!ngoData) return;

    try {
      const response = await axios.post('http://localhost:3000/api/notifications/create', {
        ngoId: ngoData.id,
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
        fetchNotifications(ngoData.id);
        fetchStats(ngoData.id);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ngoToken');
    localStorage.removeItem('ngoData');
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

  if (!ngoData || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                {ngoData.name}
              </h1>
              <p className="text-blue-200">{ngoData.region}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNotificationModal(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>New Alert</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">{stats.totalUsers}</span>
            </div>
            <p className="text-blue-200">Total Users</p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{stats.safeUsers}</span>
            </div>
            <p className="text-blue-200">Safe Users</p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-white">{stats.atRiskUsers}</span>
            </div>
            <p className="text-blue-200">At Risk</p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Bell className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{stats.recentNotifications}</span>
            </div>
            <p className="text-blue-200">Alerts Sent (30d)</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Regional Users */}
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6">
            <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-cyan-400" />
              Regional Users
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-blue-200 text-center py-8">No users in this region yet</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-white/[0.05] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : user.email}
                      </p>
                      <p className="text-blue-200 text-sm">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-blue-200 text-center py-8">No notifications sent yet</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 bg-white/[0.05] border border-white/[0.08] rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold">{notification.title}</h3>
                      <div
                        className={`px-2 py-1 bg-gradient-to-r ${getSeverityColor(
                          notification.severity
                        )} rounded-lg text-white text-xs font-medium`}
                      >
                        {notification.severity}
                      </div>
                    </div>
                    <p className="text-blue-200 text-sm mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-300">
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

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/[0.1] rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  <Send className="w-5 h-5 inline mr-2" />
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
  );
};

export default NGODashboard;
