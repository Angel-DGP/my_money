import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Here you could log the error to an external service
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      // In Phase 2 this will be replaced with a proper UI component
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Algo salió mal</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={this.handleRetry}>Reintentar</button>
        </div>
      );
    }

    return this.props.children;
  }
}
