import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TodoCreatePage from '../pages/TodoCreatePage';
import TodoEditPage from '../pages/TodoEditPage';
import { vi } from 'vitest';

// Mocks
const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../hooks/useCreateTodo', () => ({
  useCreateTodo: vi.fn(() => ({
    mutate: mockCreateMutate,
    isPending: false,
  })),
}));

vi.mock('../hooks/useUpdateTodo', () => ({
  useUpdateTodo: vi.fn(() => ({
    mutate: mockUpdateMutate,
    isPending: false,
  })),
}));

vi.mock('../hooks/useTodo', () => ({
  useTodo: vi.fn((id: string) => ({
    data: id === 'todo-1' ? {
      todo_id: 'todo-1',
      title: '기존 할일',
      category_id: 'cat-1',
      due_date: '2026-05-20',
      is_completed: false,
    } : undefined,
    isLoading: false,
    isError: id === 'not-found',
  })),
}));

vi.mock('../hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    data: [{ category_id: 'cat-1', name: '일반' }],
    isLoading: false,
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TodoPages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TodoCreatePage', () => {
    it('submits and navigates on success', async () => {
      mockCreateMutate.mockImplementation((data, options) => {
        options.onSuccess();
      });

      render(
        <MemoryRouter>
          <TodoCreatePage />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByTestId('title-input'), { target: { value: '새 할일' } });
      fireEvent.click(screen.getByRole('button', { name: /등록/ }));

      expect(mockCreateMutate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/todos');
    });
  });

  describe('TodoEditPage', () => {
    it('loads and pre-fills data', async () => {
      render(
        <MemoryRouter initialEntries={['/todos/todo-1/edit']}>
          <Routes>
            <Route path="/todos/:id/edit" element={<TodoEditPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByDisplayValue('기존 할일')).toBeInTheDocument();
    });

    it('submits and navigates on update success', async () => {
      mockUpdateMutate.mockImplementation((data, options) => {
        options.onSuccess();
      });

      render(
        <MemoryRouter initialEntries={['/todos/todo-1/edit']}>
          <Routes>
            <Route path="/todos/:id/edit" element={<TodoEditPage />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.change(await screen.findByTestId('title-input'), { target: { value: '수정된 할일' } });
      fireEvent.click(screen.getByRole('button', { name: /수정/ }));

      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ todoId: 'todo-1' }),
        expect.anything()
      );
      expect(mockNavigate).toHaveBeenCalledWith('/todos');
    });

    it('navigates to list on error', async () => {
      // Mock alert to avoid window not defined or similar errors in JSDOM
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={['/todos/not-found/edit']}>
          <Routes>
            <Route path="/todos/:id/edit" element={<TodoEditPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/todos');
      });
      alertMock.mockRestore();
    });
  });
});
