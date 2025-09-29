import { Satellite, Cloud, Brain, AlertTriangle, ArrowRight, Database, Zap } from 'lucide-react';

const TechnologySection = () => {
  const steps = [
    {
      step: '01',
      icon: Satellite,
      title: 'Satellite Data Collection',
      description: 'NASA\'s advanced Earth observation satellites including MODIS, VIIRS, and Sentinel continuously capture high-resolution atmospheric data across the globe.',
      gradient: 'from-blue-500 to-cyan-600',
      shadowColor: 'blue-500/30'
    },
    {
      step: '02',
      icon: Cloud,
      title: 'Cloud Processing',
      description: 'Massive datasets are processed using cutting-edge cloud computing infrastructure with machine learning algorithms to identify patterns and anomalies.',
      gradient: 'from-purple-500 to-indigo-600',
      shadowColor: 'purple-500/30'
    },
    {
      step: '03',
      icon: Brain,
      title: 'AI Analysis',
      description: 'Advanced artificial intelligence models analyze atmospheric conditions, predict air quality changes, and identify potential environmental hazards in real-time.',
      gradient: 'from-green-500 to-teal-600',
      shadowColor: 'green-500/30'
    },
    {
      step: '04',
      icon: AlertTriangle,
      title: 'Instant Alerts',
      description: 'Critical environmental changes trigger immediate notifications to communities, governments, and organizations for rapid response and protection measures.',
      gradient: 'from-orange-500 to-red-600',
      shadowColor: 'orange-500/30'
    }
  ];

  const techStack = [
    { name: 'NASA Earth Data', icon: Satellite, color: 'text-blue-400' },
    { name: 'Machine Learning', icon: Brain, color: 'text-green-400' },
    { name: 'Cloud Computing', icon: Cloud, color: 'text-purple-400' },
    { name: 'Real-time Processing', icon: Zap, color: 'text-yellow-400' },
    { name: 'Big Data Analytics', icon: Database, color: 'text-cyan-400' },
  ];

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Circuit Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 10 10 L 10 0 M 10 10 L 20 10 M 10 10 L 10 20" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Floating Data Points */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${3 + Math.random() * 6}px`,
              height: `${3 + Math.random() * 6}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 text-sm font-inter text-white/90 shadow-lg shadow-blue-500/20 mb-8">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium">Advanced Technology</span>
          </div>
          
          <h2 className="font-grotesk font-bold text-4xl lg:text-6xl text-white mb-6 leading-tight">
            How It 
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Works</span>
          </h2>
          
          <p className="font-inter text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our cutting-edge platform combines NASA's Earth observation data with advanced AI and cloud computing 
            to deliver real-time environmental monitoring and predictive analytics.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 mb-20">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-6 h-0.5 bg-gradient-to-r from-blue-400/50 to-cyan-400/50 z-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                )}
                
                {/* Step Card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                  
                  <div className="relative z-10">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-grotesk font-bold text-2xl text-gray-500 group-hover:text-blue-400 transition-colors duration-300">
                        {step.step}
                      </span>
                      <div className={`w-12 h-12 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-${step.shadowColor}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-grotesk font-bold text-white text-xl mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="font-inter text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technology Stack */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-10">
            <h3 className="font-grotesk font-bold text-2xl lg:text-3xl text-white mb-4">
              Powered by Advanced Technologies
            </h3>
            <p className="font-inter text-gray-300 text-lg">
              Built on a foundation of cutting-edge tools and methodologies
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
            {techStack.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <div
                  key={index}
                  className="group text-center p-6 rounded-2xl hover:bg-white/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-8 h-8 ${tech.color}`} />
                  </div>
                  <h4 className="font-inter font-medium text-white text-sm group-hover:text-blue-400 transition-colors duration-300">
                    {tech.name}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button className="group relative bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-grotesk font-bold text-lg px-10 py-4 rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center space-x-3 mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Zap className="relative z-10 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Experience the Technology</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;