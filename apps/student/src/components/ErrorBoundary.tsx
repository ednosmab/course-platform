import React, { Component, ReactNode } from 'react';
import { YStack, Text, Button } from '@projeto/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Unhandled error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <YStack f={1} ai="center" jc="center" p="$4" space="$4">
          <Text fontSize="$6" fontWeight="700" color="$red10">
            Algo deu errado
          </Text>
          <Text fontSize="$3" color="$gray10" textAlign="center" maxWidth={300}>
            Ocorreu um erro inesperado. Tente novamente ou contate o suporte.
          </Text>
          <Button onPress={this.handleRetry} theme="active">
            Tentar novamente
          </Button>
        </YStack>
      );
    }

    return this.props.children;
  }
}
