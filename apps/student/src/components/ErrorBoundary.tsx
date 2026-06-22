/**
 * ErrorBoundary — React class-based error boundary for the student app.
 *
 * Catches unhandled rendering errors in the child tree, logs them,
 * and displays a fallback UI with a retry button. Accepts an optional
 * custom fallback and an onError callback for external error reporting.
 */

import type { ReactNode } from 'react';
import React, { Component } from 'react';
import { YStack, Text, Button } from '@projeto/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
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
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
    this.props.onError?.(error, info);
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
            Something went wrong
          </Text>
          <Text fontSize="$3" color="$textMuted" textAlign="center">
            {this.state.error?.message || 'Unknown error'}
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
            Try again
          </Button>
        </YStack>
      );
    }

    return this.props.children;
  }
}
