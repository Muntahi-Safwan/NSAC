import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, X, CheckCircle } from 'lucide-react';

interface SafetyStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const SafetyStatusModal: React.FC<SafetyStatusModalProps> = ({ isOpen, onClose, userId }) => {
  const [isSafe, setIsSafe] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchCurrentStatus();
    }
  }, [isOpen, userId]);

  const fetchCurrentStatus = async () => {
    try {
      const response = await axios.get(`https://nsac-mu.vercel.app/api/users/safety-status/${userId}`);
      if (response.data.success) {
        setCurrentStatus(response.data.data.isSafe);
        setIsSafe(response.data.data.isSafe);
      }
    } catch (error) {
      console.error('Error fetching safety status:', error);
    }
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.put('https://nsac-mu.vercel.app/api/users/safety-status', {
        userId,
        isSafe
      });

      if (response.data.success) {
        setCurrentStatus(isSafe);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating safety status:', error);
      alert('Failed to update safety status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 border border-white/[0.1] rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-white">Safety Status</h2>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Status Display */}
        {currentStatus !== null && (
          <div className={`mb-6 p-4 rounded-xl border ${
            currentStatus
              ? 'bg-green-500/10 border-green-400/30'
              : 'bg-orange-500/10 border-orange-400/30'
          }`}>
            <div className="flex items-center space-x-3">
              {currentStatus ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-green-300 font-semibold">Currently marked as safe</p>
                    <p className="text-green-200 text-sm">You are out of danger</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                  <div>
                    <p className="text-orange-300 font-semibold">Currently at risk</p>
                    <p className="text-orange-200 text-sm">May need assistance</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <p className="text-blue-200 mb-6">
          Update your safety status to let emergency responders and NGOs know if you're safe or need assistance.
        </p>

        {/* Status Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setIsSafe(true)}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              isSafe
                ? 'border-green-400 bg-green-500/20'
                : 'border-white/[0.1] bg-white/[0.05] hover:border-green-400/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isSafe ? 'bg-green-500' : 'bg-white/[0.1]'
              }`}>
                <Shield className={`w-5 h-5 ${isSafe ? 'text-white' : 'text-white/50'}`} />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">I am safe</p>
                <p className="text-blue-200 text-sm">I'm out of danger and don't need help</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsSafe(false)}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              !isSafe
                ? 'border-orange-400 bg-orange-500/20'
                : 'border-white/[0.1] bg-white/[0.05] hover:border-orange-400/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                !isSafe ? 'bg-orange-500' : 'bg-white/[0.1]'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${!isSafe ? 'text-white' : 'text-white/50'}`} />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">I need help</p>
                <p className="text-blue-200 text-sm">I'm at risk and may need assistance</p>
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleUpdateStatus}
            disabled={loading || currentStatus === isSafe}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyStatusModal;
