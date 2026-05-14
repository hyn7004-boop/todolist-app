import { render, screen, act } from '@testing-library/react';
import { Toast } from '../components/common/Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the message', () => {
    render(<Toast message="저장되었습니다" onClose={vi.fn()} />);
    expect(screen.getByText('저장되었습니다')).toBeInTheDocument();
  });

  it('has role alert', () => {
    render(<Toast message="알림" onClose={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onClose after default duration (3000ms)', () => {
    const onClose = vi.fn();
    render(<Toast message="알림" onClose={onClose} />);
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after custom duration', () => {
    const onClose = vi.fn();
    render(<Toast message="알림" onClose={onClose} duration={1500} />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(500); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies success style', () => {
    render(<Toast message="성공" type="success" onClose={vi.fn()} />);
    const el = screen.getByRole('alert');
    expect(el).toHaveStyle({ background: '#F0FDF4' });
  });

  it('applies error style', () => {
    render(<Toast message="오류" type="error" onClose={vi.fn()} />);
    const el = screen.getByRole('alert');
    expect(el).toHaveStyle({ background: '#FEF2F2' });
  });

  it('applies warning style', () => {
    render(<Toast message="경고" type="warning" onClose={vi.fn()} />);
    const el = screen.getByRole('alert');
    expect(el).toHaveStyle({ background: '#FFFBEB' });
  });

  it('applies info style by default', () => {
    render(<Toast message="정보" onClose={vi.fn()} />);
    const el = screen.getByRole('alert');
    expect(el).toHaveStyle({ background: '#EFF6FF' });
  });

  it('cleans up timer on unmount', () => {
    const onClose = vi.fn();
    const { unmount } = render(<Toast message="알림" onClose={onClose} />);
    unmount();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onClose).not.toHaveBeenCalled();
  });
});
