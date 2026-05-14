import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SignupPage } from '../pages/SignupPage';

vi.mock('../api/authApi', () => ({
  signup: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

async function fillAndSubmit(
  email: string,
  password: string,
  name: string
) {
  fireEvent.change(screen.getByLabelText('이메일'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('이름'), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
}

function renderPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  );
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields', () => {
    renderPage();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
  });

  it('renders signup button and login link', () => {
    renderPage();
    expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument();
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('shows email required error on empty submit', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('shows email format error on invalid email', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('shows password required error when empty', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('shows password policy error when password too short', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'ab1' } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText(/최소 8자/)).toBeInTheDocument();
    });
  });

  it('shows password policy error when no number', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'abcdefgh' } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText(/최소 8자/)).toBeInTheDocument();
    });
  });

  it('shows password policy error when no letter', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText(/최소 8자/)).toBeInTheDocument();
    });
  });

  it('shows name required error when empty', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText('이름을 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('shows name length error when name exceeds 50 chars', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: 'a'.repeat(51) } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText(/최대 50자/)).toBeInTheDocument();
    });
  });

  it('calls signup API with correct data on valid form submit', async () => {
    const { signup } = await import('../api/authApi');
    vi.mocked(signup).mockResolvedValue({
      user_id: '1',
      email: 'test@test.com',
      name: '홍길동',
      created_at: '2026-01-01',
    });
    renderPage();
    await fillAndSubmit('test@test.com', 'password1', '홍길동');
    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password1',
        name: '홍길동',
      });
    });
  });

  it('navigates to /login on success', async () => {
    const { signup } = await import('../api/authApi');
    vi.mocked(signup).mockResolvedValue({
      user_id: '1',
      email: 'test@test.com',
      name: '홍길동',
      created_at: '2026-01-01',
    });
    renderPage();
    await fillAndSubmit('test@test.com', 'password1', '홍길동');
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', expect.objectContaining({ state: expect.objectContaining({ signupSuccess: true }) }));
    });
  });

  it('shows email inline error on 409 response', async () => {
    const { signup } = await import('../api/authApi');
    const error = Object.assign(new Error(), {
      isAxiosError: true,
      response: { status: 409 },
    });
    vi.mocked(signup).mockRejectedValue(error);
    renderPage();
    await fillAndSubmit('test@test.com', 'password1', '홍길동');
    await waitFor(() => {
      expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
    });
  });

  it('shows password inline error on 400 response', async () => {
    const { signup } = await import('../api/authApi');
    const error = Object.assign(new Error(), {
      isAxiosError: true,
      response: { status: 400 },
    });
    vi.mocked(signup).mockRejectedValue(error);
    renderPage();
    await fillAndSubmit('test@test.com', 'password1', '홍길동');
    await waitFor(() => {
      expect(screen.getByText(/최소 8자/)).toBeInTheDocument();
    });
  });
});
