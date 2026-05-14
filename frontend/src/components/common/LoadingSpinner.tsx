interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { width: 16, height: 16, borderWidth: 2 },
  md: { width: 24, height: 24, borderWidth: 2 },
  lg: { width: 32, height: 32, borderWidth: 3 },
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const { width, height, borderWidth } = SIZE_MAP[size];

  return (
    <div className="flex items-center justify-center" role="status" aria-label="로딩 중">
      <div
        className="rounded-full animate-spin"
        style={{
          width,
          height,
          borderWidth,
          borderStyle: 'solid',
          borderColor: '#E5E7EB',
          borderTopColor: '#2563EB',
        }}
      />
    </div>
  );
}
