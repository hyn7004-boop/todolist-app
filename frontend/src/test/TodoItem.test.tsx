import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodoItem } from '../components/todo/TodoItem';
import type { Todo } from '../types/todo.types';
import type { Category } from '../types/category.types';

const mockToggleMutate = vi.fn();
vi.mock('../hooks/useToggleTodo', () => ({
  useToggleTodo: () => ({
    mutate: mockToggleMutate,
    isPending: false,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockTodo: Todo = {
  todo_id: 'todo-1',
  title: '테스트 할일',
  description: null,
  category_id: 'cat-1',
  due_date: '2026-05-14',
  is_completed: false,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const mockCategories: Category[] = [
  { category_id: 'cat-1', name: '일반', is_default: true, created_at: '2026-01-01' },
  { category_id: 'cat-2', name: '업무', is_default: true, created_at: '2026-01-01' },
];

function renderItem(todo = mockTodo, onDelete = vi.fn()) {
  return render(
    <MemoryRouter>
      <TodoItem todo={todo} categories={mockCategories} onDelete={onDelete} />
    </MemoryRouter>
  );
}

describe('TodoItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo title', () => {
    renderItem();
    expect(screen.getByText('테스트 할일')).toBeInTheDocument();
  });

  it('renders due date', () => {
    renderItem();
    expect(screen.getByText('2026-05-14')).toBeInTheDocument();
  });

  it('renders category name badge', () => {
    renderItem();
    expect(screen.getByText('일반')).toBeInTheDocument();
  });

  it('renders unchecked checkbox when not completed', () => {
    renderItem();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders checked checkbox when completed', () => {
    renderItem({ ...mockTodo, is_completed: true });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('applies line-through style when completed', () => {
    renderItem({ ...mockTodo, is_completed: true });
    const title = screen.getByText('테스트 할일');
    expect(title).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('does not apply line-through when not completed', () => {
    renderItem({ ...mockTodo, is_completed: false });
    const title = screen.getByText('테스트 할일');
    expect(title).not.toHaveStyle({ textDecoration: 'line-through' });
  });

  it('calls toggle when checkbox clicked', () => {
    renderItem();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockToggleMutate).toHaveBeenCalledWith('todo-1', expect.anything());
  });

  it('immediately toggles checkbox visually on click', () => {
    renderItem({ ...mockTodo, is_completed: false });
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('navigates to edit page when edit button clicked', () => {
    renderItem();
    fireEvent.click(screen.getByLabelText('수정'));
    expect(mockNavigate).toHaveBeenCalledWith('/todos/todo-1/edit');
  });

  it('calls onDelete with todoId when delete button clicked', () => {
    const onDelete = vi.fn();
    renderItem(mockTodo, onDelete);
    fireEvent.click(screen.getByLabelText('삭제'));
    expect(onDelete).toHaveBeenCalledWith('todo-1');
  });

  it('renders edit and delete buttons', () => {
    renderItem();
    expect(screen.getByLabelText('수정')).toBeInTheDocument();
    expect(screen.getByLabelText('삭제')).toBeInTheDocument();
  });
});
