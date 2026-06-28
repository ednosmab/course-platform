import { styled, YStack, Text } from 'tamagui';
import React from 'react';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const ButtonFrame = styled(YStack, {
  name: 'Button',
  role: 'button',
  focusable: true,
  
  // Estilo Base
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$4',
  
  // Estados Reativos
  pressStyle: {
    scale: 0.96,
    opacity: 0.9,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        pressStyle: {
          backgroundColor: '$primary',
        },
      },
      secondary: {
        backgroundColor: '$secondary',
        pressStyle: {
          backgroundColor: '$secondary',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        pressStyle: {
          backgroundColor: '$surface',
          opacity: 0.8,
        },
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
  } as const,
  
  defaultVariants: {
    variant: 'primary',
  },
}, {
  defaultProps: {
    animation: 'fast',
  }
});

export type ButtonProps = React.ComponentProps<typeof ButtonFrame> & {
  children?: React.ReactNode;
  textProps?: React.ComponentProps<typeof Text>;
};

export const Button = React.forwardRef<React.ComponentRef<typeof ButtonFrame>, ButtonProps>(
  ({ children, textProps, ...props }, ref) => {
    return (
      <ButtonFrame
        ref={ref}
        {...(props as any)}
        hoverStyle={isWeb ? { opacity: 0.95 } : undefined}
        cursor={isWeb ? 'pointer' : undefined}
      >
        {typeof children === 'string' ? (
          <Text
            fontFamily="$body"
            fontSize="$3"
            fontWeight="$6"
            color={props.variant === 'ghost' ? '$text' : '$white'}
            {...(textProps as any)}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </ButtonFrame>
    );
  }
);
