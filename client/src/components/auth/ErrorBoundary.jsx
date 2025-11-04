import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to render fallback UI on next render
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error (e.g., to console or a service like Sentry)
    console.error('Caught an error:', error, errorInfo.componentStack);
    // You can add logging to an external service here, e.g.:
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI (customize as needed)
      return (
        <div className="error-fallback">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;