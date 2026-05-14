import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  errorMessage?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, errorMessage, id, className = '', options, style, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hasError = Boolean(errorMessage);

    const baseStyle: React.CSSProperties = {
      backgroundColor: 'var(--color-input-bg)',
      borderColor: hasError ? '#DC2626' : 'var(--color-border)',
      color: 'var(--color-text-primary)',
      boxShadow: hasError ? '0 0 0 3px rgba(220,38,38,0.1)' : undefined,
    };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full h-10 px-3 py-2 border rounded-[6px] text-sm outline-none transition-all duration-150 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:20px_20px] pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          style={{ ...baseStyle, ...style }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errorMessage && (
          <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
