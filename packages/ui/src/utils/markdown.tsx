import React from 'react';
import { Text, YStack } from 'tamagui';

export const renderSimpleMarkdown = (text: string, baseProps: any) => {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    const trimmedLine = line.trim();
    const isQuote = trimmedLine.startsWith('>') || trimmedLine.startsWith('&gt;');
    const cleanContent = isQuote
      ? (trimmedLine.startsWith('&gt;') ? trimmedLine.slice(4).trim() : trimmedLine.slice(1).trim())
      : line;

    const regex = /(\*\*\*.*?\*\*\*|___.*?___|\*\*\_.*?\_\*\*|\_\*\*.*?\*\*\_|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g;
    const parts = cleanContent.split(regex);

    const renderedParts = parts.map((part, partIdx) => {
      const key = `part-${lineIdx}-${partIdx}`;
      if (part.startsWith('***') && part.endsWith('***')) {
        return <Text key={key} fontWeight="bold" fontStyle="italic">{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('___') && part.endsWith('___')) {
        return <Text key={key} fontWeight="bold" fontStyle="italic">{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('**_') && part.endsWith('_**')) {
        return <Text key={key} fontWeight="bold" fontStyle="italic">{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('_**') && part.endsWith('**_')) {
        return <Text key={key} fontWeight="bold" fontStyle="italic">{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={key} fontWeight="bold">{part.slice(2, -2)}</Text>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <Text key={key} fontWeight="bold">{part.slice(2, -2)}</Text>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <Text key={key} fontStyle="italic">{part.slice(1, -1)}</Text>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <Text key={key} fontStyle="italic">{part.slice(1, -1)}</Text>;
      }
      return part;
    });

    if (isQuote) {
      return (
        <YStack
          key={lineIdx}
          borderLeftColor="$info"
          borderLeftWidth={3}
          pl="$3"
          my="$1.5"
          py="$1.5"
          pr="$2"
          borderRadius="$1"
        >
          <Text {...baseProps} fontStyle="italic" color="$gray6">
            {renderedParts}
          </Text>
        </YStack>
      );
    }

    return (
      <Text key={lineIdx} {...baseProps}>
        {renderedParts}
      </Text>
    );
  });
};
