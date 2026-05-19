const _size = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  true: 16,
} as const;

export const size = _size;

export const space = {
  ..._size,
  '-1': -4,
  '-2': -8,
  '-3': -12,
  '-4': -16,
  '-5': -20,
  '-6': -24,
  '-8': -32,
} as const;

export const radius = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 12,
  6: 16,
  8: 24,
  true: 8,
} as const;

export const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  true: 100,
} as const;
