import React, { useState } from 'react';
import axios from 'axios';
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Clock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

interface NGOProfile {
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

interface NGOProfileModalProps {
  ngo?: NGOProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedNgo: NGOProfile) => void;
}

const NGOProfileModal: React.FC<NGOProfileModalProps> = ({
  ngo,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: ngo?.name || '',
    description: ngo?.description || '',
    website: ngo?.website || '',
    address: ngo?.address || '',
    contactPhone: ngo?.contactPhone || '',
    emergencyPhone: ngo?.emergencyPhone || '',
    operatingHours: ngo?.operatingHours || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.put('http://localhost:3000/api/ngo/profile', {
        ngoId: ngo?.id,
        name: formData.name,
        description: formData.description,
        website: formData.website,
        address: formData.address,
        contactPhone: formData.contactPhone,
        emergencyPhone: formData.emergencyPhone,
        operatingHours: formData.operatingHours
      });

      if (response.data.success) {
        setSuccess(true);
        // Update with the returned data from backend
        const updatedNgo = response.data.data;
        setTimeout(() => {
          onUpdate?.(updatedNgo);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/[0.1] rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-cyan-400" />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-white/[0.08] rounded-xl transition-all disabled:opacity-50"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300">Profile updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Enter organization name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
              placeholder="Brief description of your organization's mission and services"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="https://example.org"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Physical Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Enter complete address"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="+880 XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Emergency Phone
              </label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="+880 XXX XXXX"
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Operating Hours
            </label>
            <input
              type="text"
              value={formData.operatingHours}
              onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="e.g., Mon-Fri: 9 AM - 5 PM, Sat: 10 AM - 2 PM"
            />
          </div>

          {/* Read-only Region Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
            <p className="text-blue-200 text-sm mb-2">
              <strong className="text-blue-300">Service Region:</strong> {ngo.region}, {ngo.country}
            </p>
            <p className="text-blue-300 text-xs">
              Contact support to change your service region
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={handleSave}
            disabled={saving || !formData.name.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NGOProfileModal;
