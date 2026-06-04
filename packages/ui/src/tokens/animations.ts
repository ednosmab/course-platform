import { createAnimations } from '@tamagui/animations-react-native';

export const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 25,
    mass: 1,
    stiffness: 170,
  },
  slow: {
    type: 'spring',
    damping: 30,
    mass: 1,
    stiffness: 100,
  },
});
