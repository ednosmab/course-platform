import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock do Next.js Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/cursos',
}));

// Mock do BrandMark
vi.mock('../../components/brand-mark', () => ({
  BrandMark: () => <div data-testid="brand-mark" />,
}));

// Mock dos serviços do core
vi.mock('@projeto/core', () => {
  return {
    CourseService: {
      getAllCourses: vi.fn(),
      createCourse: vi.fn(),
      deleteCourse: vi.fn(),
      updateCourse: vi.fn(),
      reorderCoursesForStudent: vi.fn(),
    },
    StorageService: {
      uploadThumbnail: vi.fn(),
    },
    AuthService: {
      getCurrentProfile: vi.fn().mockResolvedValue({
        full_name: 'Admin Teste',
        email: 'admin@teste.com',
      }),
    },
  };
});

// Mock do Tamagui e componentes UI do monorepo
vi.mock('@projeto/ui', () => {
  return {
    YStack: ({ children, onPress, ...props }: any) => {
      const dataProps: Record<string, any> = {};
      if (onPress) dataProps.onClick = onPress;
      return <div data-testid="YStack" {...dataProps} {...props}>{children}</div>;
    },
    XStack: ({ children, onPress, ...props }: any) => {
      const dataProps: Record<string, any> = {};
      if (onPress) dataProps.onClick = onPress;
      return <div data-testid="XStack" {...dataProps} {...props}>{children}</div>;
    },
    Text: ({ children, ...props }: any) => {
      return <span data-testid="Text" {...props}>{children}</span>;
    },
    Icon: ({ name }: any) => <span data-testid={`icon-${name}`} />,
    Theme: ({ children }: any) => <>{children}</>,
    Button: ({ children, onPress, ...props }: any) => {
      return <button onClick={onPress} {...props}>{children}</button>;
    },
    Card: ({ children, onPress, ...props }: any) => {
      return <div data-testid="Card" onClick={onPress} {...props}>{children}</div>;
    },
    Spinner: () => <div data-testid="Spinner" />,
    ProgressBar: ({ progress }: any) => <div data-testid="ProgressBar" data-progress={progress} />,
    Input: ({ value, onChangeText, ...props }: any) => {
      return (
        <input
          data-testid="Input"
          value={value}
          onChange={(e) => onChangeText?.(e.target.value)}
          {...props}
        />
      );
    },
    FilterBar: ({ filterOptions, filterValue, onFilterChange, sortOptions, sortValue, onSortChange, resultCount, resultLabel, filterLabel, onClearFilter }: any) => (
      <div data-testid="FilterBar">
        <select data-testid="filter-select" value={filterValue} onChange={(e) => onFilterChange(e.target.value)}>
          {filterOptions.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select data-testid="sort-select" value={sortValue} onChange={(e) => onSortChange(e.target.value)}>
          {sortOptions.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span data-testid="result-count">{resultCount} {resultLabel}</span>
        {filterLabel && <span data-testid="filter-label">{filterLabel}</span>}
        {filterLabel && <button data-testid="clear-filter" onClick={onClearFilter}>Limpar tudo</button>}
      </div>
    ),
    lineHeightHeading: '1.2',
    lineHeightCardTitle: '1.4',
    color: {
      cwGradientFrom: '#3B82F6',
      cwGradientTo: '#7C3AED',
    },
  };
});

import { CourseService } from '@projeto/core';
import CursosPage from './page';

const mockCourses = [
  {
    id: 'course-1',
    title: 'Desenvolvimento Web Moderno',
    description: 'Aprenda Next.js e React.',
    is_published: true,
    order_index: 0,
    student_order_index: 0,
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T11:00:00Z',
    thumbnail_url: null,
  },
  {
    id: 'course-2',
    title: 'Liderança e Gestão Ágil',
    description: 'Gestão de times de tecnologia.',
    is_published: false,
    order_index: 1,
    student_order_index: 1,
    created_at: '2026-06-02T10:00:00Z',
    updated_at: '2026-06-02T10:00:00Z',
    thumbnail_url: null,
  },
  {
    id: 'course-3',
    title: 'Introdução ao Design de Interfaces UX/UI',
    description: 'Design centrado no usuário.',
    is_published: true,
    order_index: 2,
    student_order_index: 2,
    created_at: '2026-06-03T10:00:00Z',
    updated_at: '2026-06-03T10:00:00Z',
    thumbnail_url: null,
  },
  {
    id: 'course-4',
    title: 'Lógica de Programação Básica',
    description: 'Algoritmos fundamentais.',
    is_published: false,
    order_index: 3,
    student_order_index: 3,
    created_at: '2026-06-04T10:00:00Z',
    updated_at: '2026-06-04T10:00:00Z',
    thumbnail_url: null,
  },
];

describe('CursosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (CourseService.getAllCourses as any).mockResolvedValue(mockCourses);
  });

  it('renders correctly and lists courses by category', async () => {
    render(<CursosPage />);

    // Espera carregar os cursos
    await waitFor(() => {
      expect(screen.queryByTestId('Spinner')).toBeNull();
    });

    // Categoria Tecnologia: "Desenvolvimento Web Moderno" & "Lógica de Programação Básica"
    expect(screen.getByText('Tecnologia')).toBeTruthy();
    expect(screen.getByText('Desenvolvimento Web Moderno')).toBeTruthy();
    expect(screen.getByText('Lógica de Programação Básica')).toBeTruthy();

    // Categoria Liderança: "Liderança e Gestão Ágil"
    expect(screen.getByText('Liderança')).toBeTruthy();
    expect(screen.getByText('Liderança e Gestão Ágil')).toBeTruthy();

    // Categoria Design: "Introdução ao Design de Interfaces UX/UI"
    expect(screen.getByText('Design')).toBeTruthy();
    expect(screen.getByText('Introdução ao Design de Interfaces UX/UI')).toBeTruthy();
  });

  it('sorts courses correctly: custom order by order_index', async () => {
    render(<CursosPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('Spinner')).toBeNull();
    });

    // Na categoria Tecnologia:
    // "Desenvolvimento Web Moderno" (order_index=0) deve vir antes de
    // "Lógica de Programação Básica" (order_index=3)
    const techCourses = screen.getAllByText(/Lógica de Programação Básica|Desenvolvimento Web Moderno/);
    expect(techCourses[0].textContent).toBe('Desenvolvimento Web Moderno');
    expect(techCourses[1].textContent).toBe('Lógica de Programação Básica');
  });

  it('filters courses correctly using the search query input', async () => {
    render(<CursosPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('Spinner')).toBeNull();
    });

    const searchInput = screen.getByPlaceholderText('Buscar cursos por título…');
    fireEvent.change(searchInput, { target: { value: 'Design' } });

    // Apenas Design deve aparecer
    expect(screen.getByText('Introdução ao Design de Interfaces UX/UI')).toBeTruthy();
    expect(screen.queryByText('Desenvolvimento Web Moderno')).toBeNull();
    expect(screen.queryByText('Liderança e Gestão Ágil')).toBeNull();
  });

  it('opens and closes the create course modal', async () => {
    render(<CursosPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('Spinner')).toBeNull();
    });

    // Clica no botão "Novo curso"
    const newCourseButton = screen.getByText('Novo curso');
    fireEvent.click(newCourseButton);

    // O modal deve estar aberto
    expect(screen.getByText('Criar Curso')).toBeTruthy();

    // Clica no botão "X" para fechar
    const closeButton = screen.getByTestId('icon-X').parentElement;
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    // Modal deve ser removido
    expect(screen.queryByText('Criar Curso')).toBeNull();
  });
});
