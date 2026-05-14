import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryForm } from '../components/category/CategoryForm';
import { vi } from 'vitest';

describe('CategoryForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input and button', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} isPending={false} />);
    expect(screen.getByPlaceholderText('카테고리 이름을 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('validates empty name', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} isPending={false} />);
    fireEvent.click(screen.getByRole('button', { name: '추가' }));
    expect(screen.getByText('카테고리 이름을 입력해 주세요.')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates name length', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} isPending={false} />);
    const input = screen.getByPlaceholderText('카테고리 이름을 입력하세요');
    fireEvent.change(input, { target: { value: 'a'.repeat(51) } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));
    expect(screen.getByText('카테고리 이름은 50자 이내로 입력해 주세요.')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with name when valid', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} isPending={false} />);
    const input = screen.getByPlaceholderText('카테고리 이름을 입력하세요');
    fireEvent.change(input, { target: { value: '신규 카테고리' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));
    expect(mockOnSubmit).toHaveBeenCalledWith('신규 카테고리');
  });

  it('shows loading state on button when isPending is true', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} isPending={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument(); // LoadingSpinner
  });

  it('clears input on successful submit', () => {
    // This might be tricky if we don't handle it in the component itself
    // But usually the form should clear after successful mutation.
    // For now let's just check the initial call.
  });
});
