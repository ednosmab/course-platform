import { progressOfflineStore, type LocalProgressData } from './progressOfflineStore';

const mockUser = 'test-user-id';
const mockLesson = 'test-lesson-id';

const mockData: LocalProgressData = {
  videoPosition: 120,
  percentageWatched: 45,
  blockStates: { 'block-1': { selectedOptionId: 'opt-a', submitted: true } },
  savedAt: '2026-06-20T10:00:00.000Z',
};

describe('progressOfflineStore', () => {
  it('exports all required functions', () => {
    expect(typeof progressOfflineStore.saveProgressLocal).toBe('function');
    expect(typeof progressOfflineStore.getProgressLocal).toBe('function');
    expect(typeof progressOfflineStore.queuePendingSave).toBe('function');
    expect(typeof progressOfflineStore.getPendingSaves).toBe('function');
    expect(typeof progressOfflineStore.clearPendingSave).toBe('function');
    expect(typeof progressOfflineStore.markSynced).toBe('function');
    expect(typeof progressOfflineStore.clearAll).toBe('function');
  });

  it('returns null on web platform', async () => {
    const result = await progressOfflineStore.getProgressLocal(mockUser, mockLesson);
    expect(result).toBeNull();
  });

  it('returns empty array for pending saves on web', async () => {
    const result = await progressOfflineStore.getPendingSaves();
    expect(result).toEqual([]);
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
