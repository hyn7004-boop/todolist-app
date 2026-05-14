import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryItem } from '../components/category/CategoryItem';
import { vi } from 'vitest';

describe('CategoryItem', () => {
  const mockCategory = {
    category_id: 'cat-1',
    name: '테스트 카테고리',
    is_default: false,
    created_at: '2026-05-13T10:00:00.000Z',
  };

  const mockDefaultCategory = {
    ...mockCategory,
    is_default: true,
  };

  const mockOnDelete = vi.fn();

  it('renders category name correctly', () => {
    render(<CategoryItem category={mockCategory} onDelete={mockOnDelete} isDeleting={false} />);
    expect(screen.getByText('테스트 카테고리')).toBeInTheDocument();
  });

  it('renders default badge for default category', () => {
    render(<CategoryItem category={mockDefaultCategory} onDelete={mockOnDelete} isDeleting={false} />);
    expect(screen.getByText('기본')).toBeInTheDocument();
  });

  it('disables delete button for default category', () => {
    render(<CategoryItem category={mockDefaultCategory} onDelete={mockOnDelete} isDeleting={false} />);
    const deleteBtn = screen.getByLabelText('삭제');
    expect(deleteBtn).toBeDisabled();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<CategoryItem category={mockCategory} onDelete={mockOnDelete} isDeleting={false} />);
    const deleteBtn = screen.getByLabelText('삭제');
    fireEvent.click(deleteBtn);
    expect(mockOnDelete).toHaveBeenCalledWith('cat-1');
  });

  it('shows loading state on delete button when isDeleting is true', () => {
    render(<CategoryItem category={mockCategory} onDelete={mockOnDelete} isDeleting={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument(); // LoadingSpinner
  });
});
