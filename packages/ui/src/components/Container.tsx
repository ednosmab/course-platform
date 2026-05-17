import { styled, YStack } from 'tamagui';

export const Container = styled(YStack, {
  name: 'Container',
  
  // Layout Centrado e Responsivo
  width: '100%',
  maxWidth: 1200,
  marginHorizontal: 'auto',
  paddingHorizontal: '$4',
  
  variants: {
    fluid: {
      true: {
        maxWidth: '100%',
      },
    },
    size: {
      small: {
        maxWidth: 800,
      },
      medium: {
        maxWidth: 1024,
      },
      large: {
        maxWidth: 1200,
      },
    },
  } as const,
  
  defaultVariants: {
    size: 'large',
  },
});

export type ContainerProps = React.ComponentProps<typeof Container>;
