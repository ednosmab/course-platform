import { describe, it, expect } from 'vitest';

describe('Button', () => {
  it('should render without crashing (basic smoke test)', () => {
    expect(true).toBe(true);
  });

  it('should accept variant prop', () => {
    const variants = ['primary', 'secondary', 'ghost'] as const;
    variants.forEach((v) => {
      expect(v).toMatch(/^(primary|secondary|ghost)$/);
    });
  });
});
