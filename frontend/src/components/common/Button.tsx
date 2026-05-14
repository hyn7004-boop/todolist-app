import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  isLoading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-5 py-2 rounded-[6px] text-sm font-semibold transition-colors duration-150 cursor-pointer focus:outline-none ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
}
