import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CertificateService } from './certificate.js';
import { supabase } from '../supabase.js';
type FromReturn = ReturnType<typeof supabase.from>;

vi.mock('../supabase.js', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

function mockChain(responses: Record<string, any>) {
  let chain: any = {};
  const handler = {
    get(_target: any, prop: string) {
      if (prop === 'then') return undefined;
      if (responses[prop] !== undefined) return vi.fn().mockResolvedValue(responses[prop]);
      if (!chain[prop]) {
        chain[prop] = new Proxy({}, handler);
      }
      return chain[prop];
    },
  };
  return new Proxy({}, handler);
}

describe('CertificateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCourseIdFromLesson', () => {
    it('should return course_id from lesson -> module chain', async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValueOnce({ data: { module_id: 'mod-1' }, error: null })
        .mockResolvedValueOnce({ data: { course_id: 'course-1' }, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as unknown as FromReturn);

      const result = await CertificateService.getCourseIdFromLesson('lesson-1');
      expect(result).toBe('course-1');
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });

    it('should return null when lesson not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as unknown as FromReturn);

      const result = await CertificateService.getCourseIdFromLesson('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getCompletedLessonCount', () => {
    it('should return completed and total counts', async () => {
      const mockModules = vi.fn().mockResolvedValue({
        data: [{ id: 'mod-1' }, { id: 'mod-2' }],
        error: null,
      });
      const mockLessons = vi.fn().mockResolvedValue({
        data: [{ id: 'lesson-1' }, { id: 'lesson-2' }, { id: 'lesson-3' }],
        error: null,
      });
      const mockProgress = vi.fn().mockResolvedValue({
        data: [{ lesson_id: 'lesson-1' }, { lesson_id: 'lesson-2' }],
        error: null,
      });

      const mockIn = vi.fn().mockReturnValue({ data: [], error: null });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });

      const calls: Record<string, any> = {};

      vi.mocked(supabase.from).mockImplementation(
        ((table: string) => {
          if (table === 'modules') return { select: vi.fn().mockReturnValue({ eq: mockModules }) } as any;
          if (table === 'lessons') return { select: vi.fn().mockReturnValue({ in: mockLessons }) } as any;
          if (table === 'student_progress')
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    in: mockProgress,
                  }),
                }),
              }),
            } as any;
          return {} as any;
        }) as any
      );

      const result = await CertificateService.getCompletedLessonCount('user-1', 'course-1');
      expect(result).toEqual({ completed: 2, total: 3 });
    });

    it('should return zeros when no modules exist', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }),
      } as unknown as FromReturn);

      const result = await CertificateService.getCompletedLessonCount('user-1', 'empty-course');
      expect(result).toEqual({ completed: 0, total: 0 });
    });
  });

  describe('isCourseCompleted', () => {
    it('should return true when all lessons completed', async () => {
      vi.spyOn(CertificateService, 'getCompletedLessonCount').mockResolvedValue({
        completed: 5,
        total: 5,
      });

      const result = await CertificateService.isCourseCompleted('user-1', 'course-1');
      expect(result).toBe(true);
    });

    it('should return false when not all lessons completed', async () => {
      vi.spyOn(CertificateService, 'getCompletedLessonCount').mockResolvedValue({
        completed: 3,
        total: 5,
      });

      const result = await CertificateService.isCourseCompleted('user-1', 'course-1');
      expect(result).toBe(false);
    });
  });

  describe('issueCertificate', () => {
    it('should issue a certificate when none exists', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: '00000000-0000-0000-0000-000000000001',
          user_id: '00000000-0000-0000-0000-000000000002',
          course_id: '00000000-0000-0000-0000-000000000003',
          uuid_bsgi: 'BSGI-xxxx',
          created_at: new Date().toISOString(),
        },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });

      vi.mocked(supabase.from).mockImplementation(
        ((table: string) => {
          if (table === 'certificates') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: mockEq1,
                }),
              }),
              insert: mockInsert,
            } as any;
          }
          return {} as any;
        }) as any
      );

      const result = await CertificateService.issueCertificate(
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
      );
      expect(result).not.toBeNull();
      expect(result!.user_id).toBe('00000000-0000-0000-0000-000000000002');
      expect(result!.course_id).toBe('00000000-0000-0000-0000-000000000003');
    });

    it('should return null when certificate already exists', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: '00000000-0000-0000-0000-000000000099' },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
          }),
        }),
      } as unknown as FromReturn);

      const result = await CertificateService.issueCertificate(
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
      );
      expect(result).toBeNull();
    });
  });

  describe('getUserCertificates', () => {
    it('should return list of certificates', async () => {
      const mockData = [
        { id: '00000000-0000-0000-0000-000000000001', user_id: '00000000-0000-0000-0000-000000000002', course_id: '00000000-0000-0000-0000-000000000003', uuid_bsgi: 'BSGI-1', created_at: new Date().toISOString() },
      ];
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: mockEq }),
      } as unknown as FromReturn);

      const result = await CertificateService.getUserCertificates('00000000-0000-0000-0000-000000000002');
      expect(result).toHaveLength(1);
      expect(result[0].uuid_bsgi).toBe('BSGI-1');
    });

    it('should return empty array on error', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'error' } });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: mockEq }),
      } as unknown as FromReturn);

      const result = await CertificateService.getUserCertificates('00000000-0000-0000-0000-000000000002');
      expect(result).toEqual([]);
    });
  });
});
