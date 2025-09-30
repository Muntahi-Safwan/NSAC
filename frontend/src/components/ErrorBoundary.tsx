import { Component } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse opacity-60" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse opacity-60" style={{ animationDelay: '2s' }} />

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.3)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/30">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>

            {/* Error Message */}
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              We encountered an unexpected error. Don't worry, our team has been notified and we're working to fix it.
            </p>

            {/* Error Details (Development only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-500/10 backdrop-blur-xl border border-red-400/20 rounded-2xl p-6 mb-8 text-left">
                <h3 className="text-lg font-bold text-red-400 mb-3">Error Details (Development)</h3>
                <div className="bg-black/50 rounded-xl p-4 font-mono text-sm">
                  <p className="text-red-300 mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="text-white/70">
                      <summary className="cursor-pointer text-red-300 mb-2">Stack Trace</summary>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={this.handleRetry}
                className="group flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Try Again</span>
              </button>

              <Link
                to="/"
                className="group flex items-center space-x-2 bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-xl border border-white/[0.15] hover:border-white/[0.25] text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="group flex items-center space-x-2 bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] hover:border-white/[0.2] text-white/80 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </div>

            {/* Support Information */}
            <div className="mt-12 pt-8 border-t border-white/[0.1]">
              <p className="text-white/60 text-sm">
                If this problem persists, please contact our support team at{' '}
                <a
                  href="mailto:support@airwatch.com"
                  className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-300"
                >
                  support@airwatch.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;