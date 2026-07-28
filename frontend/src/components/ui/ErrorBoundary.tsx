import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React ErrorBoundary error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '3rem 1.5rem',
          maxWidth: '600px',
          margin: '4rem auto',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          backgroundColor: '#121316',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          <h2 style={{ color: '#f4ab6a', marginTop: 0 }}>Something went wrong</h2>
          <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>
            An unexpected error occurred while loading this page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#f4ab6a',
              color: '#121316',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
