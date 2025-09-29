import { ArrowDown, Satellite, BarChart3, Shield, ChevronRight } from 'lucide-react';
import FeaturesSection from '../../components/sections/FeaturesSection';
import StatsSection from '../../components/sections/StatsSection';
import TechnologySection from '../../components/sections/TechnologySection';

const Home = () => {
  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse opacity-20" />
        
        {/* Multiple Star Layers */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        {/* Large Gradient Orbs with Animation */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse opacity-60" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-400/15 rounded-full blur-2xl animate-pulse opacity-40" style={{ animationDelay: '4s' }} />
        
        {/* Floating Planets */}
        <div className="absolute top-20 left-16 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-60 animate-float" style={{ animationDelay: '1s' }}>
          <div className="absolute inset-2 bg-gradient-to-br from-orange-300/30 to-transparent rounded-full" />
        </div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full opacity-50 animate-float" style={{ animationDelay: '3s' }}>
          <div className="absolute inset-2 bg-gradient-to-br from-red-300/30 to-transparent rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-22">
        <div className="text-center space-y-8 lg:space-y-12">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 text-sm font-body text-white/90 shadow-lg shadow-blue-500/20 hover:bg-white/15 transition-all duration-300">
            <Satellite className="w-4 h-4 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium">NASA Space Apps Challenge 2025</span>
          </div>

          {/* Enhanced Main Heading */}
          <div className="space-y-4">
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-8xl text-white leading-tight tracking-wider">
              OUR
            </h1>
            <h2 className="font-display font-bold text-6xl sm:text-7xl lg:text-9xl bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent leading-none tracking-widest animate-pulse">
              EARTH
            </h2>
          </div>

          {/* Enhanced Description */}
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="font-body text-xl lg:text-2xl text-white leading-relaxed">
              Discover the power of <span className="text-cyan-400 font-semibold">real-time Earth observation data.</span> Monitor air pollution, 
              track disaster hazards, and predict cleaner, safer skies with cutting-edge 
              cloud computing technology.
            </p>
            <p className="font-body text-lg lg:text-xl text-white/70 leading-relaxed">
              Comprehensive environmental monitoring starts today. Advanced analytics 
              provide actionable insights - <span className="text-blue-400">don't miss critical environmental changes!</span>
            </p>
          </div>

          {/* Enhanced CTA Button */}
          <div className="pt-8">
            <button className="group relative bg-[#e7ebf7] text-black font-display font-bold text-lg px-12 py-5 rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center space-x-3 mx-auto overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative z-10">GET STARTED</span>
              <ChevronRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto">
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-10 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/30">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-white text-2xl mb-4">Air Quality</h3>
                <p className="font-body text-white/80 text-base leading-relaxed">Real-time monitoring of atmospheric conditions and pollution levels worldwide</p>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-10 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-orange-500/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-white text-2xl mb-4">Disaster Prevention</h3>
                <p className="font-body text-white/80 text-base leading-relaxed">Advanced early warning systems for natural disasters and hazards</p>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-10 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-green-500/30">
                  <Satellite className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-white text-2xl mb-4">Earth Data</h3>
                <p className="font-body text-white/80 text-base leading-relaxed">NASA satellite data and cloud computing for environmental insights</p>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-20 pb-8">
            <div className="flex flex-col items-center space-y-2 text-white/60">
              <span className="font-body text-sm">Explore Our Solutions</span>
              <ArrowDown className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Earth Visualization */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-96 h-96 lg:w-[600px] lg:h-[600px]">
        <div className="relative w-full h-full">
          {/* Earth Base with Enhanced Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 rounded-full shadow-2xl shadow-blue-500/40 animate-pulse">
            {/* Multiple Cloud Layers */}
            <div className="absolute inset-6 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-full animate-spin opacity-60" style={{ animationDuration: '120s' }} />
            <div className="absolute inset-12 bg-gradient-to-tl from-white/20 via-transparent to-white/15 rounded-full animate-spin opacity-50" style={{ animationDuration: '80s', animationDirection: 'reverse' }} />
            
            {/* Continents */}
            <div className="absolute inset-8 bg-gradient-to-br from-green-400/40 via-green-500/30 to-emerald-600/40 rounded-full opacity-70" />
            <div className="absolute inset-16 bg-gradient-to-tl from-amber-300/20 via-transparent to-green-300/30 rounded-full" />
            
            {/* Enhanced Atmospheric Glow */}
            <div className="absolute -inset-8 bg-gradient-radial from-blue-300/30 via-cyan-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute -inset-12 bg-gradient-radial from-blue-200/20 via-blue-300/10 to-transparent rounded-full blur-2xl" />
            
            {/* Orbital Ring Effect */}
            <div className="absolute -inset-4 border-2 border-cyan-400/30 rounded-full animate-spin opacity-60" style={{ animationDuration: '30s' }}>
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-cyan-400/50" />
            </div>
          </div>
        </div>
      </div>

      {/* New Sections */}
      <FeaturesSection />
      <TechnologySection />
      {/* <StatsSection /> */}
    </div>
    </>
  );
};

export default Home;