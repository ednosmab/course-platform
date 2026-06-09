import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { FilterDropdown } from './FilterDropdown';
import { SortDropdown } from './SortDropdown';
import { FilterChip } from './FilterChip';

type FilterOption = {
  value: string;
  label: string;
};

type SortOption = {
  value: string;
  label: string;
};

type FilterBarProps = {
  filterOptions: FilterOption[];
  filterValue: string;
  onFilterChange: (value: string) => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  resultCount: number;
  resultLabel?: string;
  filterLabel?: string;
  onClearFilter?: () => void;
};

export function FilterBar({
  filterOptions,
  filterValue,
  onFilterChange,
  sortOptions,
  sortValue,
  onSortChange,
  resultCount,
  resultLabel = 'itens',
  filterLabel,
  onClearFilter,
}: FilterBarProps) {
  const hasActiveFilter = filterLabel && filterLabel !== filterOptions[0]?.label;

  return (
    <YStack>
      <XStack gap={8} ai="center" mb={16} flexWrap="wrap">
        <FilterDropdown
          options={filterOptions}
          value={filterValue}
          onChange={onFilterChange}
          label="Filtros"
          icon="Filter"
        />

        <SortDropdown
          options={sortOptions}
          value={sortValue}
          onChange={onSortChange}
        />

        <XStack ml="auto" ai="center" gap={6}>
          <Text fontSize={12} fontFamily="$display" color="$textMuted">
            {resultCount} {resultCount === 1 ? resultLabel.replace(/s$/, '') : resultLabel}
          </Text>
        </XStack>
      </XStack>

      {hasActiveFilter && onClearFilter && (
        <XStack gap={6} mb={16} flexWrap="wrap" ai="center">
          <Text fontSize={12} fontFamily="$display" color="$textMuted">Filtros:</Text>
          <FilterChip label={filterLabel} onRemove={onClearFilter} />
          <XStack
            px={8}
            py={4}
            borderRadius={16}
            cursor="pointer"
            hoverStyle={{ backgroundColor: '$secondary' }}
            onPress={onClearFilter}
          >
            <Text fontSize={12} fontFamily="$display" color="$danger">Limpar tudo</Text>
          </XStack>
        </XStack>
      )}
    </YStack>
  );
}
