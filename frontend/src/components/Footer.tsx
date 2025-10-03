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
      title: 'Project',
      links: [
        { name: 'Air Quality Map', href: '/map', icon: BarChart3 },
        { name: 'Learning Hub', href: '/learning', icon: BookOpen },
        { name: 'About Us', href: '/about', icon: Heart },
        { name: 'Contact', href: '/contact', icon: Mail },
      ]
    }
  ] as const;

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/nasa-space-apps-AiroWatch' },
    { name: 'Contact', icon: Mail, href: '/contact' },
  ];

  return (
    <footer className="relative overflow-hidden">
      

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-14 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                  <Satellite className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="font-grotesk font-bold text-2xl sm:text-3xl text-white">
                  AiroWatch
                </span>
              </Link>

              <p className="text-gray-300 font-inter leading-relaxed mb-6 sm:mb-8 max-w-md text-base sm:text-lg">
                Leveraging NASA's Earth observation data to monitor air quality across North America.
                Real-time pollution tracking for cleaner, safer skies.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="font-inter">NASA Space Apps Challenge 2024</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="font-inter">Real-time Air Quality Monitoring</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title} className="lg:col-span-1">
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
        <div className="py-6 sm:py-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 sm:space-y-6 lg:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 font-inter text-center lg:text-left">
              <p className="text-sm sm:text-base mb-1">© {currentYear} AiroWatch. All rights reserved.</p>
              <p className="text-xs sm:text-sm opacity-80">
                NASA Space Apps Challenge 2024 - Air Quality Intelligence for North America
              </p>
            </div>

            {/* Project Links */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                const isExternal = social.href.startsWith('http');

                if (isExternal) {
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
                } else {
                  return (
                    <Link
                      key={social.name}
                      to={social.href}
                      className="w-12 h-12 bg-white/10 hover:bg-blue-500 text-gray-400 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/10 hover:border-blue-500/50"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  );
                }
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