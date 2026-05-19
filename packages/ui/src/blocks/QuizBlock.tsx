import React, { useState } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { QuizBlock } from '@projeto/types';
import { renderSimpleMarkdown } from '../utils/markdown';
import { HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react-native';

type Props = {
  block: QuizBlock;
};

export const QuizBlockRenderer: React.FC<Props> = ({ block }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const activeOption = block.options.find((o) => o.id === selectedOptionId);

  const fontSize =
    block.styles?.fontSize === 'small' ? 12
    : block.styles?.fontSize === 'large' ? 18
    : block.styles?.fontSize === 'xlarge' ? 24
    : 14;

  const textAlign = block.styles?.align || 'left';

  const handleSubmit = () => {
    if (selectedOptionId) {
      setSubmitted(true);
    }
  };

  return (
    <YStack width="100%" bg="$gray1" borderRadius="$6" borderWidth={1} borderColor="$gray2" p="$4" gap="$3.5">
      <XStack ai="center" gap="$2">
        <HelpCircle size={18} color="#ec4899" style={{ marginTop: 2 }} />
        <YStack flex={1} ml="$2">
          {renderSimpleMarkdown(block.question, {
            color: '$gray9',
            fontWeight: '600',
            flex: 1,
            fontSize,
            textAlign,
          })}
        </YStack>
      </XStack>

      <YStack gap="$2">
        {block.options.map((opt) => {
          const isSelected = opt.id === selectedOptionId;
          const isCorrectAnswerSelected = activeOption?.isCorrect;
          const showCorrectStyle = submitted && opt.isCorrect && isCorrectAnswerSelected;
          const showIncorrectStyle = submitted && isSelected && !opt.isCorrect;

          return (
            <XStack
              key={opt.id}
              jc="space-between"
              ai="center"
              bg="$white"
              borderWidth={1}
              borderColor={showCorrectStyle ? '$success' : showIncorrectStyle ? '$danger' : isSelected ? '$primary' : '$gray2'}
              borderRadius="$3"
              p="$3"
              pointerEvents={submitted ? 'none' : 'auto'}
              onPress={() => setSelectedOptionId(opt.id)}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text
                color={showCorrectStyle ? '$success' : showIncorrectStyle ? '$danger' : isSelected ? '$primary' : '$gray7'}
                fontSize={12}
                fontWeight={isSelected || showCorrectStyle || showIncorrectStyle ? '600' : '400'}
              >
                {opt.text}
              </Text>

              {showCorrectStyle && <CheckCircle size={16} color="$primary" />}
              {showIncorrectStyle && <AlertTriangle size={16} color="#ec4899" />}
            </XStack>
          );
        })}
      </YStack>

      {!submitted ? (
        <YStack
          bg={!selectedOptionId ? '$surface' : '$primary'}
          borderRadius="$3"
          p="$3"
          ai="center"
          jc="center"
          mt="$1"
          pointerEvents={!selectedOptionId ? 'none' : 'auto'}
          opacity={!selectedOptionId ? 0.6 : 1}
          onPress={handleSubmit}
          pressStyle={{ scale: 0.96, opacity: 0.9 }}
        >
          <Text color="$white" fontSize={12} fontWeight="600">Confirm Answer</Text>
        </YStack>
      ) : (
        <YStack
          borderRadius="$5"
          p="$3"
          gap="$1.5"
          mt="$1"
          bg={activeOption?.isCorrect ? 'rgba(99, 102, 241, 0.05)' : 'rgba(236, 72, 153, 0.05)'}
          borderWidth={1}
          borderColor={activeOption?.isCorrect ? 'rgba(99, 102, 241, 0.2)' : 'rgba(236, 72, 153, 0.2)'}
        >
          <Text fontSize={12} fontWeight="700" color="$gray1">
            {activeOption?.isCorrect ? 'Correct Answer!' : 'Incorrect Answer.'}
          </Text>
          <Text fontSize={11} color="$gray4" lineHeight={16}>
            {activeOption?.feedback}
          </Text>

          <YStack
            onPress={() => {
              setSubmitted(false);
              setSelectedOptionId(null);
            }}
            pressStyle={{ opacity: 0.8 }}
            mt="$2"
            alignSelf="flex-start"
          >
            <Text color="#a78bfa" fontSize={11} fontWeight="600">Try Again</Text>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
};
