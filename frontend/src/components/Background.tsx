import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'dark' | 'gradient';
}

const Background: React.FC<BackgroundProps> = ({ children, variant = 'default' }) => {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'dark':
        return 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950';
      case 'gradient':
        return 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900';
      default:
        return 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundStyle()} relative overflow-hidden`}>
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Background;
