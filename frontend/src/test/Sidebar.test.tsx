import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import type { Category } from '../types/category.types';

const mockCategories: Category[] = [
  { category_id: '1', name: '일반', is_default: true, created_at: '2026-01-01' },
  { category_id: '2', name: '업무', is_default: true, created_at: '2026-01-01' },
  { category_id: '3', name: '개인', is_default: true, created_at: '2026-01-01' },
];

function renderSidebar(props: Partial<Parameters<typeof Sidebar>[0]> = {}) {
  return render(
    <MemoryRouter>
      <Sidebar isOpen={true} onClose={vi.fn()} {...props} />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('renders navigation links', () => {
    renderSidebar();
    expect(screen.getByText('할일 목록')).toBeInTheDocument();
    expect(screen.getByText('카테고리 관리')).toBeInTheDocument();
    expect(screen.getByText('내 정보')).toBeInTheDocument();
  });

  it('renders category list when categories provided', () => {
    renderSidebar({ categories: mockCategories });
    expect(screen.getByText('일반')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
    expect(screen.getByText('개인')).toBeInTheDocument();
  });

  it('does not render category section when categories is empty', () => {
    renderSidebar({ categories: [] });
    expect(screen.queryByText('일반')).not.toBeInTheDocument();
  });

  it('renders category color dots', () => {
    renderSidebar({ categories: mockCategories });
    const dots = screen.getAllByTestId('category-dot');
    expect(dots.length).toBe(mockCategories.length);
  });

  it('applies first category color to first category', () => {
    renderSidebar({ categories: mockCategories });
    const firstDot = screen.getAllByTestId('category-dot')[0];
    expect(firstDot).toHaveStyle({ backgroundColor: '#2563EB' });
  });

  it('calls onClose when overlay is clicked (when isOpen)', () => {
    const onClose = vi.fn();
    renderSidebar({ isOpen: true, onClose });
    const overlay = screen.getByTestId('sidebar-overlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render overlay when isOpen is false', () => {
    renderSidebar({ isOpen: false });
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
  });

  it('links to correct routes', () => {
    renderSidebar();
    const todoLink = screen.getByText('할일 목록').closest('a');
    const categoryLink = screen.getByText('카테고리 관리').closest('a');
    const settingsLink = screen.getByText('내 정보').closest('a');
    expect(todoLink).toHaveAttribute('href', '/todos');
    expect(categoryLink).toHaveAttribute('href', '/categories');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('calls onClose when a nav link is clicked', () => {
    const onClose = vi.fn();
    renderSidebar({ onClose });
    fireEvent.click(screen.getByText('할일 목록'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
