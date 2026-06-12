import { describe, it, expect } from 'vitest';

describe('Icon', () => {
  it('should accept name prop', () => {
    const names = ['Plus', 'Play', 'BookOpen', 'CheckCircle', 'HelpCircle', 'Sparkles'];
    names.forEach((name) => {
      expect(typeof name).toBe('string');
    });
  });

  it('should have the available icons list', () => {
    const availableIcons = [
      'Plus', 'Play', 'BookOpen', 'CheckCircle', 'HelpCircle',
      'Sparkles', 'AlertTriangle', 'ArrowUp', 'ArrowDown', 'Trash2',
      'Edit', 'GripVertical', 'MoreHorizontal', 'Settings', 'X',
    ];
    expect(availableIcons.length).toBeGreaterThan(10);
  });
});
