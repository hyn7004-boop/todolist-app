import { render, screen, fireEvent } from '@testing-library/react';
import { TodoForm } from '../components/todo/TodoForm';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    data: [
      { category_id: 'cat-1', name: '일반' },
      { category_id: 'cat-2', name: '업무' },
    ],
    isLoading: false,
  })),
}));

describe('TodoForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <TodoForm onSubmit={mockOnSubmit} submitButtonText="등록" />
      </MemoryRouter>
    );

    expect(screen.getByTestId('title-input')).toBeInTheDocument();
  });

  it('validates title', async () => {
    render(
      <MemoryRouter>
        <TodoForm onSubmit={mockOnSubmit} submitButtonText="등록" />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /등록/ });
    fireEvent.click(submitBtn);

    // findByText는 비동기로 요소를 기다립니다.
    const errorMsg = await screen.findByText(/제목을 입력/);
    expect(errorMsg).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits correctly', async () => {
    render(
      <MemoryRouter>
        <TodoForm onSubmit={mockOnSubmit} submitButtonText="등록" />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: '새 할일' } });
    fireEvent.click(screen.getByRole('button', { name: /등록/ }));

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: '새 할일'
    }));
  });
});
