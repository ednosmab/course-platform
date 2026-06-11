import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TamaguiProvider, config } from '@projeto/ui';
import { ErrorBoundary } from './ErrorBoundary';

function ThrowError({ message }: { message: string }) {
  throw new Error(message);
}

function NormalContent() {
  return <div>Normal content</div>;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme={null}>
      {children}
    </TamaguiProvider>
  );
}

describe('ErrorBoundary', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn> | null = null;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy?.mockRestore();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <NormalContent />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Normal content')).toBeDefined();
  });

  it('should render fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Test crash" />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Test crash')).toBeDefined();
    expect(screen.getByText('Try again')).toBeDefined();
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowError message="Test crash" />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Custom error UI')).toBeDefined();
    expect(() => screen.getByText('Try again')).toThrow();
  });

  it('should call onError callback when child throws', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError message="Callback test" />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0][0] as Error).message).toBe('Callback test');
  });

  it('should display unknown error message when error has no message', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="" />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Unknown error')).toBeDefined();
  });
});
