import { styled, YStack } from 'tamagui';
import { Platform } from 'react-native';

export const Card = styled(YStack, {
  name: 'Card',
  
  // Estilo Base
  backgroundColor: '$surface',
  borderRadius: '$5',
  padding: '$4',
  borderWidth: 1,
  borderColor: '$border',
  
  variants: {
    elevated: {
      true: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
    },
    interactive: {
      true: {
        hoverStyle: Platform.OS === 'web'
          ? { scale: 1.01, borderColor: '$primary' }
          : undefined,
        pressStyle: {
          scale: 0.99,
          opacity: 0.9,
        },
      },
    },
    variant: {
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '$border',
      },
      glass: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
      },
    },
  } as const,
}, {
  defaultProps: {
    animation: 'fast',
  }
});

export type CardProps = React.ComponentProps<typeof Card>;
