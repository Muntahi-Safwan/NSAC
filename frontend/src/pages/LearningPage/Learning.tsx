import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, Clock, User, ChevronRight, BookOpen, Shield, TrendingUp, AlertTriangle, Brain, Sparkles, Zap, Target, Lightbulb, MessageCircle } from 'lucide-react';
import { blogPosts, articles, categories, articleTypes } from '../../data/blogData';
import type { BlogPost, Article } from '../../data/blogData';
import AIChatbot from '../../components/AIChatbot';

const Learning = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'blogs'>('articles');

  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredArticles = articles.filter(article => {
    const matchesType = selectedType === 'all' || article.type === selectedType;
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'precaution':
        return <Shield className="w-4 h-4 text-red-400" />;
      case 'guide':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'research':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-full mb-4 sm:mb-6">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-1.5 sm:mr-2" />
            <span className="text-blue-300 font-semibold text-xs sm:text-sm">Knowledge Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 sm:mb-6 px-4">
            Learning
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
            Explore comprehensive guides, safety tips, and the latest research on air quality monitoring.
            Stay informed and protect your community with expert knowledge.
          </p>
        </div>
      </section>

      {/* AI-Powered Learning Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-cyan-400/30 rounded-full mb-6">
              <Brain className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-cyan-300 font-semibold text-sm">AI-Powered Learning</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4">
              Learn with
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </h2>

            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Experience personalized, interactive learning powered by NASA satellite data and advanced AI
            </p>
          </div>

          {/* AI Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Interactive AI Tutor */}
            <div className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] hover:border-cyan-400/30 rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>

                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2 md:mb-3">
                  Interactive AI Tutor
                </h3>

                <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4">
                  Chat with our AI assistant powered by Google Gemini to get instant answers about air quality, environmental science, and health impacts.
                </p>

                <div className="flex items-center text-cyan-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span>Ask AI Now</span>
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Personalized Learning Paths */}
            <div className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] hover:border-blue-400/30 rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Target className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>

                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2 md:mb-3">
                  Personalized Learning Paths
                </h3>

                <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4">
                  AI analyzes your interests and knowledge level to recommend the perfect articles, guides, and topics for your learning journey.
                </p>

                <div className="flex items-center text-blue-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span>Get Started</span>
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Smart Summaries */}
            <div className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] hover:border-cyan-400/30 rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>

                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2 md:mb-3">
                  Smart Summaries
                </h3>

                <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4">
                  Get AI-generated summaries of complex research papers and articles. Save time while learning the key concepts and takeaways.
                </p>

                <div className="flex items-center text-cyan-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span>Try Summaries</span>
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Real-time Data Analysis */}
            <div className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] hover:border-emerald-400/30 rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>

                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2 md:mb-3">
                  Real-time Data Analysis
                </h3>

                <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4">
                  AI interprets live NASA satellite data and translates complex metrics into easy-to-understand insights about your air quality.
                </p>

                <div className="flex items-center text-emerald-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span>View Analysis</span>
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Adaptive Quizzes */}
            <div className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] hover:border-blue-400/30 rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Lightbulb className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>

                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2 md:mb-3">
                  Adaptive Quizzes
                </h3>

                <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4">
                  Test your knowledge with AI-generated quizzes that adapt to your skill level and provide detailed explanations for each answer.
                </p>

                <div className="flex items-center text-blue-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span>Start Quiz</span>
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Expert Insights */}
            <div className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] hover:border-cyan-400/30 rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>

                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2 md:mb-3">
                  Expert Insights
                </h3>

                <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4">
                  Get professional environmental health recommendations based on current air quality data and scientific research from NASA.
                </p>

                <div className="flex items-center text-cyan-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span>Get Insights</span>
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-xl border border-white/[0.15] rounded-3xl p-6 md:p-8 lg:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 rounded-3xl" />

            <div className="relative z-10 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                <Brain className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>

              <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-black text-white mb-3 md:mb-4 px-4">
                Start Your AI-Powered Learning Journey
              </h3>

              <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto mb-6 md:mb-8 px-4">
                Join thousands of learners using AI to understand air quality and protect their health. Get personalized recommendations, instant answers, and expert insights powered by NASA data.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
                <button className="w-full sm:w-auto group relative bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-display font-bold px-6 md:px-8 py-3 md:py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/30 flex items-center justify-center space-x-2 text-sm md:text-base">
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Chat with AI Assistant</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>

                <Link
                  to="/map"
                  className="w-full sm:w-auto text-white/80 hover:text-white font-semibold px-6 py-3 md:py-4 underline decoration-cyan-400/50 hover:decoration-cyan-400 transition-all duration-300 text-sm md:text-base text-center"
                >
                  Explore Live Air Quality Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-2">
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'articles'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Articles & Guides
              </button>
              <button
                onClick={() => setActiveTab('blogs')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'blogs'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Blog Posts
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search articles, guides, and blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/60" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-slate-900 text-white">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter (for articles only) */}
            {activeTab === 'articles' && (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {articleTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-slate-900 text-white">
                    {type.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'articles' ? (
            <>
              {/* Featured Articles */}
              {filteredArticles.filter(article => article.priority === 'high').length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center">
                    <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
                    Critical Safety Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {filteredArticles
                      .filter(article => article.priority === 'high')
                      .map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                  </div>
                </div>
              )}

              {/* All Articles */}
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 sm:mb-8">
                  All Articles ({filteredArticles.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Featured Blog Posts */}
              {filteredBlogPosts.filter(post => post.featured).length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-display font-bold text-white mb-8">
                    Featured Posts
                  </h2>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {filteredBlogPosts
                      .filter(post => post.featured)
                      .map((post) => (
                        <BlogCard key={post.id} post={post} featured />
                      ))}
                  </div>
                </div>
              )}

              {/* All Blog Posts */}
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 sm:mb-8">
                  Recent Posts ({filteredBlogPosts.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {filteredBlogPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* No Results */}
          {((activeTab === 'articles' && filteredArticles.length === 0) ||
            (activeTab === 'blogs' && filteredBlogPosts.length === 0)) && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">No results found</h3>
              <p className="text-white/60 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

// Article Card Component
const ArticleCard = ({ article }: { article: Article }) => (
  <Link
    to={`/learning/article/${article.id}`}
    className="group block bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105"
  >
    <div className="aspect-video overflow-hidden">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getPriorityIcon(article.priority)}
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            article.priority === 'high' ? 'bg-red-500/20 text-red-300' :
            article.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-blue-500/20 text-blue-300'
          }`}>
            {article.priority.charAt(0).toUpperCase() + article.priority.slice(1)} Priority
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {getTypeIcon(article.type)}
          <span className="text-xs text-white/60 capitalize">{article.type}</span>
        </div>
      </div>

      <h3 className="text-lg font-display font-bold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
        {article.title}
      </h3>

      <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">
        {article.excerpt}
      </p>

      <div className="flex items-center justify-between text-xs text-white/50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{article.readTime}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(article.date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </Link>
);

// Blog Card Component
const BlogCard = ({ post, featured = false }: { post: BlogPost; featured?: boolean }) => (
  <Link
    to={`/learning/blog/${post.id}`}
    className={`group block bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 ${
      featured ? 'lg:col-span-1' : ''
    }`}
  >
    <div className={`${featured ? 'aspect-[16/10]' : 'aspect-video'} overflow-hidden`}>
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
          {post.category}
        </span>
        {featured && (
          <span className="text-xs font-medium px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
            Featured
          </span>
        )}
      </div>

      <h3 className={`${featured ? 'text-xl' : 'text-lg'} font-display font-bold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2`}>
        {post.title}
      </h3>

      <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between text-xs text-white/50 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{post.readTime}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {post.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 bg-white/[0.05] text-white/60 rounded-lg"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </Link>
);

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case 'medium':
      return <TrendingUp className="w-4 h-4 text-yellow-400" />;
    default:
      return <BookOpen className="w-4 h-4 text-blue-400" />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'precaution':
      return <Shield className="w-4 h-4 text-red-400" />;
    case 'guide':
      return <BookOpen className="w-4 h-4 text-blue-400" />;
    case 'research':
      return <TrendingUp className="w-4 h-4 text-purple-400" />;
    default:
      return <BookOpen className="w-4 h-4 text-gray-400" />;
  }
};

export default Learning;