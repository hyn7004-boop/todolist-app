import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryPage from '../pages/CategoryPage';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import { useToastStore } from '../stores/toastStore';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../hooks/useCategories', () => ({
  useCategories: vi.fn(),
}));

vi.mock('../hooks/useCreateCategory', () => ({
  useCreateCategory: vi.fn(),
}));

vi.mock('../hooks/useDeleteCategory', () => ({
  useDeleteCategory: vi.fn(),
}));

describe('CategoryPage', () => {
  const mockCategories = [
    { category_id: 'cat-1', name: '일반', is_default: true },
    { category_id: 'cat-2', name: '업무', is_default: true },
    { category_id: 'cat-3', name: '개인', is_default: true },
    { category_id: 'cat-4', name: '사용자 정의', is_default: false },
  ];

  const mockCreateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.setState({ toasts: [] });
    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    } as any);
    vi.mocked(useCreateCategory).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as any);
    vi.mocked(useDeleteCategory).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <CategoryPage />
      </MemoryRouter>
    );
    expect(screen.getByText('카테고리 관리')).toBeInTheDocument();
    expect(screen.getByText('사용자 정의')).toBeInTheDocument();
  });

  it('shows loading state when fetching categories', () => {
    vi.mocked(useCategories).mockReturnValue({
      isLoading: true,
    } as any);
    render(
      <MemoryRouter>
        <CategoryPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('status')).toBeInTheDocument(); // LoadingSpinner
  });

  it('calls create mutation when form is submitted', () => {
    render(
      <MemoryRouter>
        <CategoryPage />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText('카테고리 이름을 입력하세요');
    fireEvent.change(input, { target: { value: '새 카테고리' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(mockCreateMutate).toHaveBeenCalledWith('새 카테고리', expect.anything());
  });

  it('calls delete mutation when delete button is clicked', () => {
    render(
      <MemoryRouter>
        <CategoryPage />
      </MemoryRouter>
    );
    const deleteBtns = screen.getAllByLabelText('삭제');
    // The first 3 are default and disabled, the 4th one is active
    fireEvent.click(deleteBtns[3]);

    expect(mockDeleteMutate).toHaveBeenCalledWith('cat-4', expect.anything());
  });

  it('shows toast error when deletion fails with CATEGORY_HAS_TODOS', async () => {
    mockDeleteMutate.mockImplementation((_id, options) => {
      options.onError({
        response: {
          data: {
            error: { code: 'CATEGORY_HAS_TODOS', message: '할일이 등록된 카테고리는 삭제할 수 없습니다.' }
          }
        }
      });
    });

    render(
      <MemoryRouter>
        <CategoryPage />
      </MemoryRouter>
    );
    const deleteBtns = screen.getAllByLabelText('삭제');
    fireEvent.click(deleteBtns[3]);

    await waitFor(() => {
      const toasts = useToastStore.getState().toasts;
      expect(toasts).toContainEqual(
        expect.objectContaining({ message: '할일이 등록된 카테고리는 삭제할 수 없습니다.', type: 'error' })
      );
    });
  });
});
