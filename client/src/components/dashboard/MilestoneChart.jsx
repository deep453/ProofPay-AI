import { useMilestones } from '../../hooks/useMilestones';

export default function MilestoneChart({ className = '' }) {
  const { milestones } = useMilestones();

  const counts = {
    paid: milestones.filter((m) => m.status === 'paid').length,
    approvedOrSent: milestones.filter((m) => ['approved_for_invoice', 'invoice_sent'].includes(m.status)).length,
    awaiting: milestones.filter((m) => ['awaiting_client_approval', 'evidence_ready'].includes(m.status)).length,
    verifying: milestones.filter((m) => m.status === 'verifying').length,
    revision: milestones.filter((m) => ['needs_revision', 'blocked', 'draft'].includes(m.status)).length
  };

  const total = milestones.length || 1;

  const categories = [
    { label: 'Paid & Verified', count: counts.paid, color: 'bg-emerald-500', barColor: '#10B981', textColor: 'text-emerald-700' },
    { label: 'Invoiced / Approved', count: counts.approvedOrSent, color: 'bg-blue-500', barColor: '#3B82F6', textColor: 'text-blue-700' },
    { label: 'Awaiting Approval', count: counts.awaiting, color: 'bg-amber-500', barColor: '#F59E0B', textColor: 'text-amber-700' },
    { label: 'AI Verifying', count: counts.verifying, color: 'bg-indigo-500', barColor: '#6366F1', textColor: 'text-indigo-700' },
    { label: 'Needs Revision / Draft', count: counts.revision, color: 'bg-rose-500', barColor: '#EF4444', textColor: 'text-rose-700' }
  ];

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Milestone Pipeline Distribution</h3>
          <p className="text-xs text-slate-500">Current lifecycle states across all projects</p>
        </div>
        <span className="text-xs font-semibold text-slate-500 font-mono">{milestones.length} Active</span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3.5 w-full flex rounded-full overflow-hidden bg-slate-100 gap-0.5 p-0.5 mb-5">
        {categories.map((cat, idx) => {
          const pct = (cat.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={idx}
              style={{ width: `${pct}%`, backgroundColor: cat.barColor }}
              className="h-full rounded-full transition-all duration-300"
              title={`${cat.label}: ${cat.count}`}
            />
          );
        })}
      </div>

      {/* Category Breakdown List */}
      <div className="space-y-2.5">
        {categories.map((cat, idx) => {
          const pct = Math.round((cat.count / total) * 100);
          return (
            <div key={idx} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="font-medium text-slate-700">{cat.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-900 font-bold">{cat.count}</span>
                <span className="text-slate-400 text-3xs">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
