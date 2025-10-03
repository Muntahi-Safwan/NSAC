import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form or show success message
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-full mb-4 sm:mb-6">
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-1.5 sm:mr-2" />
            <span className="text-blue-300 font-semibold text-xs sm:text-sm">Get In Touch</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 sm:mb-6 px-4">
            Contact
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Our Team
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
            Have questions about our air quality monitoring platform? Need technical support or partnership opportunities?
            We're here to help and would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="relative py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-6">
                  Let's Connect
                </h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Whether you're a researcher, government official, or community leader interested in air quality data,
                  our team is ready to support your mission.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: 'Email Us',
                    info: 'hello@AiroWatch.com',
                    description: 'Send us an email anytime',
                    gradient: 'from-blue-500 to-cyan-600'
                  },
                  {
                    icon: Phone,
                    title: 'Call Us',
                    info: '+1 (555) 123-4567',
                    description: 'Mon-Fri 9AM-6PM EST',
                    gradient: 'from-emerald-500 to-teal-600'
                  },
                  {
                    icon: MapPin,
                    title: 'Visit Us',
                    info: 'San Francisco, CA',
                    description: 'NASA Ames Research Center',
                    gradient: 'from-purple-500 to-pink-600'
                  }
                ].map((contact, index) => (
                  <div
                    key={index}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${contact.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <contact.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{contact.title}</h3>
                        <p className="text-blue-400 font-medium mb-1">{contact.info}</p>
                        <p className="text-white/60 text-sm">{contact.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">Response Times</h3>
                <div className="space-y-3">
                  {[
                    { label: 'General Inquiries', time: '< 24 hours' },
                    { label: 'Technical Support', time: '< 4 hours' },
                    { label: 'Partnership Requests', time: '< 48 hours' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{item.label}</span>
                      <span className="text-blue-400 font-medium text-sm">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 lg:p-12">
                <h2 className="text-2xl font-display font-bold text-white mb-8">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-white/80 font-medium mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-white/80 font-medium mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type & Subject Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="inquiryType" className="block text-white/80 font-medium mb-2">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="research">Research Collaboration</option>
                        <option value="press">Press & Media</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-white/80 font-medium mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="What's this about?"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-white/80 font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="group bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-display font-bold text-base px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours & FAQ Section */}
      <section className="relative py-20 ">
        

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Office Hours */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-display font-bold text-white">Office Hours</h2>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
                <div className="space-y-4">
                  {[
                    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
                    { day: 'Saturday', hours: '10:00 AM - 2:00 PM EST' },
                    { day: 'Sunday', hours: 'Closed' },
                    { day: 'Holidays', hours: 'Limited Support' }
                  ].map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <span className="text-white/80 font-medium">{schedule.day}</span>
                      <span className="text-purple-400 font-semibold">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
                  <p className="text-purple-300 text-sm">
                    <strong>Emergency Support:</strong> For critical technical issues affecting live monitoring systems,
                    our on-call team is available 24/7.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-display font-bold text-white">Quick Access</h2>
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: 'Technical Documentation',
                    description: 'API docs, integration guides, and tutorials',
                    link: '/learning',
                    icon: Globe
                  },
                  {
                    title: 'Community Forum',
                    description: 'Connect with other users and get peer support',
                    link: '/learning',
                    icon: Users
                  },
                  {
                    title: 'Status Page',
                    description: 'Check real-time system status and uptime',
                    link: '/map',
                    icon: Clock
                  },
                  {
                    title: 'Partnership Portal',
                    description: 'Explore collaboration opportunities',
                    link: '/about',
                    icon: ChevronRight
                  }
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.link}
                    className="group block bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-white/60 text-sm">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;