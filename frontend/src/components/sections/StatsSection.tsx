// import { TrendingUp, Users, Globe, Zap } from 'lucide-react';

const StatsSection = () => {
  // const stats = [
  //   {
  //     icon: Globe,
  //     number: '195',
  //     label: 'Countries Monitored',
  //     description: 'Global coverage across all continents',
  //     gradient: 'from-blue-500 to-cyan-600',
  //     shadowColor: 'blue-500/30'
  //   },
  //   {
  //     icon: TrendingUp,
  //     number: '2.5M+',
  //     label: 'Data Points Daily',
  //     description: 'Real-time atmospheric measurements',
  //     gradient: 'from-green-500 to-teal-600',
  //     shadowColor: 'green-500/30'
  //   },
  //   {
  //     icon: Users,
  //     number: '50K+',
  //     label: 'Communities Protected',
  //     description: 'Early warning system coverage',
  //     gradient: 'from-orange-500 to-red-600',
  //     shadowColor: 'orange-500/30'
  //   },
  //   {
  //     icon: Zap,
  //     number: '99.9%',
  //     label: 'System Uptime',
  //     description: '24/7 continuous monitoring',
  //     gradient: 'from-purple-500 to-indigo-600',
  //     shadowColor: 'purple-500/30'
  //   }
  // ];

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Large Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse opacity-60" style={{ animationDelay: '2s' }} />
        
        {/* Moving Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      
    </section>
  );
};

export default StatsSection;