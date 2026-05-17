import { styled, YStack } from 'tamagui';

export const Card = styled(YStack, {
  name: 'Card',
  
  // Estilo Base
  backgroundColor: '$surface',
  borderRadius: '$5',
  padding: '$4',
  borderWidth: 1,
  borderColor: '$border',
  
  // Sombra suave (compatível com Web e Native)
  shadowColor: '$black',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 4, // Necessário para Android
  
  variants: {
    interactive: {
      true: {
        cursor: 'pointer',
        hoverStyle: {
          scale: 1.01,
          borderColor: '$primary',
          shadowOpacity: 0.15,
        },
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
        backdropFilter: 'blur(10px)', // Apenas para Web, ignorado no Native de forma segura
      },
    },
  } as const,
}, {
  defaultProps: {
    animation: 'fast',
  }
});

export type CardProps = React.ComponentProps<typeof Card>;
