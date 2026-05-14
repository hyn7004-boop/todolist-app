import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with role status and aria-label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('로딩 중')).toBeInTheDocument();
  });

  it('renders sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('[style*="width: 16px"]');
    expect(spinner).toBeTruthy();
  });

  it('renders md size by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('[style*="width: 24px"]');
    expect(spinner).toBeTruthy();
  });

  it('renders lg size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('[style*="width: 32px"]');
    expect(spinner).toBeTruthy();
  });
});
