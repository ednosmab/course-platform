import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockMap = vi.fn();

vi.mock('../supabase', () => ({
  supabase: {
    from: (...args: any[]) => {
      mockFrom(...args);
      return {
        select: (...args2: any[]) => {
          mockSelect(...args2);
          return {
            eq: (...args3: any[]) => {
              mockEq(...args3);
              return {
                order: (...args4: any[]) => {
                  mockOrder(...args4);
                  return { data: [], error: null };
                },
                single: (...args4: any[]) => {
                  mockSingle(...args4);
                  return { data: null, error: { message: 'not found' } };
                },
                maybeSingle: (...args4: any[]) => {
                  mockMaybeSingle(...args4);
                  return { data: null, error: null };
                },
                data: [],
                error: null,
              };
            },
            single: (...args4: any[]) => {
              mockSingle(...args4);
              return { data: null, error: { message: 'not found' } };
            },
            data: [],
            error: null,
          };
        },
      };
    },
  },
}));

import { CourseService } from './course';

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPublishedPaths', () => {
    it('should return empty array when no data', async () => {
      const result = await CourseService.getPublishedPaths();
      expect(result).toEqual([]);
    });

    it('should query from paths table with is_published filter', async () => {
      mockEq.mockImplementation(() => Promise.resolve({ data: [], error: null }));
      await CourseService.getPublishedPaths();
      expect(mockFrom).toHaveBeenCalledWith('paths');
    });
  });

  describe('getPublishedCourses', () => {
    it('should return empty array when no data', async () => {
      const result = await CourseService.getPublishedCourses();
      expect(result).toEqual([]);
    });

    it('should query from courses table with is_published filter', async () => {
      await CourseService.getPublishedCourses();
      expect(mockFrom).toHaveBeenCalledWith('courses');
    });
  });

  describe('getCourseStructure', () => {
    it('should throw when course not found', async () => {
      await expect(CourseService.getCourseStructure('nonexistent')).rejects.toThrow();
    });
  });
});
