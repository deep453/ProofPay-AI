import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function PaymentChart({ title = 'Monthly Payment Velocity', className = '' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const values = [650, 1100, 850, 1450, 1200, 2250, 1850];
  const maxValue = 2500;

  // Generate SVG path coordinates
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / (values.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (val / maxValue) * (height - paddingY * 2);
    return { x, y, val, month: months[idx] };
  });

  // Build smooth bezier SVG path
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">Verified PayPal milestone disbursements</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
          <span>Total Settled:</span>
          <span className="text-blue-600 font-bold">$9,350.00</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = height - paddingY - pct * (height - paddingY * 2);
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Smooth line */}
          <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

          {/* Interactive points */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.month === pt.month ? '6' : '4'}
                className="fill-white stroke-blue-600 stroke-2 transition-all duration-150"
              />
              {hoveredPoint?.month === pt.month && (
                <circle cx={pt.x} cy={pt.y} r="10" className="fill-blue-500/20" />
              )}
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 bg-slate-900 text-white text-2xs px-2.5 py-1.5 rounded-lg shadow-xl font-mono flex flex-col items-center gap-0.5"
            style={{ left: `${(hoveredPoint.x / width) * 100}%` }}
          >
            <span className="font-bold text-blue-300">{formatCurrency(hoveredPoint.val)}</span>
            <span className="text-slate-400 text-3xs">{hoveredPoint.month} 2026</span>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between px-6 pt-2 text-2xs font-medium text-slate-400">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}
