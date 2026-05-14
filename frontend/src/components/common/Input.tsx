import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, errorMessage, id, className = '', style, type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(errorMessage);
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = useState(false);
    const handlePasswordButtonMouseDown = () => setShowPassword(true);
    const handlePasswordButtonMouseUp = () => setShowPassword(false);

    const baseStyle: React.CSSProperties = {
      backgroundColor: 'var(--color-input-bg)',
      borderColor: hasError ? '#DC2626' : 'var(--color-border)',
      color: 'var(--color-text-primary)',
      boxShadow: hasError ? '0 0 0 3px rgba(220,38,38,0.1)' : undefined,
    };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            className={`w-full h-10 px-3 py-2 border rounded-[6px] text-sm outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${isPassword ? 'pr-10' : ''} ${className}`}
            style={{ ...baseStyle, ...style }}
            placeholder={props.placeholder}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onMouseDown={handlePasswordButtonMouseDown}
              onMouseUp={handlePasswordButtonMouseUp}
              onMouseLeave={handlePasswordButtonMouseUp}
              onTouchStart={handlePasswordButtonMouseDown}
              onTouchEnd={handlePasswordButtonMouseUp}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="비밀번호 보기"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          )}
        </div>
        {errorMessage && (
          <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
