import React from 'react';
import { YStack, Text } from 'tamagui';
import { QuizBlockRenderer } from './QuizBlock';

const baseBlock = {
  id: 'quiz-0001',
  type: 'quiz' as const,
  question: 'What is the capital of France?',
  options: [
    { id: 'a', text: 'London', isCorrect: false, feedback: 'London is the capital of the UK.' },
    { id: 'b', text: 'Paris', isCorrect: true, feedback: 'Correct! Paris is the capital of France.' },
    { id: 'c', text: 'Berlin', isCorrect: false, feedback: 'Berlin is the capital of Germany.' },
  ],
  styles: {},
};

export const Default = () => (
  <YStack gap="$4" p="$4" maxWidth={500}>
    <Text variant="meta">QuizBlock — Default</Text>
    <QuizBlockRenderer block={baseBlock} />
  </YStack>
);

export const WithLargeFont = () => (
  <YStack gap="$4" p="$4" maxWidth={500}>
    <Text variant="meta">QuizBlock — Large Font</Text>
    <QuizBlockRenderer block={{ ...baseBlock, styles: { fontSize: 'large', align: 'left' } }} />
  </YStack>
);
