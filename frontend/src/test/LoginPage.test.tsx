import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../pages/LoginPage';
import { useAuthStore } from '../stores/authStore';

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
  });

  it('renders email and password fields', () => {
    renderPage();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
  });

  it('renders login button and signup link', () => {
    renderPage();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });

  it('shows email required error on empty submit', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('shows password required error on empty submit', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('calls login API with correct data', async () => {
    const { login } = await import('../api/authApi');
    vi.mocked(login).mockResolvedValue({
      token: 'token123',
      user: { user_id: '1', email: 'test@test.com', name: '홍길동' },
    });
    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password1' });
    });
  });

  it('stores token in Zustand and navigates to /todos on success', async () => {
    const { login } = await import('../api/authApi');
    vi.mocked(login).mockResolvedValue({
      token: 'token123',
      user: { user_id: '1', email: 'test@test.com', name: '홍길동' },
    });
    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
      expect(useAuthStore.getState().token).toBe('token123');
      expect(mockNavigate).toHaveBeenCalledWith('/todos', { replace: true });
    });
  });

  it('does not store token in localStorage', async () => {
    const { login } = await import('../api/authApi');
    vi.mocked(login).mockResolvedValue({
      token: 'token123',
      user: { user_id: '1', email: 'test@test.com', name: '홍길동' },
    });
    const getItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
    expect(getItemSpy).not.toHaveBeenCalledWith(expect.stringContaining('token'), expect.anything());
    getItemSpy.mockRestore();
  });

  it('shows form-level error on 401 response', async () => {
    const { login } = await import('../api/authApi');
    const error = Object.assign(new Error(), {
      isAxiosError: true,
      response: { status: 401 },
    });
    vi.mocked(login).mockRejectedValue(error);
    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'wrongpass1' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    });
  });

  it('shows signup success message from route state', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { signupSuccess: true } }]}>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('회원가입이 완료되었습니다. 로그인해주세요.')).toBeInTheDocument();
  });
});
