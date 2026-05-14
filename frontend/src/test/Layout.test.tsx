import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '../components/layout/Layout';
import { useAuthStore } from '../stores/authStore';

vi.mock('../api/authApi', () => ({
  logout: vi.fn().mockResolvedValue(null),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLayout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
  });

  it('renders header', () => {
    renderLayout();
    expect(screen.getByText('TodoList')).toBeInTheDocument();
  });

  it('renders navigation links in sidebar', () => {
    renderLayout();
    expect(screen.getByText('할일 목록')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    const { container } = renderLayout();
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('toggles sidebar open when menu button clicked', () => {
    renderLayout();
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('메뉴 열기'));
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
  });

  it('closes sidebar when overlay is clicked', () => {
    renderLayout();
    fireEvent.click(screen.getByLabelText('메뉴 열기'));
    const overlay = screen.getByTestId('sidebar-overlay');
    fireEvent.click(overlay);
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
  });
});
