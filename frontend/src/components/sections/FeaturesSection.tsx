import { BarChart3, Satellite, Globe, Zap, Database, Eye, AlertTriangle } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Real-Time Air Quality Monitoring',
      description: 'Advanced satellite data processing to monitor PM2.5, PM10, NO2, and other critical air pollutants across the globe in real-time.',
      gradient: 'from-blue-500 to-cyan-600',
      shadowColor: 'blue-500/30',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      icon: AlertTriangle,
      title: 'Disaster Hazard Prediction',
      description: 'Machine learning algorithms analyze atmospheric conditions to predict wildfires, dust storms, and air quality emergencies.',
      gradient: 'from-orange-500 to-red-600',
      shadowColor: 'orange-500/30',
      bgGradient: 'from-orange-500/10 to-red-500/10'
    },
    {
      icon: Eye,
      title: 'Satellite Earth Observation',
      description: 'Leverage NASA\'s extensive satellite network including MODIS, VIIRS, and Sentinel data for comprehensive environmental monitoring.',
      gradient: 'from-green-500 to-teal-600',
      shadowColor: 'green-500/30',
      bgGradient: 'from-green-500/10 to-teal-500/10'
    },
    {
      icon: Database,
      title: 'Cloud Computing Analytics',
      description: 'High-performance cloud infrastructure processes terabytes of Earth observation data to deliver actionable environmental insights.',
      gradient: 'from-purple-500 to-indigo-600',
      shadowColor: 'purple-500/30',
      bgGradient: 'from-purple-500/10 to-indigo-500/10'
    },
    {
      icon: Globe,
      title: 'Global Coverage Network',
      description: 'Worldwide monitoring system covering urban areas, industrial zones, and remote regions for comprehensive air quality assessment.',
      gradient: 'from-cyan-500 to-blue-600',
      shadowColor: 'cyan-500/30',
      bgGradient: 'from-cyan-500/10 to-blue-500/10'
    },
    {
      icon: Zap,
      title: 'Instant Alert System',
      description: 'Immediate notifications for air quality deterioration, wildfire risks, and environmental emergencies to protect communities.',
      gradient: 'from-yellow-500 to-orange-600',
      shadowColor: 'yellow-500/30',
      bgGradient: 'from-yellow-500/10 to-orange-500/10'
    }
  ];

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:60px_60px] animate-pulse opacity-20" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-20 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 text-sm font-inter text-white/90 shadow-lg shadow-blue-500/20 mb-8">
            <Satellite className="w-4 h-4 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium">Advanced Earth Monitoring</span>
          </div>
          
          <h2 className="font-grotesk font-bold text-4xl lg:text-6xl text-white mb-6 leading-tight">
            Cutting-Edge 
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Features</span>
          </h2>
          
          <p className="font-inter text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Harness the power of NASA's Earth observation satellites and advanced cloud computing 
            to monitor environmental conditions and predict atmospheric hazards with unprecedented accuracy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{ 
                  boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-${feature.shadowColor}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-grotesk font-bold text-white text-xl lg:text-2xl mb-4 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="font-inter text-gray-300 text-base leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 lg:mt-20">
          <button className="group relative bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-grotesk font-bold text-lg px-10 py-4 rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center space-x-3 mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Satellite className="relative z-10 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Explore All Features</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;