import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  ChevronRight,
  Tag,
  Eye,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Download,
  TrendingUp,
  Shield,
  BookOpen,
  Zap,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  MapPin
} from 'lucide-react';
import { blogPosts, articles } from '../../data/blogData';
import type { BlogPost, Article } from '../../data/blogData';

const ArticlePage = () => {
  const { id, type } = useParams<{ id: string; type: 'article' | 'blog' }>();
  const [content, setContent] = useState<BlogPost | Article | null>(null);
  const [relatedContent, setRelatedContent] = useState<(BlogPost | Article)[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!id || !type) return;

    const allContent = type === 'blog' ? blogPosts : articles;
    const foundContent = allContent.find(item => item.id === id);

    if (foundContent) {
      setContent(foundContent);
      setLikeCount(Math.floor(Math.random() * 150) + 50);

      // Get related content based on category/tags
      const related = allContent
        .filter(item =>
          item.id !== id &&
          (item.category === foundContent.category ||
           ('tags' in foundContent && 'tags' in item &&
            foundContent.tags.some(tag => item.tags.includes(tag))))
        )
        .slice(0, 3);

      setRelatedContent(related);
    }

    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [id, type]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content?.title,
          text: content?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Content Not Found</h1>
          <p className="text-white/70 mb-6">The article or blog post you're looking for doesn't exist.</p>
          <Link
            to="/learning"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Learning Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  const isArticle = 'priority' in content;
  const estimatedReadTime = content.readTime || '5 min read';

  return (
    <div className="min-h-screen relative overflow-hidden pt-10">

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/10 z-50 backdrop-blur-sm">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 transition-all duration-150 ease-out shadow-lg shadow-cyan-500/20"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Sticky Header */}
      {/*  */}

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative py-12 sm:py-16 lg:py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Badge */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-xl border rounded-full transition-all duration-300 ${
                isArticle
                  ? 'bg-red-500/10 border-red-400/20 hover:bg-red-500/15'
                  : 'bg-blue-500/10 border-blue-400/20 hover:bg-blue-500/15'
              }`}>
                {isArticle ? (
                  <>
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 mr-1.5 sm:mr-2" />
                    <span className="text-red-300 font-semibold text-xs sm:text-sm">Safety Article</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 mr-1.5 sm:mr-2" />
                    <span className="text-blue-300 font-semibold text-xs sm:text-sm">Blog Post</span>
                  </>
                )}
              </div>

              {isArticle && (content as Article).priority && (
                <div className={`inline-flex items-center px-2.5 sm:px-3 py-1 backdrop-blur-xl border rounded-full transition-all duration-300 ${
                  (content as Article).priority === 'high'
                    ? 'bg-red-500/20 border-red-400/30 hover:bg-red-500/25'
                    : (content as Article).priority === 'medium'
                    ? 'bg-yellow-500/20 border-yellow-400/30 hover:bg-yellow-500/25'
                    : 'bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/25'
                }`}>
                  <AlertTriangle className={`w-3 h-3 mr-1 ${
                    (content as Article).priority === 'high' ? 'text-red-400' :
                    (content as Article).priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                  <span className={`text-xs font-medium ${
                    (content as Article).priority === 'high' ? 'text-red-300' :
                    (content as Article).priority === 'medium' ? 'text-yellow-300' : 'text-blue-300'
                  }`}>
                    {(content as Article).priority?.charAt(0).toUpperCase() + (content as Article).priority?.slice(1)} Priority
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-black text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              {content.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg sm:text-xl lg:text-2xl text-white/70 leading-relaxed mb-8 sm:mb-10 max-w-4xl font-light">
              {content.excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-white/60 mb-6 sm:mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/80">{content.author}</span>
                  <span className="text-xs text-white/50">Environmental Scientist</span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/[0.1] hidden sm:block" />
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{new Date(content.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{estimatedReadTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{Math.floor(Math.random() * 5000) + 500}</span>
              </div>
            </div>

            {/* Tags */}
            {'tags' in content && content.tags && (
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {content.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 sm:px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.12] hover:border-white/[0.2] rounded-full text-white/60 hover:text-white/80 text-xs sm:text-sm transition-all duration-300 cursor-pointer"
                  >
                    <Tag className="w-3 h-3 mr-1.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Article Image */}
        <div className="relative mb-12 sm:mb-16 lg:mb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/40 group">
              <img
                src={content.image}
                alt={content.title}
                className="w-full h-56 sm:h-72 md:h-96 lg:h-[32rem] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Image Credit */}
              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/40 backdrop-blur-xl rounded-lg px-2.5 sm:px-3 py-1 border border-white/[0.1]">
                <span className="text-white/70 text-xs">Photo: Unsplash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">
            {/* Main Content */}
            <article className="lg:col-span-8">
              <div className="prose prose-lg prose-invert max-w-none">
                <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.07] backdrop-blur-3xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 shadow-xl">
                  {/* Article Content - Rich Typography with Markdown */}
                  <div className="prose prose-lg prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 mt-8 leading-tight" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5 mt-8 leading-tight flex items-center space-x-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-4 mt-6 leading-tight" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-lg sm:text-xl font-semibold text-blue-300 mb-3 mt-5" {...props} />,
                        p: ({ node, ...props }) => <p className="text-white/85 mb-5 leading-relaxed sm:leading-loose text-sm sm:text-base" {...props} />,
                        ul: ({ node, ...props }) => <ul className="space-y-3 mb-6 ml-4" {...props} />,
                        ol: ({ node, ...props }) => <ol className="space-y-3 mb-6 ml-4 list-decimal" {...props} />,
                        li: ({ node, ...props }) => (
                          <li className="text-white/80 leading-relaxed text-sm sm:text-base flex items-start">
                            <span className="inline-block w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span {...props} />
                          </li>
                        ),
                        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                        em: ({ node, ...props }) => <em className="italic text-cyan-300" {...props} />,
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-cyan-500/50 pl-6 py-2 my-6 bg-cyan-500/5 rounded-r-xl" {...props} />
                        ),
                        code: ({ node, inline, ...props }: any) =>
                          inline ? (
                            <code className="bg-white/[0.1] text-cyan-300 px-2 py-1 rounded text-sm" {...props} />
                          ) : (
                            <code className="block bg-black/30 text-cyan-300 p-4 rounded-xl overflow-x-auto text-sm" {...props} />
                          ),
                        a: ({ node, ...props }) => (
                          <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors" {...props} />
                        ),
                        hr: ({ node, ...props }) => <hr className="border-white/[0.1] my-8" {...props} />,
                      }}
                    >
                      {content.content}
                    </ReactMarkdown>
                  </div>

                  {/* Call-to-Action */}
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-400/20 hover:border-emerald-400/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 mt-8 transition-all duration-300">
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-300 mb-3 sm:mb-4 flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Take Action</span>
                    </h3>
                    <p className="text-white/75 mb-4 sm:mb-5 text-sm sm:text-base leading-relaxed">
                      Stay informed about air quality in your area and protect your health with real-time monitoring.
                    </p>
                    <Link
                      to="/map"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 text-sm sm:text-base"
                    >
                      <span>View Live Air Quality Map</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Social Share */}
                  <div className="pt-6 sm:pt-8 border-t border-white/[0.08] mt-8">
                    <p className="text-white/60 text-sm mb-4">Share this article</p>
                    <div className="flex flex-wrap gap-3">
                      <button className="flex items-center space-x-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 hover:border-[#1877F2]/40 text-[#1877F2] px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105">
                        <Facebook className="w-4 h-4" />
                        <span className="text-sm font-medium">Facebook</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 hover:border-[#1DA1F2]/40 text-[#1DA1F2] px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105">
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm font-medium">Twitter</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/20 hover:border-[#0A66C2]/40 text-[#0A66C2] px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105">
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] text-white/70 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                      >
                        <Link2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Copy Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Footer */}
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/[0.08]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-2 backdrop-blur-xl border rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 ${
                        isLiked
                          ? 'bg-rose-500/20 border-rose-400/30 text-rose-400'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.1] text-white/70 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{likeCount}</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.1] hover:border-white/[0.15] rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105">
                      <MessageCircle className="w-4 h-4 text-white/70 hover:text-white" />
                      <span className="text-white/70 hover:text-white text-sm font-medium">{Math.floor(Math.random() * 20) + 5}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleShare}
                      className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.1] hover:border-white/[0.15] rounded-lg transition-all duration-300 hover:scale-110"
                    >
                      <Share2 className="w-4 h-4 text-white/70 hover:text-white" />
                    </button>
                    <button className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.1] hover:border-white/[0.15] rounded-lg transition-all duration-300 hover:scale-110">
                      <Download className="w-4 h-4 text-white/70 hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 mt-12 lg:mt-0">
              <div className="sticky top-24 space-y-6 sm:space-y-8">
                {/* Author Info */}
                <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.07] backdrop-blur-3xl border border-white/[0.08] rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-white/[0.12] transition-all duration-300">
                  <h3 className="font-bold text-white text-base sm:text-lg mb-4 sm:mb-5">About the Author</h3>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-base sm:text-lg mb-1">{content.author}</div>
                      <div className="text-white/60 text-xs sm:text-sm mb-2">Environmental Scientist</div>
                      <div className="text-white/50 text-xs sm:text-sm leading-relaxed">
                        Specializing in air quality monitoring and public health impact assessment.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Content */}
                {relatedContent.length > 0 && (
                  <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.07] backdrop-blur-3xl border border-white/[0.08] rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-white/[0.12] transition-all duration-300">
                    <h3 className="font-bold text-white text-base sm:text-lg mb-4 sm:mb-5 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      <span>Related Reading</span>
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {relatedContent.map((item) => (
                        <Link
                          key={item.id}
                          to={`/learning/${'priority' in item ? 'article' : 'blog'}/${item.id}`}
                          className="block group"
                        >
                          <div className="bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.02]">
                            <h4 className="font-semibold text-white text-xs sm:text-sm mb-1.5 sm:mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-white/60 text-xs leading-relaxed line-clamp-2 mb-2 sm:mb-3">
                              {item.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-white/50">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{item.readTime}</span>
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.07] backdrop-blur-3xl border border-white/[0.08] rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-white/[0.12] transition-all duration-300">
                  <h3 className="font-bold text-white text-base sm:text-lg mb-4 sm:mb-5">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      to="/map"
                      className="flex items-center space-x-3 w-full text-left bg-white/[0.04] hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 group hover:scale-[1.02]"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition-colors">View Live Map</div>
                        <div className="text-white/60 text-xs">Real-time AQI data</div>
                      </div>
                    </Link>

                    <Link
                      to="/learning"
                      className="flex items-center space-x-3 w-full text-left bg-white/[0.04] hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 group hover:scale-[1.02]"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-xs sm:text-sm group-hover:text-emerald-300 transition-colors">More Articles</div>
                        <div className="text-white/60 text-xs">Browse learning hub</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-24" />
      </div>
    </div>
  );
};

export default ArticlePage;