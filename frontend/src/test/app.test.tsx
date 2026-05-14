import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import { useAuthStore } from '../stores/authStore';

vi.mock('../api/authApi', () => ({
  logout: vi.fn().mockResolvedValue(null),
}));

vi.mock('../hooks/useTodos', () => ({
  useTodos: vi.fn(() => ({ data: [], isPending: false, isError: false })),
}));

vi.mock('../hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({ data: [], isPending: false })),
}));

vi.mock('../hooks/useDeleteTodo', () => ({
  useDeleteTodo: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('../hooks/useToggleTodo', () => ({
  useToggleTodo: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

function renderApp() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

describe('App', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
  });

  it('renders without crashing', () => {
    renderApp();
    expect(document.body).toBeTruthy();
  });

  it('renders login route content', () => {
    window.history.pushState({}, '', '/login');
    renderApp();
    expect(screen.getByText('로그인 계정으로 접속합니다')).toBeInTheDocument();
  });

  it('renders signup route content', () => {
    window.history.pushState({}, '', '/signup');
    renderApp();
    expect(screen.getByText('새 계정을 만들어 시작하세요')).toBeInTheDocument();
  });

  it('redirects to /login when accessing protected route unauthenticated', () => {
    window.history.pushState({}, '', '/todos');
    renderApp();
    expect(screen.getByText('로그인 계정으로 접속합니다')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '할일 목록' })).not.toBeInTheDocument();
  });

  it('renders protected route content when authenticated', () => {
    useAuthStore.setState({
      token: 'test-token',
      user: { user_id: '1', email: 'test@test.com', name: '테스터' },
      isLoggedIn: true,
    });
    window.history.pushState({}, '', '/todos');
    renderApp();
    expect(screen.getByRole('heading', { name: '할일 목록' })).toBeInTheDocument();
  });

  it('redirects from / to /todos when authenticated', () => {
    useAuthStore.setState({
      token: 'test-token',
      user: { user_id: '1', email: 'test@test.com', name: '테스터' },
      isLoggedIn: true,
    });
    window.history.pushState({}, '', '/');
    renderApp();
    expect(screen.getByRole('heading', { name: '할일 목록' })).toBeInTheDocument();
  });
});
