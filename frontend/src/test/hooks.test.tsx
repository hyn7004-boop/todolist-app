import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTodos } from '../hooks/useTodos';
import { useCreateTodo } from '../hooks/useCreateTodo';
import { useUpdateTodo } from '../hooks/useUpdateTodo';
import { useDeleteTodo } from '../hooks/useDeleteTodo';
import { useToggleTodo } from '../hooks/useToggleTodo';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useDeleteCategory } from '../hooks/useDeleteCategory';

vi.mock('../api/todoApi', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  toggleTodo: vi.fn(),
}));

vi.mock('../api/categoryApi', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

const mockTodo = {
  todo_id: '1',
  title: '테스트 할일',
  description: null,
  category_id: 'cat-1',
  due_date: '2026-05-14',
  is_completed: false,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const mockCategory = {
  category_id: 'cat-1',
  name: '일반',
  is_default: true,
  created_at: '2026-01-01',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// ─── useTodos ───────────────────────────────────────────────────────────────

describe('useTodos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches todos successfully', async () => {
    const { getTodos } = await import('../api/todoApi');
    vi.mocked(getTodos).mockResolvedValue([mockTodo]);

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockTodo]);
  });

  it('passes filters to getTodos', async () => {
    const { getTodos } = await import('../api/todoApi');
    vi.mocked(getTodos).mockResolvedValue([]);

    const filters = { category_id: 'cat-1', is_completed: false };
    renderHook(() => useTodos(filters), { wrapper: createWrapper() });

    await waitFor(() => expect(getTodos).toHaveBeenCalledWith(filters));
  });

  it('exposes isPending while fetching', async () => {
    const { getTodos } = await import('../api/todoApi');
    vi.mocked(getTodos).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });
    expect(result.current.isPending).toBe(true);
  });

  it('exposes error on failure', async () => {
    const { getTodos } = await import('../api/todoApi');
    vi.mocked(getTodos).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

// ─── useCreateTodo ──────────────────────────────────────────────────────────

describe('useCreateTodo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls createTodo and returns created todo', async () => {
    const { createTodo } = await import('../api/todoApi');
    vi.mocked(createTodo).mockResolvedValue(mockTodo);

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        title: '테스트 할일',
        category_id: 'cat-1',
        due_date: '2026-05-14',
      });
    });

    expect(createTodo).toHaveBeenCalledWith({
      title: '테스트 할일',
      category_id: 'cat-1',
      due_date: '2026-05-14',
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('invalidates todos query on success', async () => {
    const { createTodo } = await import('../api/todoApi');
    vi.mocked(createTodo).mockResolvedValue(mockTodo);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateTodo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        title: '테스트',
        category_id: 'cat-1',
        due_date: '2026-05-14',
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });

  it('exposes isPending during mutation', async () => {
    const { createTodo } = await import('../api/todoApi');
    vi.mocked(createTodo).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() });

    result.current.mutate({ title: '테스트', category_id: 'c', due_date: '2026-05-14' });

    await waitFor(() => expect(result.current.isPending).toBe(true));
  });
});

// ─── useUpdateTodo ──────────────────────────────────────────────────────────

describe('useUpdateTodo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls updateTodo with correct arguments', async () => {
    const { updateTodo } = await import('../api/todoApi');
    vi.mocked(updateTodo).mockResolvedValue({ ...mockTodo, title: '수정됨' });

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ todoId: '1', data: { title: '수정됨' } });
    });

    expect(updateTodo).toHaveBeenCalledWith('1', { title: '수정됨' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('invalidates todos query on success', async () => {
    const { updateTodo } = await import('../api/todoApi');
    vi.mocked(updateTodo).mockResolvedValue(mockTodo);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateTodo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ todoId: '1', data: { title: '수정' } });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });

  it('exposes error on failure', async () => {
    const { updateTodo } = await import('../api/todoApi');
    vi.mocked(updateTodo).mockRejectedValue(new Error('update failed'));

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ todoId: '1', data: { title: '수정' } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

// ─── useDeleteTodo ──────────────────────────────────────────────────────────

describe('useDeleteTodo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls deleteTodo with correct todoId', async () => {
    const { deleteTodo } = await import('../api/todoApi');
    vi.mocked(deleteTodo).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTodo(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync('todo-id-1');
    });

    expect(deleteTodo).toHaveBeenCalledWith('todo-id-1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('invalidates todos query on success', async () => {
    const { deleteTodo } = await import('../api/todoApi');
    vi.mocked(deleteTodo).mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteTodo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('todo-1');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });
});

// ─── useToggleTodo ──────────────────────────────────────────────────────────

describe('useToggleTodo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls toggleTodo with correct todoId', async () => {
    const { toggleTodo } = await import('../api/todoApi');
    vi.mocked(toggleTodo).mockResolvedValue({
      todo_id: '1',
      is_completed: true,
      updated_at: '2026-05-14',
    });

    const { result } = renderHook(() => useToggleTodo(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync('todo-id-1');
    });

    expect(toggleTodo).toHaveBeenCalledWith('todo-id-1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('invalidates todos query on success', async () => {
    const { toggleTodo } = await import('../api/todoApi');
    vi.mocked(toggleTodo).mockResolvedValue({
      todo_id: '1',
      is_completed: true,
      updated_at: '2026-05-14',
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useToggleTodo(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('todo-1');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });
});

// ─── useCategories ───────────────────────────────────────────────────────────

describe('useCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches categories successfully', async () => {
    const { getCategories } = await import('../api/categoryApi');
    vi.mocked(getCategories).mockResolvedValue([mockCategory]);

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockCategory]);
  });

  it('exposes error on failure', async () => {
    const { getCategories } = await import('../api/categoryApi');
    vi.mocked(getCategories).mockRejectedValue(new Error('fetch failed'));

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

// ─── useCreateCategory ───────────────────────────────────────────────────────

describe('useCreateCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls createCategory with correct name', async () => {
    const { createCategory } = await import('../api/categoryApi');
    vi.mocked(createCategory).mockResolvedValue(mockCategory);

    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync('공부');
    });

    expect(createCategory).toHaveBeenCalledWith('공부');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('invalidates categories query on success', async () => {
    const { createCategory } = await import('../api/categoryApi');
    vi.mocked(createCategory).mockResolvedValue(mockCategory);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateCategory(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('공부');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });

  it('exposes error on failure', async () => {
    const { createCategory } = await import('../api/categoryApi');
    vi.mocked(createCategory).mockRejectedValue(new Error('create failed'));

    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('공부');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

// ─── useDeleteCategory ───────────────────────────────────────────────────────

describe('useDeleteCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls deleteCategory with correct categoryId', async () => {
    const { deleteCategory } = await import('../api/categoryApi');
    vi.mocked(deleteCategory).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync('cat-1');
    });

    expect(deleteCategory).toHaveBeenCalledWith('cat-1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('invalidates categories query on success', async () => {
    const { deleteCategory } = await import('../api/categoryApi');
    vi.mocked(deleteCategory).mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteCategory(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('cat-1');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });

  it('exposes error on failure', async () => {
    const { deleteCategory } = await import('../api/categoryApi');
    vi.mocked(deleteCategory).mockRejectedValue(new Error('delete failed'));

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('cat-1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
