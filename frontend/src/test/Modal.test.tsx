import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../components/common/Modal';

const defaultProps = {
  isOpen: true,
  message: '정말 삭제하시겠습니까?',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays the message', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} title="삭제 확인" />);
    expect(screen.getByText('삭제 확인')).toBeInTheDocument();
  });

  it('does not render title element when not provided', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('shows default confirm and cancel labels', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('확인')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('shows custom confirm and cancel labels', () => {
    render(<Modal {...defaultProps} confirmLabel="삭제" cancelLabel="돌아가기" />);
    expect(screen.getByText('삭제')).toBeInTheDocument();
    expect(screen.getByText('돌아가기')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<Modal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('확인'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<Modal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when overlay is clicked', () => {
    const onCancel = vi.fn();
    render(<Modal {...defaultProps} onCancel={onCancel} />);
    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not call onCancel when dialog box is clicked', () => {
    const onCancel = vi.fn();
    render(<Modal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('applies danger color to confirm button when isDanger', () => {
    render(<Modal {...defaultProps} isDanger confirmLabel="삭제" />);
    const confirmBtn = screen.getByText('삭제');
    expect(confirmBtn).toHaveStyle({ backgroundColor: '#DC2626' });
  });

  it('applies primary color to confirm button by default', () => {
    render(<Modal {...defaultProps} />);
    const confirmBtn = screen.getByText('확인');
    expect(confirmBtn).toHaveStyle({ backgroundColor: '#2563EB' });
  });

  it('has aria-modal attribute', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
