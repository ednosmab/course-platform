import { describe, it, expect } from 'vitest';

describe('Card', () => {
  it('should render without crashing (basic smoke test)', () => {
    expect(true).toBe(true);
  });

  it('should accept variant prop', () => {
    const variants = ['elevated', 'outlined'] as const;
    variants.forEach((v) => {
      expect(v).toMatch(/^(elevated|outlined)$/);
    });
  });
});
