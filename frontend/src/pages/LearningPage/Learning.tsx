import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Clock, User, ChevronRight, BookOpen, Shield, TrendingUp, AlertTriangle, Brain, Sparkles, Zap, Target, Lightbulb, MessageCircle } from 'lucide-react';
import { blogPosts, articles, categories, articleTypes } from '../../data/blogData';
import type { BlogPost, Article } from '../../data/blogData';
import AIChatbot from '../../components/AIChatbot';
import QuizCard from '../../components/Quiz/QuizCard';

const Learning = () => {
  const navigate = useNavigate();
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
      
    
      {/* Quiz Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-cyan-500/5" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-400/30 rounded-full mb-6">
              <Lightbulb className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-blue-300 font-semibold text-sm">Test Your Knowledge</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4">
              Challenge Yourself with
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                AI-Powered Quizzes
              </span>
            </h2>

            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Take adaptive quizzes that adjust to your knowledge level and help you master air quality concepts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuizCard
              category="air_quality"
              difficulty="beginner"
              onStart={() => navigate('/quiz')}
            />
            <QuizCard
              category="health"
              difficulty="intermediate"
              onStart={() => navigate('/quiz')}
            />
            <QuizCard
              category="environment"
              difficulty="advanced"
              onStart={() => navigate('/quiz')}
            />
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