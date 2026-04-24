import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let details = '';

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = `Firestore Error: ${parsed.error}`;
            details = `Operation: ${parsed.operationType} on ${parsed.path || 'unknown path'}`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
            <div className="flex items-center gap-3 text-red-600 mb-6">
              <div className="bg-red-50 p-2 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h2 className="text-xl font-bold">Something went wrong</h2>
            </div>
            
            <p className="text-slate-600 mb-4">{errorMessage}</p>
            {details && <p className="text-xs text-slate-400 font-mono mb-6">{details}</p>}
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
