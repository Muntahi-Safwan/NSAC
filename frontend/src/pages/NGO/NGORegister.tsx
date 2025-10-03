import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, Lock, Mail, AlertCircle, MapPin, Phone, FileText } from 'lucide-react';
import { useNGOAuth } from '../../contexts/NGOAuthContext';
import Background from '../../components/Background';

const NGORegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
    region: '',
    country: 'Bangladesh',
    contactPhone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginNGO, isNGOAuthenticated } = useNGOAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isNGOAuthenticated) {
      navigate('/ngo/dashboard');
    }
  }, [isNGOAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://nsac-mu.vercel.app/api/ngo/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        description: formData.description,
        region: formData.region,
        country: formData.country,
        contactPhone: formData.contactPhone
      });

      if (response.data.success) {
        // Use NGO Auth Context
        loginNGO(response.data.data.ngo, response.data.data.token);

        // Redirect to NGO dashboard
        navigate('/ngo/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl mb-4 shadow-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Register Your NGO
            </h1>
            <p className="text-blue-200">
              Join us in protecting communities from environmental hazards
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6 md:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NGO Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-2">
                    NGO Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                      placeholder="Your organization name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                      placeholder="ngo@example.com"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-blue-200 mb-2">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                      placeholder="+880..."
                    />
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-blue-200 mb-2">
                    Operating Region *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      id="region"
                      name="region"
                      type="text"
                      value={formData.region}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                      placeholder="e.g., Chittagong"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-blue-200 mb-2">
                    Country *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                      placeholder="Bangladesh"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-blue-200 mb-2">
                    Organization Description
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-blue-300" />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all resize-none"
                      placeholder="Brief description of your organization's mission..."
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Register NGO'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-blue-200 text-sm">
                Already have an account?{' '}
                <Link
                  to="/ngo/login"
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Main Site */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
            >
              ← Back to main site
            </Link>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default NGORegister;
