import { describe, it, expect, vi } from 'vitest';
import { createProgressOfflineStore, type LocalProgressData } from './progressOfflineStore';
import type { ILessonProgressRepository } from '../persistence/repos/types';

const mockUser = 'test-user-id';
const mockLesson = 'test-lesson-id';

const mockData: LocalProgressData = {
  videoPosition: 120,
  percentageWatched: 45,
  blockStates: { 'block-1': { selectedOptionId: 'opt-a', submitted: true } },
  savedAt: '2026-06-20T10:00:00.000Z',
};

function createMockRepo(): ILessonProgressRepository {
  return {
    upsert: vi.fn(async () => {}),
    getByUserAndLesson: vi.fn(async () => null),
    getUnsynced: vi.fn(async () => []),
    markSynced: vi.fn(async () => {}),
    clearAll: vi.fn(async () => {}),
  };
}

describe('progressOfflineStore', () => {
  it('exports all required functions', () => {
    const repo = createMockRepo();
    const store = createProgressOfflineStore(repo);
    expect(typeof store.saveProgressLocal).toBe('function');
    expect(typeof store.getProgressLocal).toBe('function');
    expect(typeof store.queuePendingSave).toBe('function');
    expect(typeof store.getPendingSaves).toBe('function');
    expect(typeof store.clearPendingSave).toBe('function');
    expect(typeof store.markSynced).toBe('function');
    expect(typeof store.clearAll).toBe('function');
  });

  it('delegates to repository', async () => {
    const repo = createMockRepo();
    const store = createProgressOfflineStore(repo);

    await store.saveProgressLocal(mockUser, mockLesson, mockData);
    expect(repo.upsert).toHaveBeenCalledWith(mockUser, mockLesson, mockData);
  });

  it('returns null when no progress found', async () => {
    const repo = createMockRepo();
    const store = createProgressOfflineStore(repo);

    const result = await store.getProgressLocal(mockUser, mockLesson);
    expect(result).toBeNull();
  });

  it('LocalProgressData interface matches expected shape', () => {
    const data: LocalProgressData = {
      videoPosition: 0,
      percentageWatched: 0,
      blockStates: {},
      savedAt: new Date().toISOString(),
    };
    expect(data.videoPosition).toBe(0);
    expect(data.percentageWatched).toBe(0);
    expect(typeof data.blockStates).toBe('object');
    expect(typeof data.savedAt).toBe('string');
  });
});
