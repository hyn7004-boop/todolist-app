import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/common/Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>저장</Button>);
    expect(screen.getByText('저장')).toBeInTheDocument();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>확인</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-blue-600');
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">삭제</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-red-600');
  });

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">취소</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-transparent');
  });

  it('disables when disabled prop is true', () => {
    render(<Button disabled>버튼</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables when isLoading is true', () => {
    render(<Button isLoading>버튼</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when isLoading', () => {
    render(<Button isLoading>버튼</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('버튼')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has minimum touch target size classes', () => {
    render(<Button>버튼</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('min-h-[44px]');
    expect(btn.className).toContain('min-w-[44px]');
  });
});
