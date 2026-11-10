export default function Skeleton({
  variant = 'text', // 'text' | 'card' | 'circle' | 'table-row'
  className = '',
  count = 1
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((i) => (
          <div key={i} className={`p-5 rounded-2xl bg-white border border-slate-100 animate-pulse space-y-3 ${className}`}>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-8 bg-slate-200 rounded w-2/3"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className={`rounded-full bg-slate-200 animate-pulse shrink-0 ${className || 'w-10 h-10'}`} />
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-slate-100 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 rounded w-1/5"></div>
            <div className="h-6 bg-slate-100 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i} className={`h-4 bg-slate-200 rounded animate-pulse ${className || 'w-full'}`} />
      ))}
    </div>
  );
}
