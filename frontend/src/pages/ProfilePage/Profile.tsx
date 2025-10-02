import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Globe,
  Heart,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import { DISEASES, ALLERGIES } from '../../constants/healthOptions';
import LocationTracker from '../../components/LocationTracker';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
  });

  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [diseases, setDiseases] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [socialUsernames, setSocialUsernames] = useState({
    twitter: '',
    linkedin: '',
    github: '',
    instagram: '',
  });

  const [newPhone, setNewPhone] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (authUser) {
      fetchProfile();
    }
  }, [authUser]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/user/profile/${authUser?.id}`);
      if (response.data.success) {
        const userData = response.data.data.user;
        setProfileData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          age: userData.age?.toString() || '',
        });
        setPhoneNumbers(userData.phoneNumbers || []);
        setPrimaryPhone(userData.primaryPhone || '');
        setDiseases(userData.diseases || []);
        setAllergies(userData.allergies || []);
        setLocation(userData.lastLocation || null);
        setSocialUsernames({
          twitter: userData.socialUsernames?.twitter || '',
          linkedin: userData.socialUsernames?.linkedin || '',
          github: userData.socialUsernames?.github || '',
          instagram: userData.socialUsernames?.instagram || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setErrorMessage('');

    try {
      // Update profile with new fields
      const response = await axios.put('http://localhost:3000/api/user/profile', {
        userId: authUser?.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumbers,
        primaryPhone,
        socialUsernames,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        diseases,
        allergies
      });

      if (response.data.success) {
        updateUser(response.data.data.user);
        setIsEditing(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error: any) {
      setSaveStatus('error');
      setErrorMessage(error.response?.data?.error || 'Failed to update profile');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
    setSaveStatus('idle');
    setErrorMessage('');
  };

  const addPhoneNumber = () => {
    if (newPhone.trim() && !phoneNumbers.includes(newPhone)) {
      setPhoneNumbers([...phoneNumbers, newPhone.trim()]);
      setNewPhone('');
    }
  };

  const removePhoneNumber = (phone: string) => {
    setPhoneNumbers(phoneNumbers.filter(p => p !== phone));
    if (primaryPhone === phone) {
      setPrimaryPhone('');
    }
  };

  const toggleDisease = (disease: string) => {
    setDiseases(
      diseases.includes(disease)
        ? diseases.filter(d => d !== disease)
        : [...diseases, disease]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies(
      allergies.includes(allergy)
        ? allergies.filter(a => a !== allergy)
        : [...allergies, allergy]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return Twitter;
      case 'linkedin':
        return Linkedin;
      case 'github':
        return Github;
      case 'instagram':
        return Instagram;
      default:
        return Globe;
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 sm:py-10 md:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-sm sm:text-base text-white/60">Manage your account information</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Status Messages */}
        {saveStatus === 'saved' && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Profile updated successfully!</span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{errorMessage || 'Failed to update profile'}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl">
          {/* Edit/Save Buttons */}
          <div className="flex justify-end mb-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCancel}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/60 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <UserIcon className="w-5 h-5" />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* First Name */}
              <div>
                <label className="block text-white/70 text-sm mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-white px-4 py-3 bg-white/[0.02] rounded-xl">
                    {profileData.firstName || 'Not set'}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-white px-4 py-3 bg-white/[0.02] rounded-xl">
                    {profileData.lastName || 'Not set'}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Age</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter age"
                  />
                ) : (
                  <p className="text-white px-4 py-3 bg-white/[0.02] rounded-xl">
                    {profileData.age || 'Not set'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </label>
                <p className="text-white px-4 py-3 bg-white/[0.02] rounded-xl">
                  {profileData.email}
                </p>
                <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Join Date */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Member Since</label>
              <p className="text-white px-4 py-3 bg-white/[0.02] rounded-xl">
                {authUser.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Phone Numbers Section */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Phone Numbers</span>
            </h2>

            {isEditing && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPhoneNumber()}
                  placeholder="Add new phone number"
                  className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addPhoneNumber}
                  className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="space-y-3">
              {phoneNumbers.map((phone, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white/[0.02] rounded-xl">
                  <div className="flex-1 w-full">
                    <div className="text-white font-medium">{phone}</div>
                    {isEditing && (
                      <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={primaryPhone === phone}
                          onChange={() => setPrimaryPhone(phone)}
                          className="w-4 h-4 text-blue-500 focus:ring-blue-400/50"
                        />
                        <span className="text-white/70 text-sm">Primary (for SMS alerts)</span>
                      </label>
                    )}
                    {!isEditing && primaryPhone === phone && (
                      <span className="text-blue-400 text-sm">Primary (for SMS alerts)</span>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removePhoneNumber(phone)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {phoneNumbers.length === 0 && !isEditing && (
                <p className="text-white/40 text-sm">No phone numbers added</p>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location</span>
            </h2>
            <LocationTracker
              userId={authUser?.id || ''}
              currentLocation={location}
              onLocationUpdate={(newLocation) => setLocation(newLocation)}
              autoTrigger={true}
            />
          </div>

          {/* Health Information */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Health Information</span>
            </h2>

            {/* Diseases */}
            <div>
              <label className="block text-white/70 text-sm mb-3">
                Medical Conditions (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DISEASES.map((disease) => (
                  <button
                    key={disease}
                    onClick={() => isEditing && toggleDisease(disease)}
                    disabled={!isEditing}
                    className={`p-3 rounded-xl border-2 transition-all text-left text-sm ${
                      diseases.includes(disease)
                        ? 'border-blue-400 bg-blue-500/20 text-white'
                        : 'border-white/[0.1] bg-white/[0.02] text-white/70 hover:border-blue-400/50'
                    } ${!isEditing && 'cursor-default opacity-60'}`}
                  >
                    {disease}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-white/70 text-sm mb-3">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Allergies & Sensitivities (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALLERGIES.map((allergy) => (
                  <button
                    key={allergy}
                    onClick={() => isEditing && toggleAllergy(allergy)}
                    disabled={!isEditing}
                    className={`p-3 rounded-xl border-2 transition-all text-left text-sm ${
                      allergies.includes(allergy)
                        ? 'border-orange-400 bg-orange-500/20 text-white'
                        : 'border-white/[0.1] bg-white/[0.02] text-white/70 hover:border-orange-400/50'
                    } ${!isEditing && 'cursor-default opacity-60'}`}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Social Media</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(socialUsernames).map(([platform, username]) => {
                const Icon = getSocialIcon(platform);
                return (
                  <div key={platform}>
                    <label className="block text-white/70 text-sm mb-2 flex items-center space-x-2 capitalize">
                      <Icon className="w-4 h-4" />
                      <span>{platform}</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={username}
                        onChange={(e) =>
                          setSocialUsernames({ ...socialUsernames, [platform]: e.target.value })
                        }
                        placeholder={`Enter ${platform} username`}
                        className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-white px-4 py-3 bg-white/[0.02] rounded-xl">
                        {username || 'Not set'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
