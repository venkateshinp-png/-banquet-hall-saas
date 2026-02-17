interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-12 w-12 border-2',
  lg: 'h-16 w-16 border-[3px]',
};

export default function LoadingSpinner({ size = 'md' }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-[#1e3a8a] border-t-transparent ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
