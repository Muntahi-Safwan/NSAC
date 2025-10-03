import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Loader2,
  TrendingUp,
  Activity,
  AlertCircle,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIChatbotProps {
  airQualityContext?: {
    location?: string;
    aqi?: number;
    pm25?: number;
    no2?: number;
    o3?: number;
    conditions?: string;
  };
}

const AIChatbot = ({ airQualityContext }: AIChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Environmental Health AI assistant, powered by NASA satellite data. I can help you understand air quality, health risks, and provide personalized recommendations. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Typewriter effect
  const typewriterEffect = async (text: string, messageId: string) => {
    setTypingMessageId(messageId);
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, content: currentText, isTyping: true } : msg
        )
      );
      await new Promise(resolve => setTimeout(resolve, 30)); // Adjust speed here
    }

    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg
      )
    );
    setTypingMessageId(null);
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const placeholderMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      const response = await axios.post('https://nsac-mu.vercel.app/api/chatbot/message', {
        message: content,
        context: airQualityContext
      });

      await typewriterEffect(response.data.data.response, assistantMessageId);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.", isTyping: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getQuickTips = async () => {
    setIsLoading(true);

    const assistantMessageId = Date.now().toString();
    const placeholderMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      const response = await axios.post('https://nsac-mu.vercel.app/api/chatbot/tips', {
        context: airQualityContext
      });

      const tips = response.data.data.tips;
      const tipsText = Array.isArray(tips)
        ? tips.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n\n')
        : tips;

      await typewriterEffect(tipsText, assistantMessageId);
    } catch (error) {
      console.error('Error getting tips:', error);
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeTrends = async () => {
    setIsLoading(true);

    const assistantMessageId = Date.now().toString();
    const placeholderMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      const response = await axios.post('https://nsac-mu.vercel.app/api/chatbot/analyze-trends', {
        historicalData: [airQualityContext]
      });

      await typewriterEffect(response.data.data.analysis, assistantMessageId);
    } catch (error) {
      console.error('Error analyzing trends:', error);
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityRecommendations = async () => {
    setIsLoading(true);

    const assistantMessageId = Date.now().toString();
    const placeholderMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      const response = await axios.post('https://nsac-mu.vercel.app/api/chatbot/activity-recommendations', {
        activity: 'outdoor exercise',
        airQuality: airQualityContext
      });

      await typewriterEffect(response.data.data.recommendations, assistantMessageId);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format markdown-like text
  const formatText = (text: string) => {
    // Split by code blocks first
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);

    return parts.map((part, idx) => {
      // Code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return (
          <pre key={idx} className="bg-black/30 border border-cyan-400/20 rounded-lg p-3 my-2 overflow-x-auto">
            <code className="text-xs text-cyan-300 font-mono">{code}</code>
          </pre>
        );
      }
      // Inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Regular text with formatting
      const lines = part.split('\n');
      return lines.map((line, lineIdx) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h3 key={`${idx}-${lineIdx}`} className="text-base font-bold text-white mt-3 mb-2">{line.slice(2)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h4 key={`${idx}-${lineIdx}`} className="text-sm font-bold text-white/90 mt-2 mb-1">{line.slice(3)}</h4>;
        }

        // Bold
        let formatted: any = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
        // Italic
        formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={`${idx}-${lineIdx}`} className="flex items-start space-x-2 my-1">
              <span className="text-cyan-400 mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
            </div>
          );
        }

        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s(.+)$/);
        if (numberedMatch) {
          return (
            <div key={`${idx}-${lineIdx}`} className="flex items-start space-x-2 my-1">
              <span className="text-cyan-400 font-semibold min-w-[20px]">{numberedMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />
            </div>
          );
        }

        return line.trim() ? (
          <p key={`${idx}-${lineIdx}`} className="my-1" dangerouslySetInnerHTML={{ __html: formatted }} />
        ) : (
          <br key={`${idx}-${lineIdx}`} />
        );
      });
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:scale-110 transition-all duration-300 group"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white" />
        <div className="absolute bottom-full right-0 mb-3 hidden sm:group-hover:block">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-sm whitespace-nowrap shadow-lg">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Ask AI Assistant</span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-4 right-4 w-72 sm:bottom-6 sm:right-6 sm:w-80'
          : 'bottom-0 right-0 left-0 w-full h-[85vh] sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 sm:h-[600px] md:w-[450px] md:h-[650px]'
      }`}
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/98 via-blue-900/95 to-indigo-900/98 backdrop-blur-3xl border-t border-white/20 sm:border sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center space-x-1">
                  <span>AI Environmental Expert</span>
                </h3>
                <p className="text-xs text-cyan-300/80 font-medium">Powered by NASA GIBS Data</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white/70" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white/70" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Quick Actions */}
            <div className="p-3 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/0">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={getQuickTips}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/30 rounded-lg text-xs text-emerald-200 font-medium whitespace-nowrap transition-all duration-300 disabled:opacity-50 shadow-sm"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Quick Tips</span>
                </button>
                <button
                  onClick={analyzeTrends}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/30 rounded-lg text-xs text-cyan-200 font-medium whitespace-nowrap transition-all duration-300 disabled:opacity-50 shadow-sm"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Trends</span>
                </button>
                <button
                  onClick={getActivityRecommendations}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 border border-indigo-400/30 rounded-lg text-xs text-indigo-200 font-medium whitespace-nowrap transition-all duration-300 disabled:opacity-50 shadow-sm"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Activities</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%] group">
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-white'
                          : 'bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl border border-white/20 text-white/90'
                      }`}
                    >
                      <div className="text-sm leading-relaxed">
                        {message.role === 'assistant' ? formatText(message.content) : message.content}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.role === 'assistant' && message.content && !message.isTyping && (
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-white/10 rounded"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-white/60" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && typingMessageId === null && (
                <div className="flex justify-start">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Air Quality Context Display */}
            {airQualityContext?.aqi && (
              <div className="px-4 py-2 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-white/70 font-medium">Current AQI:</span>
                  </div>
                  <span className={`font-bold px-2 py-1 rounded-lg ${
                    airQualityContext.aqi <= 50 ? 'bg-green-500/20 text-green-300' :
                    airQualityContext.aqi <= 100 ? 'bg-yellow-500/20 text-yellow-300' :
                    airQualityContext.aqi <= 150 ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {airQualityContext.aqi}
                  </span>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/0">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about air quality, health tips..."
                  disabled={isLoading}
                  className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 text-white rounded-xl p-2.5 transition-all duration-300 disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {isMinimized && (
          <div className="p-4 text-center cursor-pointer" onClick={() => setIsMinimized(false)}>
            <p className="text-white/60 text-sm">Chat minimized</p>
            <p className="text-white/40 text-xs mt-1">Click to expand</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatbot;
