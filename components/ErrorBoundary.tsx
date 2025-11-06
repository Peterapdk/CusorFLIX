'use client';

import { Component, ReactNode } from 'react';
import logger from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error', { 
      context: 'ErrorBoundary', 
      error,
      errorInfo: errorInfo.componentStack 
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-dvh p-6 flex items-center justify-center">
          <div className="rounded border border-red-500/20 bg-red-500/10 p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-red-400">
              Something went wrong
            </h2>
            <p className="text-white/70 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="rounded bg-white/10 px-4 py-2 ring-1 ring-white/20 hover:bg-white/15 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

