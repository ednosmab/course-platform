import { styled, Text as TamaguiText } from 'tamagui';

export const Text = styled(TamaguiText, {
  name: 'Text',
  fontFamily: '$body',
  color: '$text',
  
  variants: {
    variant: {
      h1: {
        fontFamily: '$heading',
        fontSize: '$7',
        fontWeight: '$7',
        lineHeight: '$7',
        color: '$text',
      },
      h2: {
        fontFamily: '$heading',
        fontSize: '$5',
        fontWeight: '$6',
        lineHeight: '$5',
      },
      h3: {
        fontFamily: '$heading',
        fontSize: '$4',
        fontWeight: '$6',
        lineHeight: '$4',
      },
      body: {
        fontFamily: '$body',
        fontSize: '$3',
        fontWeight: '$4',
        lineHeight: '$3',
      },
      caption: {
        fontFamily: '$body',
        fontSize: '$2',
        fontWeight: '$4',
        lineHeight: '$2',
        color: '$textMuted',
      },
      meta: {
        fontFamily: '$body',
        fontSize: '$1',
        fontWeight: '$6',
        lineHeight: '$1',
        color: '$primary',
        textTransform: 'uppercase',
        letterSpacing: 1,
      },
    },
  } as const,
  
  defaultVariants: {
    variant: 'body',
  },
});

export type TextProps = React.ComponentProps<typeof Text>;
