import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

const mockGetItem = vi.fn();
const mockSetItem = vi.fn();
const mockRemoveItem = vi.fn();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: (...args: any[]) => mockGetItem(...args),
    setItem: (...args: any[]) => mockSetItem(...args),
    removeItem: (...args: any[]) => mockRemoveItem(...args),
  },
}));

const mockSaveProgressDebounced = vi.fn();
const mockSaveProgressImmediate = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@projeto/core', () => ({
  AuthService: {
    getSession: (...args: any[]) => mockGetSession(...args),
  },
  ProgressService: {
    saveProgressDebounced: (...args: any[]) => mockSaveProgressDebounced(...args),
    saveProgressImmediate: (...args: any[]) => mockSaveProgressImmediate(...args),
  },
}));

import { useMobileProgress } from './useMobileProgress';

describe('useMobileProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockRemoveItem.mockResolvedValue(undefined);
    mockGetSession.mockResolvedValue({ user: { id: 'test-user' } });
  });

  it('should start with zero pending items', async () => {
    const { result } = renderHook(() => useMobileProgress());
    await waitFor(() => {
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.isOffline).toBe(false);
    });
  });

  it('should save to AsyncStorage when offline', async () => {
    const { result } = renderHook(() => useMobileProgress());
    await waitFor(() => {
      expect(result.current.pendingCount).toBe(0);
    });

    act(() => {
      result.current.setIsOffline(true);
    });

    await act(async () => {
      await result.current.saveProgressMobile('lesson-1', 50, 100);
    });

    expect(mockSetItem).toHaveBeenCalledWith(
      'outbox_progress',
      expect.any(String),
    );
  });

  it('should call ProgressService when online', async () => {
    const { result } = renderHook(() => useMobileProgress());
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    await act(async () => {
      await result.current.saveProgressMobile('lesson-1', 50, 100);
    });

    expect(mockSaveProgressDebounced).toHaveBeenCalled();
  });

  it('should sync pending items and clear queue', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        { lessonId: 'l1', progressSec: 50, durationSec: 100, updatedAt: new Date().toISOString() },
      ]),
    );

    const { result } = renderHook(() => useMobileProgress());
    await waitFor(() => {
      expect(result.current.pendingCount).toBe(1);
    });

    await act(async () => {
      await result.current.syncPending();
    });

    expect(mockSaveProgressImmediate).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith('outbox_progress');
  });

  it('should skip saveProgressMobile when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const { result } = renderHook(() => useMobileProgress());
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    await act(async () => {
      await result.current.saveProgressMobile('lesson-1', 50, 100);
    });

    expect(mockSaveProgressDebounced).not.toHaveBeenCalled();
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it('should skip syncPending when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        { lessonId: 'l1', progressSec: 50, durationSec: 100, updatedAt: new Date().toISOString() },
      ]),
    );

    const { result } = renderHook(() => useMobileProgress());
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    await act(async () => {
      await result.current.syncPending();
    });

    expect(mockSaveProgressImmediate).not.toHaveBeenCalled();
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });
});
