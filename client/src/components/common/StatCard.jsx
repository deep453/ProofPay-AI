import { useState } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  trendLabel = 'vs last period',
  subtitle,
  icon: Icon,
  variant = 'light', // 'light' | 'dark'
  allowPrivacy = false,
  className = ''
}) {
  const [hidden, setHidden] = useState(false);

  const isDark = variant === 'dark';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5.5 transition-all duration-200 ${
        isDark
          ? 'bg-[#172554] text-white border border-blue-900/40 shadow-lg shadow-blue-950/20'
          : 'bg-white text-slate-900 border border-slate-200/80 shadow-xs hover:border-slate-300'
      } ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className={`p-2 rounded-xl ${
                isDark ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className={`text-xs font-semibold tracking-wide uppercase ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            {title}
          </span>
        </div>

        {allowPrivacy && (
          <button
            type="button"
            onClick={() => setHidden(!hidden)}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-blue-900/40' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label={hidden ? 'Reveal value' : 'Hide value'}
          >
            {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between gap-3">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {hidden ? '••••••••' : value}
        </div>
      </div>

      {/* Footer / Trend */}
      <div className="mt-3.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100/10">
        {subtitle && (
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {subtitle}
          </span>
        )}

        {trend && (
          <div
            className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full text-xs ${
              trendType === 'up'
                ? isDark
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-emerald-50 text-emerald-700'
                : trendType === 'down'
                ? isDark
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-rose-50 text-rose-700'
                : isDark
                ? 'bg-slate-700 text-slate-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trendType === 'up' && <TrendingUp className="w-3 h-3" />}
            {trendType === 'down' && <TrendingDown className="w-3 h-3" />}
            <span>{trend}</span>
            {trendLabel && <span className="opacity-75 font-normal ml-0.5 hidden sm:inline">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
