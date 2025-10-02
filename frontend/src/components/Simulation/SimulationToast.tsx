import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'warning' | 'danger' | 'critical' | 'info' | 'success';
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

const SimulationToast: React.FC<ToastProps> = ({ id, type, message, onClose, duration = 5000 }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-r from-red-600 to-red-700',
          border: 'border-red-500',
          icon: <AlertTriangle className="w-5 h-5 text-white" />,
          text: 'text-white'
        };
      case 'danger':
        return {
          bg: 'bg-gradient-to-r from-orange-600 to-red-600',
          border: 'border-orange-500',
          icon: <AlertTriangle className="w-5 h-5 text-white" />,
          text: 'text-white'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          border: 'border-yellow-400',
          icon: <AlertTriangle className="w-5 h-5 text-white" />,
          text: 'text-white'
        };
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
          border: 'border-green-500',
          icon: <CheckCircle className="w-5 h-5 text-white" />,
          text: 'text-white'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
          border: 'border-blue-500',
          icon: <Info className="w-5 h-5 text-white" />,
          text: 'text-white'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`${styles.bg} ${styles.border} border-2 rounded-2xl shadow-2xl p-4 max-w-md w-full backdrop-blur-xl transition-all duration-300 transform ${
        isExiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100 animate-slide-in-right'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <p className={`flex-1 ${styles.text} font-medium text-sm leading-relaxed`}>
          {message}
        </p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SimulationToast;
