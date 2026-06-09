import React, { useState, useRef, useEffect } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Icon } from '../Icon';

type FilterOption = {
  value: string;
  label: string;
};

type FilterDropdownProps = {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  icon?: string;
};

export function FilterDropdown({
  options,
  value,
  onChange,
  label = 'Filtros',
  icon = 'Filter',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasSelection = value !== options[0]?.value;

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
        borderColor={hasSelection ? '$primary' : '$border'}
        backgroundColor={hasSelection ? '$primary' : '$card'}
        cursor="pointer"
        hoverStyle={{ backgroundColor: hasSelection ? '$primary' : '$secondary' }}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Icon name={icon as any} size={14} color={hasSelection ? '$white' : '$textMuted'} />
        <Text fontSize={13} fontFamily="$display" fontWeight="400" color={hasSelection ? '$white' : '$text'}>
          {label}
        </Text>
        {hasSelection && selectedOption && (
          <XStack px={6} py={2} borderRadius={4} backgroundColor="rgba(255,255,255,0.2)">
            <Text fontSize={11} fontFamily="$display" fontWeight="400" color="$white">{selectedOption.label}</Text>
          </XStack>
        )}
        <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={14} color={hasSelection ? '$white' : '$textMuted'} />
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
                cursor="pointer"
                hoverStyle={{ backgroundColor: '$secondary' }}
                onPress={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <Text fontSize={13} fontFamily="$display" fontWeight="400" color={value === opt.value ? '$text' : '$textMuted'}>
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
