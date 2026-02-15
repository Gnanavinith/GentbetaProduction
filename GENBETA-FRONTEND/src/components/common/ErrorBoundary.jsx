import React from 'react';
import { toast } from 'react-hot-toast';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Show user-friendly error notification
    toast.error('Something went wrong. Please try again.', {
      id: 'error-boundary',
      duration: 5000
    });

    // Log error to monitoring service (if configured)
    if (window.Sentry) {
      const eventId = window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
      this.setState({ eventId });
    }
  }

  handleRetry = () => {
    // Reset error state
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    
    // Clear the error toast
    toast.dismiss('error-boundary');
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 text-red-500 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
            
            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 bg-gray-100 p-4 rounded text-left">
                <summary className="font-medium text-gray-700 cursor-pointer">
                  Error Details
                </summary>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-mono">{this.state.error?.toString()}</p>
                  <pre className="mt-2 text-xs overflow-auto max-h-32">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async Error Boundary for Promise-based errors
class AsyncErrorBoundary extends ErrorBoundary {
  constructor(props) {
    super(props);
    this.state.hasAsyncError = false;
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      hasAsyncError: error.name === 'AsyncError'
    };
  }

  componentDidCatch(error, errorInfo) {
    super.componentDidCatch(error, errorInfo);
    
    // Handle async errors specifically
    if (error.name === 'AsyncError') {
      console.error('Async Error Boundary caught:', error);
    }
  }
}

// Network Error Boundary
class NetworkErrorBoundary extends ErrorBoundary {
  static getDerivedStateFromError(error) {
    const isNetworkError = error.message?.includes('Network') || 
                          error.message?.includes('fetch') ||
                          error.name === 'TypeError';
    
    return { 
      hasError: true, 
      error,
      isNetworkError
    };
  }

  componentDidCatch(error, errorInfo) {
    super.componentDidCatch(error, errorInfo);
    
    if (this.state.isNetworkError) {
      toast.error('Network connection lost. Please check your internet connection.', {
        id: 'network-error'
      });
    }
  }

  render() {
    if (this.state.hasError && this.state.isNetworkError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 text-yellow-500 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Network Connection Lost
            </h2>
            
            <p className="text-gray-600 mb-6">
              Please check your internet connection and try again.
            </p>
            
            <button
              onClick={this.handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    return super.render();
  }
}

// Export boundary components
export { ErrorBoundary, AsyncErrorBoundary, NetworkErrorBoundary };

// Higher-order component for wrapping components
export const withErrorBoundary = (Component, ErrorComponent = ErrorBoundary) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorComponent>
        <Component {...props} />
      </ErrorComponent>
    );
  };
};

// Context for global error handling
export const ErrorContext = React.createContext();

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = React.useState([]);

  const addError = (error) => {
    setErrors(prev => [...prev, {
      id: Date.now(),
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const value = {
    errors,
    addError,
    clearErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};