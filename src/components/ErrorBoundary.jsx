import React from 'react';
import '../styles/landing.css'; // Reuse existing styles if applicable

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg, #0f172a)',
          color: 'var(--text, #f8fafc)',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--accent, #3b82f6)' }}>Oops!</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Something went wrong.</h2>
          <p style={{ color: 'var(--text-light, #94a3b8)', marginBottom: '40px', maxWidth: '500px' }}>
            We've encountered an unexpected error. Please try reloading the page, or return to the dashboard to start over.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
             <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
                style={{ padding: '12px 24px', fontSize: '1rem' }}
             >
                Reload Page
             </button>
             <button 
                className="btn btn-ghost"
                onClick={() => {
                   window.location.href = '/';
                }}
                style={{ padding: '12px 24px', fontSize: '1rem' }}
             >
                Go Home
             </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
