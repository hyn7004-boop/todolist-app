import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '../components/layout/Header';
import { useAuthStore } from '../stores/authStore';

vi.mock('../api/authApi', () => ({
  logout: vi.fn().mockResolvedValue(null),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderHeader(onMenuClick = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Header onMenuClick={onMenuClick} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
  });

  it('renders app logo text', () => {
    renderHeader();
    expect(screen.getByText('TodoList')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderHeader();
    expect(screen.getByLabelText('로그아웃')).toBeInTheDocument();
  });

  it('renders menu button for mobile', () => {
    renderHeader();
    expect(screen.getByLabelText('메뉴 열기')).toBeInTheDocument();
  });

  it('calls onMenuClick when menu button clicked', () => {
    const onMenuClick = vi.fn();
    renderHeader(onMenuClick);
    fireEvent.click(screen.getByLabelText('메뉴 열기'));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('displays user name when logged in', () => {
    useAuthStore.setState({
      token: 'token',
      user: { user_id: '1', email: 'test@test.com', name: '홍길동' },
      isLoggedIn: true,
    });
    renderHeader();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });

  it('calls logout and navigate to /login on logout button click', async () => {
    const { logout: apiLogout } = await import('../api/authApi');
    useAuthStore.setState({
      token: 'token',
      user: { user_id: '1', email: 'test@test.com', name: '홍길동' },
      isLoggedIn: true,
    });
    renderHeader();
    fireEvent.click(screen.getByLabelText('로그아웃'));
    await waitFor(() => {
      expect(apiLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
