export default function LoadingSpinner({ size = 'md', className = '', message }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-blue-600/20 border-t-blue-600 animate-spin`}
        role="status"
        aria-label="loading"
      />
      {message && <p className="text-xs font-medium text-slate-500 animate-pulse">{message}</p>}
    </div>
  );
}
