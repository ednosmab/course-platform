import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressService } from './progress.js';
import { supabase } from '../supabase.js';
type FromReturn = ReturnType<typeof supabase.from>;

// Mock do módulo supabase
vi.mock('../supabase.js', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

describe('ProgressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveProgressImmediate', () => {
    it('deve marcar concluído como false se o percentual assistido for menor que 85%', async () => {
      const mockResult = {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        lesson_id: '33333333-3333-3333-3333-333333333333',
        last_played_seconds: 50,
        percentage_watched: 80,
        completed: false,
        completed_at: null,
        updated_at: new Date().toISOString(),
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as unknown as FromReturn);

      const result = await ProgressService.saveProgressImmediate(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        50,
        80
      );

      expect(result.completed).toBe(false);
      expect(result.percentage_watched).toBe(80);
      expect(supabase.from).toHaveBeenCalledWith('student_progress');
    });

    it('deve marcar concluído como true se o percentual assistido for 85% ou mais', async () => {
      const mockResult = {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        lesson_id: '33333333-3333-3333-3333-333333333333',
        last_played_seconds: 120,
        percentage_watched: 85,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as unknown as FromReturn);

      const result = await ProgressService.saveProgressImmediate(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        120,
        85
      );

      expect(result.completed).toBe(true);
      expect(result.completed_at).toBeDefined();
      expect(result.percentage_watched).toBe(85);
    });
  });
});
