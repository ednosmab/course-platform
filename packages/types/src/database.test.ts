import { describe, it, expect } from 'vitest';
import {
  CourseAccessSchema,
  PlanSchema,
  PlanCourseSchema,
  StudentPlanSchema,
} from './database';

describe('CourseAccess Schema', () => {
  it('should validate a valid course access record', () => {
    const valid = {
      course_id: '550e8400-e29b-41d4-a716-446655440000',
      access_mode: 'free',
      created_at: '2026-06-10T00:00:00Z',
      updated_at: '2026-06-10T00:00:00Z',
    };
    expect(() => CourseAccessSchema.parse(valid)).not.toThrow();
  });

  it('should validate progressive mode with prerequisite', () => {
    const valid = {
      course_id: '550e8400-e29b-41d4-a716-446655440000',
      access_mode: 'progressive',
      prerequisite_course_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: '2026-06-10T00:00:00Z',
      updated_at: '2026-06-10T00:00:00Z',
    };
    expect(() => CourseAccessSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid access mode', () => {
    const invalid = {
      course_id: '550e8400-e29b-41d4-a716-446655440000',
      access_mode: 'invalid',
      created_at: '2026-06-10T00:00:00Z',
      updated_at: '2026-06-10T00:00:00Z',
    };
    expect(() => CourseAccessSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid UUID', () => {
    const invalid = {
      course_id: 'not-a-uuid',
      access_mode: 'free',
      created_at: '2026-06-10T00:00:00Z',
      updated_at: '2026-06-10T00:00:00Z',
    };
    expect(() => CourseAccessSchema.parse(invalid)).toThrow();
  });
});

describe('Plan Schema', () => {
  it('should validate a valid plan record', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Plano Premium',
      description: 'Acesso total',
      is_active: true,
      created_at: '2026-06-10T00:00:00Z',
      updated_at: '2026-06-10T00:00:00Z',
    };
    expect(() => PlanSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty name', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: '',
      is_active: true,
      created_at: '2026-06-10T00:00:00Z',
      updated_at: '2026-06-10T00:00:00Z',
    };
    expect(() => PlanSchema.parse(invalid)).toThrow();
  });
});

describe('PlanCourse Schema', () => {
  it('should validate a valid plan course record', () => {
    const valid = {
      plan_id: '550e8400-e29b-41d4-a716-446655440000',
      course_id: '550e8400-e29b-41d4-a716-446655440001',
      order_index: 1,
    };
    expect(() => PlanCourseSchema.parse(valid)).not.toThrow();
  });

  it('should reject negative order_index', () => {
    const invalid = {
      plan_id: '550e8400-e29b-41d4-a716-446655440000',
      course_id: '550e8400-e29b-41d4-a716-446655440001',
      order_index: -1,
    };
    expect(() => PlanCourseSchema.parse(invalid)).toThrow();
  });
});

describe('StudentPlan Schema', () => {
  it('should validate a valid student plan record', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      plan_id: '550e8400-e29b-41d4-a716-446655440002',
      assigned_at: '2026-06-10T00:00:00Z',
    };
    expect(() => StudentPlanSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid user_id', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: 'not-a-uuid',
      plan_id: '550e8400-e29b-41d4-a716-446655440002',
      assigned_at: '2026-06-10T00:00:00Z',
    };
    expect(() => StudentPlanSchema.parse(invalid)).toThrow();
  });
});
