import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Planets', href: '#planets' },
    { name: 'Trailer', href: '#trailer' },
    { name: 'Tickets', href: '#tickets' },
    { name: 'Blog', href: '#blog' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-black/10 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20' 
        : 'bg-transparent backdrop-blur-md'
    }`}>
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            
            <span className="font-grotesk font-bold text-2xl text-white tracking-tight">
              AeroWatch
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1.5 text-gray-300 hover:text-white transition-all duration-300 font-grotesk font-medium text-[15px] tracking-wide hover:scale-105 relative group"
                >
                  {/* {item.name === 'Planets' && <span>🌍</span>}
                  {item.name === 'Trailer' && <span>🎬</span>}
                  {item.name === 'Tickets' && <span>📊</span>}
                  {item.name === 'Blog' && <span>📝</span>}
                  {item.name === 'Contact' && <span>📧</span>} */}
                  <span>{item.name}</span>
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></div>
                </a>
              ))}
            </div>
            
            <button className="bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-gray-900 font-grotesk font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/20 border border-white/20">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/10 rounded-xl"
          >
            {isOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Elegant bottom line */}
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-30'
        }`}></div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
          <div className="px-6 py-6 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 font-grotesk font-medium text-[16px] tracking-wide"
              >
                {/* {item.name === 'Planets' && <span>🌍</span>}
                {item.name === 'Trailer' && <span>🎬</span>}
                {item.name === 'Tickets' && <span>📊</span>}
                {item.name === 'Blog' && <span>📝</span>}
                {item.name === 'Contact' && <span>📧</span>} */}
                <span>{item.name}</span>
              </a>
            ))}
            
            <div className="pt-6">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-gray-900 font-grotesk font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;