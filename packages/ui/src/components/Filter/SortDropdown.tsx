import React, { useState, useRef, useEffect } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Icon } from '../Icon';

type SortOption = {
  value: string;
  label: string;
};

type SortDropdownProps = {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
};

export function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <XStack position="relative" ref={dropdownRef}>
      <XStack
        gap={6}
        px={12}
        py={6}
        borderRadius={8}
        borderWidth={1}
        ai="center"
        borderColor="$border"
        backgroundColor="$card"
        cursor="pointer"
        hoverStyle={{ backgroundColor: '$secondary' }}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Icon name="ArrowUpDown" size={14} color="$textMuted" />
        <Text fontSize={13} fontFamily="$display">{selectedOption?.label || 'Ordenar'}</Text>
        <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={14} color="$textMuted" />
      </XStack>

      {isOpen && (
        <XStack
          position="absolute"
          top="100%"
          left={0}
          mt={4}
          p={4}
          borderRadius={8}
          borderWidth={1}
          borderColor="$border"
          backgroundColor="$card"
          zIndex={50}
          minWidth={160}
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          <YStack gap={2}>
            {options.map((opt) => (
              <XStack
                key={opt.value}
                px={10}
                py={6}
                borderRadius={4}
                backgroundColor={value === opt.value ? '$secondary' : 'transparent'}
                cursor="pointer"
                hoverStyle={{ backgroundColor: '$secondary' }}
                onPress={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <Text fontSize={13} fontFamily="$display" color={value === opt.value ? '$text' : '$textMuted'}>
                  {opt.label}
                </Text>
              </XStack>
            ))}
          </YStack>
        </XStack>
      )}
    </XStack>
  );
}
