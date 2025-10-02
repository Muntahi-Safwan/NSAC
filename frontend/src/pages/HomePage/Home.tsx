import { ArrowDown, Satellite, BarChart3, Shield, ChevronRight, MapPin, Map, Zap, Globe, Users, Brain, TrendingUp, CheckCircle, Star, Award, Target, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AQISpeedometer from '../../components/AQISpeedometer';
import PollutantDetails from '../../components/PollutantDetails';
import { PastTrendChart, FutureTrendChart } from '../../components/TrendCharts';
import AIChatbot from '../../components/AIChatbot';
import AITipOfTheDay from '../../components/AITipOfTheDay';
import AILocationInsights from '../../components/AILocationInsights';
import { mockAQIData, mockPollutants, northAmericaLocation } from '../../data/mockData';

const Home = () => {
  return (
    <>

      {/* Air Quality Intelligence Dashboard - Responsive Height */}
      <div className="relative min-h-[60vh] md:h-[70vh] lg:h-[80vh] flex flex-col">

        {/* Content Container - Flex Layout */}
        <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">

          {/* Main Flex Container */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 h-full max-h-[calc(80vh-4rem)]">

            {/* Left Section - Header + AQI Speedometer */}
            <div className="flex-1 flex flex-col space-y-3 sm:space-y-4">

              {/* Header Section - Compact */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white leading-tight">
                    AIR QUALITY
                    <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      INTELLIGENCE
                    </span>
                  </h1>
                  <div className="mt-2 text-white/70">
                    <p className="text-xs sm:text-sm font-medium">Real-time air quality monitoring powered by NASA satellites</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs mt-1">
                      <span>• 5 Key Pollutants</span>
                      <span>• 19 Regions</span>
                      <span className="hidden sm:inline">• AI Predictions</span>
                    </div>
                  </div>
                </div>


              </div>

              {/* AQI Speedometer */}
              <div className="flex-1 min-h-[280px] sm:min-h-[320px]">
                <AQISpeedometer data={mockAQIData} location={northAmericaLocation} />
              </div>

            </div>

            {/* Right Section - Pollutant Details */}
            <div className="flex-1 min-h-[280px] sm:min-h-[320px]">
              <PollutantDetails pollutants={mockPollutants} />
            </div>

          </div>

          {/* Peek Indicator - Compact */}
          {/* <div className="flex items-center justify-center pt-3 pb-1">
            <div className="flex flex-col items-center space-y-1 text-white/40 group cursor-pointer hover:text-white/60 transition-all duration-300">
              <div className="w-6 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full group-hover:via-white/60 transition-all duration-300"></div>
              <span className="text-xs font-medium tracking-wider">MORE INSIGHTS</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>
          </div> */}

        </div>
      </div>

      {/* AI Insights Section */}
      <div className="relative py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <AITipOfTheDay />
            <AILocationInsights
              location={northAmericaLocation.name}
              aqi={mockAQIData.aqi}
              pm25={mockPollutants.find(p => p.name === 'PM2.5')?.value}
              no2={mockPollutants.find(p => p.name === 'NO₂')?.value}
              o3={mockPollutants.find(p => p.name === 'O₃')?.value}
            />
          </div>
        </div>
      </div>

      {/* Predictive Analytics Section - Peeks from bottom */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 pt-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-3 sm:mb-4">
              PREDICTIVE AIR QUALITY
              <br className="hidden sm:block" />
              <span className="sm:inline"> </span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ANALYTICS
              </span>
            </h2>
            <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed px-4">
              Advanced machine learning models provide 24-hour air quality forecasting based on NASA Earth observation data
            </p>
          </div>

          {/* Enhanced Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
            <div className="group">
              <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.1] hover:border-white/[0.2] transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
                <PastTrendChart />
              </div>
            </div>
            <div className="group">
              <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.1] hover:border-white/[0.2] transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10">
                <FutureTrendChart />
              </div>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="text-center px-4">
            <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.08] backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 max-w-4xl mx-auto">
              <h3 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white mb-3 sm:mb-4">
                Stay Ahead of Air Quality Changes
              </h3>
              <p className="text-white/70 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Get real-time alerts and personalized recommendations based on your location and health profile
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  to="/map"
                  className="group relative w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 flex items-center justify-center space-x-2"
                >
                  <Map className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Explore Interactive Map</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <button className="text-white/80 hover:text-white font-semibold text-sm sm:text-base underline decoration-cyan-400/50 hover:decoration-cyan-400 transition-all duration-300">
                  View API Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-full mb-4 sm:mb-6">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-1.5 sm:mr-2" />
              <span className="text-blue-300 font-semibold text-xs sm:text-sm">System Overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black text-white mb-4 sm:mb-6 px-4">
              How Our
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                System Works
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
              Our advanced system combines NASA satellite data, machine learning, and real-time monitoring
              to provide the most accurate air quality insights available.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
            {[
              {
                step: "01",
                icon: Satellite,
                title: "Satellite Data Collection",
                description: "NASA's Earth Observing System continuously monitors atmospheric conditions across Bangladesh, collecting data on pollutants, weather patterns, and environmental factors.",
                gradient: "from-blue-500 to-cyan-600",
                delay: "0s"
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Processing & Analysis",
                description: "Advanced machine learning algorithms process massive datasets, identifying patterns and correlations to generate accurate air quality assessments and predictions.",
                gradient: "from-indigo-500 to-purple-600",
                delay: "0.2s"
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Real-time Insights",
                description: "Our platform delivers instant air quality updates, 24-hour forecasts, and personalized health recommendations to keep communities informed and protected.",
                gradient: "from-teal-500 to-green-600",
                delay: "0.4s"
              }
            ].map((step, index) => (
              <div
                key={index}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: step.delay }}
              >
                <div className="relative bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-3xl border border-white/[0.08] hover:border-white/[0.15] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 h-full transition-all duration-500 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-display font-black text-lg">{step.step}</span>
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${step.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-white mb-3 sm:mb-4 group-hover:text-cyan-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow Connector */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Technical Specs */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-4 gap-8">
              {[
                { icon: Globe, number: "195", label: "Countries", sublabel: "Global Coverage" },
                { icon: BarChart3, number: "2.5M+", label: "Data Points", sublabel: "Daily Processing" },
                { icon: Users, number: "50K+", label: "Communities", sublabel: "Protected" },
                { icon: Zap, number: "99.9%", label: "Uptime", sublabel: "System Reliability" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-display font-black text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-white/80 font-semibold mb-1">{stat.label}</div>
                  <div className="text-white/50 text-sm">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why It's Better Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-full mb-6">
              <Award className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-blue-300 font-semibold text-sm">Competitive Advantage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white mb-6">
              Why Choose Our
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Platform
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Experience the next generation of air quality monitoring with unmatched accuracy,
              comprehensive coverage, and intelligent insights.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - Comparison */}
            <div className="space-y-6">
              <h3 className="text-2xl font-display font-bold text-white mb-8">
                Traditional vs Our Modern Solution
              </h3>

              {[
                {
                  traditional: "Limited ground stations",
                  atmoqal: "NASA satellite coverage",
                  icon: Satellite
                },
                {
                  traditional: "Basic pollutant tracking",
                  atmoqal: "5 key pollutants + trends",
                  icon: BarChart3
                },
                {
                  traditional: "Historical data only",
                  atmoqal: "24-hour AI predictions",
                  icon: Brain
                },
                {
                  traditional: "Manual reporting delays",
                  atmoqal: "Real-time updates",
                  icon: Zap
                }
              ].map((comparison, index) => (
                <div key={index} className="group bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/[0.05] hover:border-white/[0.1] rounded-2xl p-6 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <comparison.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-red-400 line-through text-sm">{comparison.traditional}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 font-semibold">{comparison.atmoqal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Benefits */}
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8">
              <h3 className="text-xl font-display font-bold text-white mb-6 text-center">
                Key Benefits
              </h3>

              <div className="space-y-4">
                {[
                  { icon: Target, title: "95% Accuracy", description: "Industry-leading prediction accuracy" },
                  { icon: Globe, title: "Complete Coverage", description: "All 19 Bangladesh regions monitored" },
                  { icon: Shield, title: "Health Protection", description: "Early warning system for communities" },
                  { icon: Star, title: "NASA Partnership", description: "Backed by world-class space technology" }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <benefit.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {benefit.title}
                      </div>
                      <div className="text-white/60 text-sm">
                        {benefit.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.08] backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto">
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4">
                Experience the Future of Air Quality Monitoring
              </h3>
              <p className="text-white/70 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of communities already protected by our intelligent platform.
                Get started with our comprehensive air quality monitoring system today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/map"
                  className="group relative bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-display font-bold text-base px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 flex items-center space-x-2"
                >
                  <Map className="w-5 h-5" />
                  <span>Start Monitoring Now</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <button className="text-white/80 hover:text-white font-semibold text-base underline decoration-emerald-400/50 hover:decoration-emerald-400 transition-all duration-300">
                  Learn More About Our Technology
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NGO Partnership Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-500/10 backdrop-blur-xl border border-green-400/20 rounded-full mb-6">
                <Shield className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-300 font-semibold text-sm">Community Protection</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white mb-6">
                Protecting Communities
                <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Together
                </span>
              </h2>

              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Join our network of NGOs and non-profit organizations dedicated to protecting communities
                from environmental hazards. Get the tools you need to save lives during disasters and air quality emergencies.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, text: "Instant regional alerts to thousands of users" },
                  { icon: Shield, text: "Real-time safety status tracking" },
                  { icon: MapPin, text: "Location-based emergency notifications" },
                  { icon: BarChart3, text: "Dashboard for community management" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white/90 text-base pt-2 group-hover:text-green-300 transition-colors">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/ngo/register"
                  className="group relative bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white font-display font-bold text-base px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 flex items-center justify-center space-x-2"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Register Your NGO</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link
                  to="/ngo/login"
                  className="text-white/80 hover:text-white font-semibold text-base px-8 py-4 border border-white/[0.1] hover:border-green-400/50 rounded-2xl transition-all duration-300 flex items-center justify-center"
                >
                  Already registered? Sign in
                </Link>
              </div>
            </div>

            {/* Right Side - Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="group relative h-48 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80"
                    alt="NGO volunteers helping community"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="group relative h-64 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80"
                    alt="Disaster response team"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="group relative h-64 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80"
                    alt="Community support"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="group relative h-48 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80"
                    alt="Environmental protection"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white mb-6">
              Trusted by Communities
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
                name: "Dr. Sarah Chen",
                role: "Environmental Scientist",
                quote: "This platform has revolutionized how we monitor air quality in our region."
              },
              {
                img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
                name: "Michael Rodriguez",
                role: "City Health Official",
                quote: "The real-time alerts have helped us make critical decisions for public safety."
              },
              {
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
                name: "Dr. Amina Patel",
                role: "Public Health Director",
                quote: "AI-powered insights make complex data accessible to everyone in our community."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial.img}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-blue-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-blue-200 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Start Protecting Your Community Today
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Join thousands using AI-powered air quality monitoring
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/map"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all"
              >
                Explore Data
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot */}
      <AIChatbot
        airQualityContext={{
          location: northAmericaLocation.name,
          aqi: mockAQIData.aqi
        }}
      />
    </>
  );
};

export default Home;