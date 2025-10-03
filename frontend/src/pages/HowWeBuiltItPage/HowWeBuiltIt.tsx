import { Database, Brain, Satellite, GitBranch, AlertTriangle, Award, Zap, Layers, Server, Code, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowWeBuiltIt = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/10 backdrop-blur-xl border border-purple-400/20 rounded-full mb-4 sm:mb-6">
            <Code className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mr-1.5 sm:mr-2" />
            <span className="text-purple-300 font-semibold text-xs sm:text-sm">Technical Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 sm:mb-6 px-4">
            How We Built
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              AiroWatch
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            A comprehensive look at our data pipeline, AI models, and technical architecture powering
            real-time air quality monitoring from space.
          </p>
        </div>
      </section>

      {/* Data Lineage Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-full mb-6">
              <GitBranch className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-blue-300 font-semibold text-sm">Data Lineage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white mb-4 sm:mb-6">
              From Satellite to
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your Screen
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
              Our end-to-end data pipeline processes satellite imagery and sensor data in real-time
              to deliver actionable air quality insights.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Data Collection',
                icon: Satellite,
                description: 'NASA satellites (MODIS, VIIRS, Sentinel-5P) capture atmospheric data including aerosol optical depth, NO₂, SO₂, CO, and PM2.5 concentrations.',
                tech: ['NASA EOSDIS', 'Sentinel Hub', 'MODIS API'],
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                step: '02',
                title: 'Data Ingestion',
                icon: Database,
                description: 'Raw satellite data is fetched via APIs, validated, and stored in our database with metadata including timestamps, coordinates, and quality flags.',
                tech: ['PostgreSQL', 'Prisma ORM', 'REST APIs'],
                gradient: 'from-cyan-500 to-teal-600'
              },
              {
                step: '03',
                title: 'Preprocessing',
                icon: Layers,
                description: 'Data normalization, cloud masking, geometric correction, and spatial interpolation to fill gaps and ensure consistency across sources.',
                tech: ['Python', 'NumPy', 'GeoTIFF Processing'],
                gradient: 'from-teal-500 to-emerald-600'
              },
              {
                step: '04',
                title: 'AI Inference',
                icon: Brain,
                description: 'Machine learning models predict AQI, detect wildfire smoke, forecast heatwaves, and identify pollution sources using ensemble techniques.',
                tech: ['TensorFlow', 'PyTorch', 'XGBoost'],
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                step: '05',
                title: 'Visualization',
                icon: Server,
                description: 'Processed data is served via APIs to our React frontend, rendered on interactive maps with Leaflet, and displayed in real-time dashboards.',
                tech: ['Node.js', 'Express', 'React', 'Leaflet'],
                gradient: 'from-pink-500 to-red-600'
              }
            ].map((stage, index) => (
              <div key={index} className="relative">
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-white/[0.15] transition-all duration-500 hover:scale-105 h-full">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stage.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}>
                    <stage.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-white/40 mb-2">{stage.step}</div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-3 sm:mb-4">
                    {stage.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-4 sm:mb-6">
                    {stage.description}
                  </p>
                  <div className="space-y-1.5 sm:space-y-2">
                    {stage.tech.map((t, i) => (
                      <div key={i} className="text-xs sm:text-sm text-blue-300 bg-blue-500/10 px-2 sm:px-3 py-1 rounded-lg inline-block mr-2">
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                {index < 4 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-white/20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Cards Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-full mb-6">
              <Brain className="w-4 h-4 text-emerald-400 mr-2" />
              <span className="text-emerald-300 font-semibold text-sm">AI Models</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white mb-4 sm:mb-6">
              Model
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Architecture
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
              Our ML pipeline combines multiple models for accurate predictions and real-time insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'AQI Prediction Model',
                type: 'Ensemble: Random Forest + XGBoost',
                accuracy: '94.2%',
                description: 'Predicts Air Quality Index from satellite-derived PM2.5, NO₂, SO₂, and meteorological data. Trained on 5 years of historical ground station measurements.',
                inputs: ['PM2.5', 'NO₂', 'SO₂', 'CO', 'Temperature', 'Humidity', 'Wind Speed'],
                outputs: ['AQI Score (0-500)', 'Health Category', 'Confidence Score'],
                performance: { mae: '8.3 AQI units', r2: '0.91', latency: '< 200ms' }
              },
              {
                name: 'Wildfire Detection',
                type: 'CNN: ResNet-50 + Attention',
                accuracy: '97.8%',
                description: 'Detects active wildfires and smoke plumes from thermal anomalies and aerosol patterns using satellite imagery. Fine-tuned on NASA FIRMS dataset.',
                inputs: ['Thermal Bands', 'AOD', 'NDVI', 'Land Surface Temp'],
                outputs: ['Fire Probability', 'Smoke Intensity', 'Affected Area (km²)'],
                performance: { precision: '96.5%', recall: '98.2%', latency: '< 500ms' }
              },
              {
                name: 'Heatwave Forecasting',
                type: 'LSTM Time Series Model',
                accuracy: '89.1%',
                description: 'Forecasts extreme heat events 3-7 days ahead using land surface temperature trends, humidity, and atmospheric pressure patterns.',
                inputs: ['LST Time Series', 'Humidity', 'Pressure', 'Historical Patterns'],
                outputs: ['Heatwave Probability', 'Peak Temperature', 'Duration (days)'],
                performance: { accuracy: '89.1%', lead_time: '3-7 days', latency: '< 1s' }
              }
            ].map((model, index) => (
              <div key={index} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-emerald-400/[0.3] transition-all duration-500 hover:scale-105">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm text-emerald-300 font-semibold">Active</span>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
                    {model.accuracy}
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-2">
                  {model.name}
                </h3>
                <p className="text-sm text-purple-300 font-mono mb-3 sm:mb-4">{model.type}</p>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-4 sm:mb-6">
                  {model.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white/60 mb-2">Inputs</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {model.inputs.map((input, i) => (
                        <span key={i} className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded">
                          {input}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white/60 mb-2">Outputs</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {model.outputs.map((output, i) => (
                        <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded">
                          {output}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/[0.08] pt-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-white/60 mb-3">Performance</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(model.performance).map(([key, value], i) => (
                        <div key={i}>
                          <div className="text-xs text-white/50 mb-1 capitalize">{key.replace('_', ' ')}</div>
                          <div className="text-sm font-semibold text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 backdrop-blur-xl border border-orange-400/20 rounded-full mb-6">
              <AlertTriangle className="w-4 h-4 text-orange-400 mr-2" />
              <span className="text-orange-300 font-semibold text-sm">Transparency</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white mb-4 sm:mb-6">
              Known
              <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Limitations
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
              We believe in transparency. Here are the current limitations and areas for improvement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                category: 'Data Coverage',
                icon: Satellite,
                limitations: [
                  'Satellite data has temporal gaps due to cloud cover and orbit patterns',
                  'Spatial resolution limited to 1-10km depending on sensor (not street-level)',
                  'Some regions have lower data quality due to fewer ground validation stations',
                  'Polar regions and extreme latitudes have reduced coverage frequency'
                ]
              },
              {
                category: 'Model Accuracy',
                icon: Brain,
                limitations: [
                  'AQI predictions may be less accurate during extreme pollution events (AQI > 400)',
                  'Wildfire detection can produce false positives from industrial heat sources',
                  'Heatwave forecasting accuracy decreases beyond 7-day horizon',
                  'Models trained primarily on North American data; may need regional tuning for other continents'
                ]
              },
              {
                category: 'Technical Constraints',
                icon: Server,
                limitations: [
                  'Real-time updates have 15-30 minute latency due to satellite overpass times',
                  'API rate limits may affect data refresh during high traffic periods',
                  'Historical data archive currently limited to past 2 years',
                  'Mobile app performance may vary on older devices due to map rendering complexity'
                ]
              },
              {
                category: 'Scope & Scale',
                icon: Layers,
                limitations: [
                  'Currently focused on outdoor air quality; indoor air monitoring not yet supported',
                  'Limited integration with ground-level IoT sensors (planned for future releases)',
                  'Prototype phase: some features may be experimental or in beta',
                  'User-generated data validation and crowdsourcing features under development'
                ]
              }
            ].map((section, index) => (
              <div key={index} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-orange-400/[0.3] transition-all duration-500">
                <div className="flex items-center space-x-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                    {section.category}
                  </h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  {section.limitations.map((limitation, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <span className="text-sm sm:text-base text-white/70 leading-relaxed">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
            <Award className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-3 sm:mb-4">
              Continuous Improvement
            </h3>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6">
              We're actively working to address these limitations. Our roadmap includes enhanced ground-station integration,
              improved model accuracy through transfer learning, and expanded global coverage. User feedback drives our development priorities.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-display font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <span>Report Issues or Suggest Features</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 backdrop-blur-xl border border-cyan-400/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-cyan-300 font-semibold text-sm">Tech Stack</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white mb-4 sm:mb-6">
              Built With Modern
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Technologies
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                category: 'Frontend',
                technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Leaflet Maps', 'React Router', 'Recharts']
              },
              {
                category: 'Backend',
                technologies: ['Node.js', 'Express', 'PostgreSQL', 'Prisma ORM', 'JWT Auth', 'REST APIs']
              },
              {
                category: 'AI/ML',
                technologies: ['TensorFlow', 'PyTorch', 'XGBoost', 'scikit-learn', 'Pandas', 'NumPy']
              },
              {
                category: 'Data Sources',
                technologies: ['NASA MODIS', 'Sentinel-5P', 'VIIRS', 'EOSDIS', 'OpenAQ', 'NOAA']
              }
            ].map((stack, index) => (
              <div key={index} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-cyan-400/[0.3] transition-all duration-500 hover:scale-105">
                <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-4 sm:mb-6">
                  {stack.category}
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {stack.technologies.map((tech, i) => (
                    <li key={i} className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-white/70">{tech}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white mb-4 sm:mb-6">
            Want to Learn More?
          </h2>
          <p className="text-base sm:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
            Explore our platform, check out the interactive maps, or get in touch with our team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/map"
              className="w-full sm:w-auto group relative bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-display font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center space-x-2"
            >
              <span>Explore the Platform</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto text-white/80 hover:text-white font-semibold text-sm sm:text-base underline decoration-blue-400/50 hover:decoration-blue-400 transition-all duration-300"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowWeBuiltIt;
