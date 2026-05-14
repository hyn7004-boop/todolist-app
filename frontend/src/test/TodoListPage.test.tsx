import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodoListPage } from '../pages/TodoListPage';
import { useTodos } from '../hooks/useTodos';
import { useToastStore } from '../stores/toastStore';

const mockDeleteMutate = vi.fn();
const mockToggleMutate = vi.fn();

const defaultTodo = {
  todo_id: 'todo-1',
  title: '테스트 할일',
  description: null,
  category_id: 'cat-1',
  due_date: '2026-05-14',
  is_completed: false,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

vi.mock('../hooks/useTodos', () => ({
  useTodos: vi.fn(),
}));

vi.mock('../hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    data: [{ category_id: 'cat-1', name: '일반', is_default: true, created_at: '2026-01-01' }],
    isPending: false,
  })),
}));

vi.mock('../hooks/useDeleteTodo', () => ({
  useDeleteTodo: vi.fn(() => ({
    mutate: mockDeleteMutate,
    isPending: false,
  })),
}));

vi.mock('../hooks/useToggleTodo', () => ({
  useToggleTodo: vi.fn(() => ({
    mutate: mockToggleMutate,
    isPending: false,
  })),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <TodoListPage />
    </MemoryRouter>
  );
}

describe('TodoListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.setState({ toasts: [] });
    vi.mocked(useTodos).mockReturnValue({
      data: [defaultTodo],
      isPending: false,
      isError: false,
    } as ReturnType<typeof useTodos>);
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('할일 목록')).toBeInTheDocument();
  });

  it('renders "새 할일" button', () => {
    renderPage();
    expect(screen.getByText('새 할일')).toBeInTheDocument();
  });

  it('navigates to /todos/new when "새 할일" button clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText('새 할일'));
    expect(mockNavigate).toHaveBeenCalledWith('/todos/new');
  });

  it('renders todo items from useTodos', () => {
    renderPage();
    expect(screen.getByText('테스트 할일')).toBeInTheDocument();
  });

  it('renders filter component', () => {
    renderPage();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
  });

  it('shows delete modal when delete button clicked', () => {
    renderPage();
    fireEvent.click(screen.getByLabelText('삭제'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('이 할일을 삭제하시겠습니까? 복구할 수 없습니다.')).toBeInTheDocument();
  });

  it('hides modal when cancel button clicked', () => {
    renderPage();
    fireEvent.click(screen.getByLabelText('삭제'));
    fireEvent.click(screen.getByText('취소'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls delete mutate when modal confirm clicked', () => {
    renderPage();
    fireEvent.click(screen.getByLabelText('삭제'));
    fireEvent.click(screen.getByText('삭제', { selector: 'button' }));
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      'todo-1',
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it('shows success toast after successful delete', async () => {
    mockDeleteMutate.mockImplementationOnce((_id: string, callbacks: { onSuccess?: () => void }) => {
      callbacks?.onSuccess?.();
    });
    renderPage();
    fireEvent.click(screen.getByLabelText('삭제'));
    fireEvent.click(screen.getByText('삭제', { selector: 'button' }));
    await waitFor(() => {
      const toasts = useToastStore.getState().toasts;
      expect(toasts).toContainEqual(
        expect.objectContaining({ message: '할일이 삭제되었습니다.', type: 'success' })
      );
    });
  });

  it('shows error toast after failed delete', async () => {
    mockDeleteMutate.mockImplementationOnce((_id: string, callbacks: { onError?: () => void }) => {
      callbacks?.onError?.();
    });
    renderPage();
    fireEvent.click(screen.getByLabelText('삭제'));
    fireEvent.click(screen.getByText('삭제', { selector: 'button' }));
    await waitFor(() => {
      const toasts = useToastStore.getState().toasts;
      expect(toasts).toContainEqual(
        expect.objectContaining({ message: '삭제에 실패했습니다.', type: 'error' })
      );
    });
  });

  it('shows loading state when todos are loading', () => {
    vi.mocked(useTodos).mockReturnValueOnce({
      data: undefined,
      isPending: true,
      isError: false,
    } as ReturnType<typeof useTodos>);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no todos', () => {
    vi.mocked(useTodos).mockReturnValueOnce({
      data: [],
      isPending: false,
      isError: false,
    } as ReturnType<typeof useTodos>);
    renderPage();
    expect(screen.getByText('조건에 맞는 할일이 없습니다.')).toBeInTheDocument();
  });
});
