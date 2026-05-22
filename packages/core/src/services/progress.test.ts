import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressService } from './progress.js';
import { supabase } from '../supabase.js';
import { CertificateService } from './certificate';

type FromReturn = ReturnType<typeof supabase.from>;

vi.mock('../supabase.js', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

function makeProgress(overrides: Record<string, any> = {}) {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: '22222222-2222-2222-2222-222222222222',
    lesson_id: '33333333-3333-3333-3333-333333333333',
    last_played_seconds: 0,
    percentage_watched: 0,
    completed: false,
    completed_at: null,
    updated_at: new Date().toISOString(),
    tests_completed: {},
    ...overrides,
  };
}

describe('ProgressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveProgressImmediate', () => {
    it('should save video data without completed flag in payload', async () => {
      const mockResult = makeProgress({ percentage_watched: 80 });

      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as unknown as FromReturn);

      const result = await ProgressService.saveProgressImmediate(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        50,
        80,
      );

      expect(result.percentage_watched).toBe(80);
      expect(result.completed).toBe(false);
      expect(supabase.from).toHaveBeenCalledWith('student_progress');

      const upsertPayload = mockUpsert.mock.calls[0][0];
      expect(upsertPayload.completed).toBeUndefined();
    });

    it('should save video data even at 85% without setting completed directly', async () => {
      const mockResult = makeProgress({ percentage_watched: 85 });

      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as unknown as FromReturn);

      const result = await ProgressService.saveProgressImmediate(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        120,
        85,
      );

      expect(result.percentage_watched).toBe(85);
      expect(result.completed).toBe(false);
    });
  });

  describe('evaluateLessonCompletion', () => {
    function mockEvaluateCompletion(options: {
      lessonBlocks: any[];
      currentProgress: any;
      shouldComplete: boolean;
    }) {
      const mockSingleLesson = vi.fn().mockResolvedValue({
        data: { blocks: options.lessonBlocks },
        error: null,
      });
      const mockEqLesson = vi.fn().mockReturnValue({ single: mockSingleLesson });

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: options.currentProgress,
        error: null,
      });
      const mockEqSP2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEqSP1 = vi.fn().mockReturnValue({ eq: mockEqSP2 });

      if (!options.shouldComplete) {
        vi.mocked(supabase.from).mockImplementation(((table: string) => {
          if (table === 'lessons')
            return { select: vi.fn().mockReturnValue({ eq: mockEqLesson }) } as any;
          if (table === 'student_progress')
            return { select: vi.fn().mockReturnValue({ eq: mockEqSP1 }) } as any;
          return {} as any;
        }) as any);
        return () => {};
      }

      const completedData = {
        ...options.currentProgress,
        completed: true,
        completed_at: new Date().toISOString(),
      };
      const mockSingleUpdate = vi.fn().mockResolvedValue({ data: completedData, error: null });
      const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockSingleUpdate });
      const mockEqUpdate2 = vi.fn().mockReturnValue({ select: mockUpdateSelect });
      const mockEqUpdate1 = vi.fn().mockReturnValue({ eq: mockEqUpdate2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate1 });

      vi.mocked(supabase.from).mockImplementation(((table: string) => {
        if (table === 'lessons')
          return { select: vi.fn().mockReturnValue({ eq: mockEqLesson }) } as any;
        if (table === 'student_progress')
          return {
            select: vi.fn().mockReturnValue({ eq: mockEqSP1 }),
            update: mockUpdate,
          } as any;
        return {} as any;
      }) as any);

      vi.spyOn(CertificateService, 'checkAndIssue').mockResolvedValue(null);
    }

    it('should complete lesson when video >= 85% and no test blocks', async () => {
      const blocks = [
        { id: 'block-video', type: 'video', layouts: { desktop: { x: 0, y: 0, w: 1, h: 1 } }, styles: {} },
      ];
      const progress = makeProgress({ percentage_watched: 85 });

      mockEvaluateCompletion({ lessonBlocks: blocks, currentProgress: progress, shouldComplete: true });

      const result = await ProgressService.evaluateLessonCompletion(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
      );

      expect(result).not.toBeNull();
      expect(result!.completed).toBe(true);
    });

    it('should NOT complete lesson when video < 85% even without test blocks', async () => {
      const blocks = [
        { id: 'block-video', type: 'video', layouts: { desktop: { x: 0, y: 0, w: 1, h: 1 } }, styles: {} },
      ];
      const progress = makeProgress({ percentage_watched: 50 });

      mockEvaluateCompletion({ lessonBlocks: blocks, currentProgress: progress, shouldComplete: false });

      const result = await ProgressService.evaluateLessonCompletion(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
      );

      expect(result).toBeNull();
    });

    it('should complete lesson when video >= 85% and all test blocks >= 70%', async () => {
      const blocks = [
        { id: 'block-video', type: 'video', layouts: { desktop: { x: 0, y: 0, w: 1, h: 1 } }, styles: {} },
        { id: 'block-test', type: 'quiz', question: 'Test', options: [{ id: 'a', text: 'A', isCorrect: true }], layouts: { isTest: true } },
      ];
      const progress = makeProgress({
        percentage_watched: 85,
        tests_completed: { 'block-test': 80 },
      });

      mockEvaluateCompletion({ lessonBlocks: blocks, currentProgress: progress, shouldComplete: true });

      const result = await ProgressService.evaluateLessonCompletion(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
      );

      expect(result).not.toBeNull();
      expect(result!.completed).toBe(true);
    });

    it('should NOT complete when a test block has score < 70%', async () => {
      const blocks = [
        { id: 'block-video', type: 'video', layouts: { desktop: { x: 0, y: 0, w: 1, h: 1 } }, styles: {} },
        { id: 'block-test', type: 'quiz', question: 'Test', options: [{ id: 'a', text: 'A', isCorrect: true }], layouts: { isTest: true } },
      ];
      const progress = makeProgress({
        percentage_watched: 85,
        tests_completed: { 'block-test': 50 },
      });

      mockEvaluateCompletion({ lessonBlocks: blocks, currentProgress: progress, shouldComplete: false });

      const result = await ProgressService.evaluateLessonCompletion(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
      );

      expect(result).toBeNull();
    });

    it('should NOT re-complete if lesson already completed', async () => {
      const blocks = [
        { id: 'block-video', type: 'video', layouts: { desktop: { x: 0, y: 0, w: 1, h: 1 } }, styles: {} },
      ];
      const progress = makeProgress({
        percentage_watched: 85,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      mockEvaluateCompletion({ lessonBlocks: blocks, currentProgress: progress, shouldComplete: false });

      const result = await ProgressService.evaluateLessonCompletion(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
      );

      expect(result).toBeNull();
    });
  });

  describe('submitTestScore', () => {
    function mockSubmitTestScore(options: {
      currentProgress: any;
      upsertResult: any;
      lessonBlocks: any[];
      shouldComplete: boolean;
    }) {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: options.currentProgress, error: null });
      const mockEqSelect3 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEqSelect2 = vi.fn().mockReturnValue({ eq: mockEqSelect3 });
      const mockEqSelect1 = vi.fn().mockReturnValue({ eq: mockEqSelect2 });

      const mockSingleUpsert = vi.fn().mockResolvedValue({ data: options.upsertResult, error: null });
      const mockSelectUpsert = vi.fn().mockReturnValue({ single: mockSingleUpsert });
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectUpsert });

      if (options.shouldComplete) {
        const completedData = { ...options.upsertResult, completed: true, completed_at: new Date().toISOString() };
        const mockSingleUpdate = vi.fn().mockResolvedValue({ data: completedData, error: null });
        const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockSingleUpdate });
        const mockEqUpdate2 = vi.fn().mockReturnValue({ select: mockUpdateSelect });
        const mockEqUpdate1 = vi.fn().mockReturnValue({ eq: mockEqUpdate2 });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate1 });

        const mockSingleLesson = vi.fn().mockResolvedValue({ data: { blocks: options.lessonBlocks }, error: null });
        const mockEqLesson = vi.fn().mockReturnValue({ single: mockSingleLesson });

        vi.mocked(supabase.from).mockImplementation(((table: string) => {
          if (table === 'student_progress')
            return { select: mockEqSelect1 as any, upsert: mockUpsert as any, update: mockUpdate as any } as any;
          if (table === 'lessons')
            return { select: vi.fn().mockReturnValue({ eq: mockEqLesson }) } as any;
          return {} as any;
        }) as any);

        vi.spyOn(CertificateService, 'checkAndIssue').mockResolvedValue(null);
      } else {
        const mockSingleLesson = vi.fn().mockResolvedValue({ data: { blocks: [] }, error: null });
        const mockEqLesson = vi.fn().mockReturnValue({ single: mockSingleLesson });

        vi.mocked(supabase.from).mockImplementation(((table: string) => {
          if (table === 'student_progress')
            return { select: mockEqSelect1 as any, upsert: mockUpsert as any } as any;
          if (table === 'lessons')
            return { select: vi.fn().mockReturnValue({ eq: mockEqLesson }) } as any;
          return {} as any;
        }) as any);
      }
    }

    it('should save score and evaluate completion', async () => {
      const current = makeProgress({ percentage_watched: 85, tests_completed: {} });
      const updated = makeProgress({
        percentage_watched: 85,
        tests_completed: { 'test-block-1': 85 },
      });
      const blocks = [
        { id: 'block-video', type: 'video', layouts: { desktop: { x: 0, y: 0, w: 1, h: 1 } }, styles: {} },
        { id: 'test-block-1', type: 'quiz', question: 'Test', options: [{ id: 'a', text: 'A', isCorrect: true }], layouts: { isTest: true } },
      ];

      mockSubmitTestScore({
        currentProgress: current,
        upsertResult: updated,
        lessonBlocks: blocks,
        shouldComplete: true,
      });

      const result = await ProgressService.submitTestScore(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'test-block-1',
        85,
      );

      expect(result.tests_completed?.['test-block-1']).toBe(85);
      expect(result.completed).toBe(true);
    });

    it('should clamp score to 0-100 range', async () => {
      const current = makeProgress({ percentage_watched: 50, tests_completed: {} });
      const updated = makeProgress({
        percentage_watched: 50,
        tests_completed: { 'test-block-1': 0 },
      });

      mockSubmitTestScore({
        currentProgress: current,
        upsertResult: updated,
        lessonBlocks: [],
        shouldComplete: false,
      });

      const result = await ProgressService.submitTestScore(
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'test-block-1',
        -10,
      );

      expect(result.tests_completed?.['test-block-1']).toBe(0);
    });
  });
});
