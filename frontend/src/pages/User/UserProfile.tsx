import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  Heart,
  AlertCircle,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Background from '../../components/Background';
import { DISEASES, ALLERGIES } from '../../constants/healthOptions';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers: string[];
  primaryPhone?: string;
  age?: number;
  diseases: string[];
  allergies: string[];
  isSafe: boolean;
  safetyUpdatedAt?: string;
  createdAt: string;
}

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumbers: [] as string[],
    primaryPhone: '',
    age: '',
    diseases: [] as string[],
    allergies: [] as string[]
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`https://nsac-mu.vercel.app/api/user/profile/${user?.id}`);
      if (response.data.success) {
        const userData = response.data.data.user;
        setProfile(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumbers: userData.phoneNumbers || [],
          primaryPhone: userData.primaryPhone || '',
          age: userData.age?.toString() || '',
          diseases: userData.diseases || [],
          allergies: userData.allergies || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put('https://nsac-mu.vercel.app/api/user/profile', {
        userId: user?.id,
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined
      });

      if (response.data.success) {
        setProfile(response.data.data.user);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhone = () => {
    if (newPhone.trim() && !formData.phoneNumbers.includes(newPhone.trim())) {
      setFormData({
        ...formData,
        phoneNumbers: [...formData.phoneNumbers, newPhone.trim()]
      });
      setNewPhone('');
    }
  };

  const handleRemovePhone = (phone: string) => {
    setFormData({
      ...formData,
      phoneNumbers: formData.phoneNumbers.filter(p => p !== phone),
      primaryPhone: formData.primaryPhone === phone ? '' : formData.primaryPhone
    });
  };

  const toggleDisease = (disease: string) => {
    setFormData({
      ...formData,
      diseases: formData.diseases.includes(disease)
        ? formData.diseases.filter(d => d !== disease)
        : [...formData.diseases, disease]
    });
  };

  const toggleAllergy = (allergy: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.includes(allergy)
        ? formData.allergies.filter(a => a !== allergy)
        : [...formData.allergies, allergy]
    });
  };

  if (loading) {
    return (
      <Background>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </Background>
    );
  }

  if (!profile) {
    return (
      <Background>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Profile not found</div>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <div className="min-h-screen p-4 md:p-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  My Profile
                </h1>
                <p className="text-blue-200">Manage your personal information</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300">{successMessage}</span>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6 md:p-8 mb-6">
            {/* Basic Information */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-white flex items-center">
                  <UserIcon className="w-6 h-6 mr-3 text-cyan-400" />
                  Basic Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white opacity-60 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="mb-8">
              <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center">
                <Phone className="w-6 h-6 mr-3 text-cyan-400" />
                Phone Numbers
              </h2>

              {isEditing && (
                <div className="mb-4">
                  <div className="flex gap-3">
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPhone()}
                      className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      placeholder="Add phone number"
                    />
                    <button
                      onClick={handleAddPhone}
                      className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {formData.phoneNumbers.map((phone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/[0.05] border border-white/[0.1] rounded-xl"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{phone}</p>
                      {isEditing && (
                        <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.primaryPhone === phone}
                            onChange={() => setFormData({ ...formData, primaryPhone: phone })}
                            className="w-4 h-4 text-cyan-500 focus:ring-cyan-400/50"
                          />
                          <span className="text-blue-300 text-sm">
                            Primary (for SMS alerts)
                          </span>
                        </label>
                      )}
                      {!isEditing && formData.primaryPhone === phone && (
                        <span className="text-cyan-400 text-sm">Primary (for SMS alerts)</span>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemovePhone(phone)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                {formData.phoneNumbers.length === 0 && (
                  <p className="text-blue-200 text-center py-4">No phone numbers added</p>
                )}
              </div>
            </div>

            {/* Health Information */}
            <div className="mb-8">
              <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center">
                <Heart className="w-6 h-6 mr-3 text-cyan-400" />
                Health Information
              </h2>

              {/* Diseases */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Medical Conditions (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {DISEASES.map((disease) => (
                    <button
                      key={disease}
                      onClick={() => isEditing && toggleDisease(disease)}
                      disabled={!isEditing}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        formData.diseases.includes(disease)
                          ? 'border-cyan-400 bg-cyan-500/20 text-white'
                          : 'border-white/[0.1] bg-white/[0.05] text-blue-200 hover:border-cyan-400/50'
                      } ${!isEditing && 'cursor-default opacity-60'}`}
                    >
                      <span className="text-sm">{disease}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Allergies & Sensitivities (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ALLERGIES.map((allergy) => (
                    <button
                      key={allergy}
                      onClick={() => isEditing && toggleAllergy(allergy)}
                      disabled={!isEditing}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        formData.allergies.includes(allergy)
                          ? 'border-orange-400 bg-orange-500/20 text-white'
                          : 'border-white/[0.1] bg-white/[0.05] text-blue-200 hover:border-orange-400/50'
                      } ${!isEditing && 'cursor-default opacity-60'}`}
                    >
                      <span className="text-sm">{allergy}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: profile.firstName || '',
                      lastName: profile.lastName || '',
                      phoneNumbers: profile.phoneNumbers || [],
                      primaryPhone: profile.primaryPhone || '',
                      age: profile.age?.toString() || '',
                      diseases: profile.diseases || [],
                      allergies: profile.allergies || []
                    });
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Background>
  );
};

export default UserProfile;
