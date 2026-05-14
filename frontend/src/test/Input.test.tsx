import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../components/common/Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="이메일" />);
    expect(screen.getByText('이메일')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(<Input label="이메일" />);
    const label = screen.getByText('이메일');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('uses provided id', () => {
    render(<Input id="email-input" label="이메일" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email-input');
  });

  it('renders error message when provided', () => {
    render(<Input errorMessage="필수 입력 항목입니다" />);
    expect(screen.getByRole('alert')).toHaveTextContent('필수 입력 항목입니다');
  });

  it('applies error border style when errorMessage is present', () => {
    render(<Input errorMessage="오류" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle({ borderColor: '#DC2626' });
  });

  it('does not render error element when no errorMessage', () => {
    render(<Input />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes through placeholder prop', () => {
    render(<Input placeholder="이메일을 입력하세요" />);
    expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
  });

  it('handles change events', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
