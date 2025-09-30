import { Award, Users, Globe, Target, Heart, Rocket, Satellite, Shield, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-full mb-4 sm:mb-6">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-1.5 sm:mr-2" />
            <span className="text-blue-300 font-semibold text-xs sm:text-sm">Our Story</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 sm:mb-6 px-4">
            About
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              AirWatch
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            We're pioneering the future of air quality monitoring through cutting-edge satellite technology
            and artificial intelligence, making clean air data accessible to communities worldwide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link
              to="/contact"
              className="group relative w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-display font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center space-x-2"
            >
              <span>Get In Touch</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-stretch">
            {/* Mission */}
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 lg:p-12">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                To democratize access to real-time air quality data by leveraging NASA's satellite technology
                and advanced machine learning algorithms. We believe everyone deserves to breathe clean air
                and make informed decisions about their health and environment.
              </p>
              <ul className="space-y-3">
                {[
                  'Provide accurate, real-time air quality monitoring',
                  'Empower communities with actionable insights',
                  'Bridge the gap between space technology and public health',
                  'Support environmental policy with data-driven evidence'
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vision */}
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 lg:p-12">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                A world where air quality data is universally accessible, enabling governments, organizations,
                and individuals to take proactive steps toward cleaner air and healthier communities.
                We envision a future powered by space technology for Earth's wellbeing.
              </p>
              <ul className="space-y-3">
                {[
                  'Global network of satellite-powered monitoring',
                  'AI-driven predictive environmental insights',
                  'Community-centered health protection systems',
                  'Sustainable environmental policy transformation'
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 lg:py-32  ">
        

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 backdrop-blur-xl border border-purple-400/20 rounded-full mb-6">
              <Award className="w-4 h-4 text-purple-400 mr-2" />
              <span className="text-purple-300 font-semibold text-sm">Core Values</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white mb-6">
              What Drives
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Our Work
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Our values shape every decision we make and every solution we create.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Integrity',
                description: 'We provide transparent, accurate data you can trust. Our commitment to scientific rigor ensures reliable air quality insights.',
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                icon: Users,
                title: 'Community First',
                description: 'Every feature we build prioritizes community health and empowerment. We design for the people who need clean air most.',
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Zap,
                title: 'Innovation',
                description: 'We push the boundaries of what\'s possible with satellite technology and AI to solve complex environmental challenges.',
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                icon: Globe,
                title: 'Global Impact',
                description: 'Our solutions are designed to scale globally, bringing advanced air quality monitoring to every corner of the world.',
                gradient: 'from-indigo-500 to-purple-600'
              },
              {
                icon: Satellite,
                title: 'Scientific Excellence',
                description: 'We leverage cutting-edge space technology and rigorous scientific methods to deliver unparalleled accuracy.',
                gradient: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Heart,
                title: 'Health Focus',
                description: 'Every decision we make is guided by its potential impact on human health and environmental wellbeing.',
                gradient: 'from-pink-500 to-red-600'
              }
            ].map((value, index) => (
              <div
                key={index}
                className="group bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/[0.05] hover:border-white/[0.1] rounded-3xl p-8 transition-all duration-500 hover:scale-105"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  {value.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team & Technology Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Team Info */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
                Built by Experts,
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Powered by NASA
                </span>
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Our team combines decades of experience in satellite technology, environmental science,
                and software engineering. We work closely with NASA's Earth Observing System to ensure
                our data meets the highest standards of accuracy and reliability.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Satellite Data Experts', value: '15+ Years Experience' },
                  { label: 'AI/ML Engineers', value: 'PhD Level Expertise' },
                  { label: 'Environmental Scientists', value: 'Published Researchers' },
                  { label: 'Software Engineers', value: 'Full-Stack Specialists' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                    <span className="text-white/80 font-medium">{item.label}</span>
                    <span className="text-blue-400 font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technology Stats */}
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 lg:p-12">
              <h3 className="text-2xl font-display font-bold text-white mb-8 text-center">
                Technology at Scale
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: '10+', label: 'NASA Satellites', sublabel: 'Data Sources' },
                  { number: '24/7', label: 'Monitoring', sublabel: 'Real-time Updates' },
                  { number: '195', label: 'Countries', sublabel: 'Global Coverage' },
                  { number: '99.9%', label: 'Uptime', sublabel: 'Reliability' },
                  { number: '50K+', label: 'Communities', sublabel: 'Protected' },
                  { number: '2.5M+', label: 'Data Points', sublabel: 'Daily Processing' }
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-2xl font-display font-black text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {stat.number}
                    </div>
                    <div className="text-white/80 font-semibold mb-1">{stat.label}</div>
                    <div className="text-white/50 text-sm">{stat.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 lg:py-32 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white mb-6">
            Ready to Make a
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Difference?
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
            Join us in our mission to make air quality data accessible to everyone.
            Whether you're a researcher, policymaker, or concerned citizen, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="group relative bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-display font-bold text-base px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 flex items-center space-x-2"
            >
              <span>Contact Our Team</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/learning"
              className="text-white/80 hover:text-white font-semibold text-base underline decoration-blue-400/50 hover:decoration-blue-400 transition-all duration-300"
            >
              Learn More About Our Technology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;