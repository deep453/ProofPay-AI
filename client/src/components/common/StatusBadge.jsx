import { STATUS_CONFIG } from '../../utils/statusConfig';

export default function StatusBadge({ status, size = 'md', className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
    bgClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400'
  };

  const sizeClasses = {
    sm: 'text-2xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-colors ${config.bgClass} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={config.description || config.label}
    >
      <span className={`rounded-full shrink-0 ${config.dotClass} ${dotSizes[size] || dotSizes.md}`} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
}
