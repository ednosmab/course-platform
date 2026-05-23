import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressService } from '@projeto/core';

interface PendingProgress {
  lessonId: string;
  progressSec: number;
  durationSec: number;
  updatedAt: string;
}

export function useMobileProgress() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    updatePendingCount();
  }, []);

  const updatePendingCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('outbox_progress');
      if (stored) {
        const parsed = JSON.parse(stored) as PendingProgress[];
        setPendingCount(parsed.length);
      } else {
        setPendingCount(0);
      }
    } catch {
      setPendingCount(0);
    }
  };

  const saveProgressMobile = async (lessonId: string, progressSec: number, durationSec: number) => {
    const percentageWatched = Math.round((progressSec / durationSec) * 100);

    if (isOffline) {
      try {
        const stored = await AsyncStorage.getItem('outbox_progress');
        const list: PendingProgress[] = stored ? JSON.parse(stored) : [];
        
        const filtered = list.filter((p) => p.lessonId !== lessonId);
        filtered.push({
          lessonId,
          progressSec,
          durationSec,
          updatedAt: new Date().toISOString(),
        });

        await AsyncStorage.setItem('outbox_progress', JSON.stringify(filtered));
        await updatePendingCount();
      } catch (err) {
        console.error('Failed to store offline progress:', err);
      }
    } else {
      try {
        // Usa o debounce do core para economizar banda e persistir de forma inteligente
        ProgressService.saveProgressDebounced(
          'student-user-uuid',
          lessonId,
          progressSec,
          percentageWatched
        );
      } catch (err) {
        console.warn('Online sync failed, falling back to offline...', err);
        setIsOffline(true);
        await saveProgressMobile(lessonId, progressSec, durationSec);
      }
    }
  };

  const syncPending = async () => {
    try {
      const stored = await AsyncStorage.getItem('outbox_progress');
      if (!stored) return;

      const list: PendingProgress[] = JSON.parse(stored);
      if (list.length === 0) return;

      for (const item of list) {
        const percentageWatched = Math.round((item.progressSec / item.durationSec) * 100);
        // Na sincronização em background, persiste imediatamente sem debounce
        await ProgressService.saveProgressImmediate(
          'student-user-uuid',
          item.lessonId,
          item.progressSec,
          percentageWatched
        );
      }

      await AsyncStorage.removeItem('outbox_progress');
      setIsOffline(false);
      await updatePendingCount();
    } catch (err) {
      console.error('Background sync failed:', err);
    }
  };

  return {
    isOffline,
    setIsOffline,
    pendingCount,
    saveProgressMobile,
    syncPending,
  };
}
