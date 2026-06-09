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
    console.error('[ErrorBoundary] Unhandled error:', error.message);
    console.error('[ErrorBoundary] Stack:', error.stack);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
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
        <YStack f={1} ai="center" jc="center" p="$4" gap="$4" maxWidth={600}>
          <Text fontSize="$6" fontWeight="700" color="$danger">
            Algo deu errado
          </Text>
          <Text fontSize="$3" color="$textMuted" textAlign="center">
            {this.state.error?.message || 'Erro desconhecido'}
          </Text>
          {this.state.error?.stack && (
            <YStack
              w="100%"
              bg="$background"
              borderWidth={1}
              borderColor="$border"
              borderRadius={8}
              p="$3"
              maxHeight={200}
            >
              <Text
                fontSize={11}
                color="$textMuted"
                fontFamily="monospace"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' } as any}
              >
                {this.state.error.stack}
              </Text>
            </YStack>
          )}
          <Button onPress={this.handleRetry} theme="active">
            Tentar novamente
          </Button>
        </YStack>
      );
    }

    return this.props.children;
  }
}
