import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogIn, MapPin, LogOut, UserCircle, ChevronDown, Bell, X, CheckCheck, Building2, Shield, Map, Thermometer, Flame, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNGOAuth } from '../contexts/NGOAuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useSimulation } from '../contexts/SimulationContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [mapDropdownOpen, setMapDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: userLogout, isAuthenticated: isUserAuthenticated } = useAuth();
  const { ngo, logoutNGO, isNGOAuthenticated } = useNGOAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const { simulation } = useSimulation();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };

    if (notificationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationDropdownOpen]);

  const handleLogout = () => {
    if (isNGOAuthenticated) {
      logoutNGO();
      navigate('/ngo/login');
    } else {
      userLogout();
      navigate('/');
    }
    setProfileDropdownOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const navItems = [
    { name: 'Air Quality', href: '/map', icon: MapPin },
    { name: 'Heatwave', href: '/map/heatwave', icon: Thermometer },
    { name: 'Wildfire', href: '/map/wildfire', icon: Flame },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Search', href: '/search' },
    { name: 'About', href: '/about' },
    { name: 'Learning', href: '/learning' },
    { name: 'Contact', href: '/contact' },
  ];

  const isAuthenticated = isUserAuthenticated || isNGOAuthenticated;
  const displayName = isNGOAuthenticated
    ? ngo?.name
    : (user?.firstName || user?.email?.split('@')[0]);

  return (
    <>
      {/* Regional Banner - Above Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${
        simulation.isActive
          ? 'bg-gradient-to-r from-red-600/30 to-orange-600/30 border-red-400/30'
          : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-400/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm">
            <MapPin className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
              simulation.isActive ? 'text-red-400' : 'text-blue-400'
            }`} />
            <p className="text-white/80 text-center">
              {simulation.isActive ? (
                <>
                  <span className="font-semibold text-red-300">⚠️ Hazard Alert:</span>{' '}
                  <span className="text-white/90">Air Quality Emergency - AQI {simulation.airQualityData.aqi} (Hazardous)</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-blue-300">Prototype Notice:</span>{' '}
                  <span className="text-white/70">Currently displaying North America regional data only</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navbar - Below Banner */}
      <nav className={`fixed top-10 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-black/10 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20'
          : 'bg-transparent backdrop-blur-md'
      }`}>
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <span className="font-grotesk font-bold text-2xl text-white tracking-tight">
              AiroWatch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isMapItem = item.href.startsWith('/map');

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1.5 transition-all duration-300 font-grotesk font-medium text-[15px] tracking-wide hover:scale-105 relative group ${
                      location.pathname === item.href
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                    <div className={`absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 transition-transform duration-300 rounded-full ${
                      location.pathname === item.href
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}></div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Notification Icon - Only for Users */}
                  {isUserAuthenticated && (
                    <div className="relative" ref={notificationRef}>
                      <button
                        onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                        className="relative p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                      >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Notification Dropdown */}
                      {notificationDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 max-h-[32rem] bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                          <div className="sticky top-0 bg-black/95 border-b border-white/10 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-grotesk font-semibold text-white text-lg">
                                Notifications
                              </h3>
                              {notifications.length > 0 && (
                                <button
                                  onClick={markAllAsRead}
                                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                                >
                                  <CheckCheck className="w-3 h-3" />
                                  <span>Mark all read</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="overflow-y-auto max-h-96">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-8 text-center text-gray-400">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-grotesk">No notifications yet</p>
                              </div>
                            ) : (
                              notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all duration-300 cursor-pointer ${
                                    !notification.read ? 'bg-blue-500/5' : ''
                                  }`}
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <div className="flex items-start justify-between space-x-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                        <h4 className="font-grotesk font-medium text-white text-sm truncate">
                                          {notification.title}
                                        </h4>
                                        {!notification.read && (
                                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                                        {notification.message}
                                      </p>
                                      <span className="text-xs text-gray-500">
                                        {getTimeAgo(notification.timestamp)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearNotification(notification.id);
                                      }}
                                      className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className={`flex items-center space-x-2 ${
                        isNGOAuthenticated
                          ? 'bg-gradient-to-r from-green-500/20 to-teal-500/20 border-green-400/30'
                          : 'bg-white/10 border-white/20'
                      } hover:bg-white/20 border px-4 py-2.5 rounded-full transition-all duration-300 font-grotesk font-medium text-white`}
                    >
                      {isNGOAuthenticated ? (
                        <Building2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <UserCircle className="w-5 h-5" />
                      )}
                      <span className="max-w-[150px] truncate">{displayName}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                        {isNGOAuthenticated ? (
                          <>
                            <div className="px-4 py-3 border-b border-white/10">
                              <p className="text-xs text-gray-400">NGO Account</p>
                              <p className="text-sm text-white font-medium truncate">{ngo?.name}</p>
                              <p className="text-xs text-blue-300">{ngo?.region}</p>
                            </div>
                            <Link
                              to="/ngo/dashboard"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-all duration-300 text-white"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Dashboard</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-all duration-300 text-white"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 transition-all duration-300 text-red-400"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 font-grotesk font-medium text-[15px] tracking-wide hover:scale-105"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-gray-900 font-grotesk font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/20 border border-white/20 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/10 rounded-xl"
          >
            {isOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Elegant bottom line */}
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-30'
        }`}></div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
          <div className="px-6 py-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-6 py-4 hover:bg-white/10 rounded-2xl transition-all duration-300 font-grotesk font-medium text-[16px] tracking-wide ${
                  location.pathname === item.href
                    ? 'text-white bg-white/5'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            ))}

            <div className="pt-6 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={isNGOAuthenticated ? "/ngo/dashboard" : "/profile"}
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center justify-center space-x-2 text-white border px-8 py-4 rounded-2xl transition-all duration-300 ${
                      isNGOAuthenticated
                        ? 'border-green-400/30 bg-gradient-to-r from-green-500/20 to-teal-500/20'
                        : 'border-white/20 bg-white/10'
                    }`}
                  >
                    {isNGOAuthenticated ? (
                      <>
                        <Building2 className="w-5 h-5" />
                        <span className="truncate max-w-[200px]">{ngo?.name}</span>
                      </>
                    ) : (
                      <>
                        <UserCircle className="w-5 h-5" />
                        <span>{displayName}</span>
                      </>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 text-red-400 border border-red-400/20 hover:bg-red-500/10 px-8 py-4 rounded-2xl transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-white border border-white/20 hover:bg-white/10 px-8 py-4 rounded-2xl transition-all duration-300"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-gray-900 font-grotesk font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </nav>
    </>
  );
};

export default Navbar;
