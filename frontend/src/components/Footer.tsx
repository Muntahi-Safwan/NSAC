import { Link } from 'react-router';
import { 
  Satellite, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Globe,
  BarChart3,
  FileText,
  ExternalLink,
  Shield,
  Database,
  Users,
  BookOpen,
  Target,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Air Quality Monitor', href: '/air-quality', icon: BarChart3 },
        { name: 'Disaster Tracker', href: '/disasters', icon: Shield },
        { name: 'Earth Data Insights', href: '/insights', icon: Database },
        { name: 'API Access', href: '/api', icon: ExternalLink },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs', icon: BookOpen },
        { name: 'Research Papers', href: '/research', icon: FileText },
        { name: 'Data Sources', href: '/sources', icon: Database },
        { name: 'Community', href: '/community', icon: Users },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about', icon: Heart },
        { name: 'Our Mission', href: '/mission', icon: Target },
        { name: 'Team', href: '/team', icon: Users },
        { name: 'Careers', href: '/careers', icon: Users },
      ]
    }
  ] as const;

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/aerowatch' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/aerowatch' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/aerowatch' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@aerowatch.com' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-t border-white/10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <Link to="/" className="flex items-center space-x-3 group mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                  <Satellite className="w-7 h-7 text-white" />
                </div>
                <span className="font-grotesk font-bold text-3xl text-white">
                  AeroWatch
                </span>
              </Link>
              
              <p className="text-gray-300 font-inter leading-relaxed mb-8 max-w-md text-lg">
                Leveraging NASA's Earth observation data and cloud computing to predict cleaner, safer skies. 
                Monitoring air pollution and disaster hazards worldwide through advanced analytics.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="font-inter">Real-time Global Coverage</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="font-inter">24/7 Environmental Monitoring</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="font-inter">contact@aerowatch.com</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title} className="lg:col-span-2">
                <h3 className="font-grotesk font-bold text-white text-lg mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => {
                    const Icon = 'icon' in link ? link.icon : null;
                    return (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="flex items-center space-x-3 text-gray-300 hover:text-white font-inter transition-all duration-300 group hover:translate-x-1"
                        >
                          {Icon && <Icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />}
                          <span>
                            {link.name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* NASA Space Apps Challenge Badge */}
            {/* <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center group hover:bg-white/10 transition-all duration-500">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-grotesk font-bold text-white text-xl mb-3">
                  NASA Space Apps
                </h4>
                <p className="text-gray-300 font-inter leading-relaxed mb-4">
                  Challenge 2025
                </p>
                <p className="text-sm text-blue-400 font-inter">
                  From EarthData to Action: Cloud Computing with Earth Observation Data
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 font-inter text-center lg:text-left">
              <p className="text-base mb-1">© {currentYear} AeroWatch. All rights reserved.</p>
              <p className="text-sm opacity-80">
                Built for NASA Space Apps Challenge - Predicting Cleaner, Safer Skies
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/10 hover:bg-blue-500 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/10 hover:border-blue-500/50"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </footer>
  );
};

export default Footer;