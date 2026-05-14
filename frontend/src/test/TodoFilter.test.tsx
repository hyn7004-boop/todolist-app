import { render, screen, fireEvent } from '@testing-library/react';
import { TodoFilter } from '../components/todo/TodoFilter';
import type { Category } from '../types/category.types';

const mockCategories: Category[] = [
  { category_id: 'cat-1', name: '일반', is_default: true, created_at: '2026-01-01' },
  { category_id: 'cat-2', name: '업무', is_default: true, created_at: '2026-01-01' },
];

describe('TodoFilter', () => {
  it('renders category dropdown', () => {
    render(<TodoFilter filters={{}} categories={mockCategories} onChange={vi.fn()} />);
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
  });

  it('renders category options including "전체 카테고리"', () => {
    render(<TodoFilter filters={{}} categories={mockCategories} onChange={vi.fn()} />);
    expect(screen.getByText('전체 카테고리')).toBeInTheDocument();
    expect(screen.getByText('일반')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
  });

  it('renders date from and date to inputs', () => {
    render(<TodoFilter filters={{}} categories={[]} onChange={vi.fn()} />);
    expect(screen.getByLabelText('시작일')).toBeInTheDocument();
    expect(screen.getByLabelText('종료일')).toBeInTheDocument();
  });

  it('renders completion status select', () => {
    render(<TodoFilter filters={{}} categories={[]} onChange={vi.fn()} />);
    expect(screen.getByLabelText('완료 여부')).toBeInTheDocument();
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('미완료')).toBeInTheDocument();
  });

  it('calls onChange with category_id when category selected', () => {
    const onChange = vi.fn();
    render(<TodoFilter filters={{}} categories={mockCategories} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('카테고리'), { target: { value: 'cat-1' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ category_id: 'cat-1' }));
  });

  it('calls onChange without category_id when "전체 카테고리" selected', () => {
    const onChange = vi.fn();
    render(
      <TodoFilter filters={{ category_id: 'cat-1' }} categories={mockCategories} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText('카테고리'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(expect.not.objectContaining({ category_id: expect.anything() }));
  });

  it('calls onChange with due_date_from when start date changes', () => {
    const onChange = vi.fn();
    render(<TodoFilter filters={{}} categories={[]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2026-05-01' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ due_date_from: '2026-05-01' }));
  });

  it('calls onChange with is_completed true when "완료" selected', () => {
    const onChange = vi.fn();
    render(<TodoFilter filters={{}} categories={[]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('완료 여부'), { target: { value: 'true' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ is_completed: true }));
  });

  it('calls onChange with is_completed false when "미완료" selected', () => {
    const onChange = vi.fn();
    render(<TodoFilter filters={{}} categories={[]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('완료 여부'), { target: { value: 'false' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ is_completed: false }));
  });

  it('shows date error when from > to', () => {
    const onChange = vi.fn();
    render(<TodoFilter filters={{}} categories={[]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2026-05-10' } });
    fireEvent.change(screen.getByLabelText('종료일'), { target: { value: '2026-05-01' } });
    expect(screen.getByText('시작일은 종료일보다 이전이어야 합니다.')).toBeInTheDocument();
  });

  it('does NOT call onChange with invalid date range', () => {
    const onChange = vi.fn();
    render(<TodoFilter filters={{}} categories={[]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2026-05-10' } });
    onChange.mockClear();
    fireEvent.change(screen.getByLabelText('종료일'), { target: { value: '2026-05-01' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('resets all filters when 초기화 button clicked', () => {
    const onChange = vi.fn();
    render(
      <TodoFilter
        filters={{ category_id: 'cat-1', is_completed: true }}
        categories={mockCategories}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByText('초기화'));
    expect(onChange).toHaveBeenCalledWith({});
  });
});
