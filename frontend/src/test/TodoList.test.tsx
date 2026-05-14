import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodoList } from '../components/todo/TodoList';
import type { Todo } from '../types/todo.types';
import type { Category } from '../types/category.types';

vi.mock('../hooks/useToggleTodo', () => ({
  useToggleTodo: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

const mockTodos: Todo[] = [
  {
    todo_id: '1',
    title: '첫번째 할일',
    description: null,
    category_id: 'cat-1',
    due_date: '2026-05-14',
    is_completed: false,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    todo_id: '2',
    title: '두번째 할일',
    description: null,
    category_id: 'cat-1',
    due_date: '2026-05-15',
    is_completed: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

const mockCategories: Category[] = [
  { category_id: 'cat-1', name: '일반', is_default: true, created_at: '2026-01-01' },
];

function renderList(
  todos: Todo[],
  isLoading = false,
  onDelete = vi.fn()
) {
  return render(
    <MemoryRouter>
      <TodoList
        todos={todos}
        categories={mockCategories}
        isLoading={isLoading}
        onDelete={onDelete}
      />
    </MemoryRouter>
  );
}

describe('TodoList', () => {
  it('shows LoadingSpinner when isLoading is true', () => {
    renderList([], true);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not render spinner when not loading', () => {
    renderList(mockTodos, false);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows empty state message when todos is empty', () => {
    renderList([], false);
    expect(screen.getByText('조건에 맞는 할일이 없습니다.')).toBeInTheDocument();
  });

  it('does not show empty message when todos exist', () => {
    renderList(mockTodos, false);
    expect(screen.queryByText('조건에 맞는 할일이 없습니다.')).not.toBeInTheDocument();
  });

  it('renders all todo items', () => {
    renderList(mockTodos, false);
    expect(screen.getByText('첫번째 할일')).toBeInTheDocument();
    expect(screen.getByText('두번째 할일')).toBeInTheDocument();
  });

  it('renders correct number of todo items', () => {
    renderList(mockTodos, false);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });
});
