import { CheckCircle2, AlertTriangle, FileCode2, Send, CreditCard, Sparkles } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate';
import { MOCK_AUDIT_EVENTS } from '../../data/mockActivity';
import { Link } from 'react-router-dom';

export default function ActivityFeed({ limit = 5, className = '' }) {
  const events = MOCK_AUDIT_EVENTS.slice(0, limit);

  const getIcon = (type) => {
    switch (type) {
      case 'payment_verified':
      case 'webhook_received':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'invoice_sent':
      case 'invoice_created':
        return <Send className="w-4 h-4 text-purple-600" />;
      case 'client_approved':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'revision_requested':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'report_generated':
      case 'evidence_collection_started':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileCode2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
          <p className="text-xs text-slate-500">Real-time audit trail events</p>
        </div>
        <Link to="/audit" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
          View all &rarr;
        </Link>
      </div>

      <div className="relative space-y-4">
        {events.map((evt, idx) => (
          <div key={evt.id || idx} className="flex items-start gap-3 relative">
            {/* Timeline connector bar */}
            {idx !== events.length - 1 && (
              <div className="absolute left-4 top-8 -bottom-4 w-0.5 bg-slate-100" />
            )}

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0 z-10">
              {getIcon(evt.eventType)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-slate-900 truncate">{evt.title}</span>
                <span className="text-3xs text-slate-400 font-mono shrink-0">
                  {formatRelativeTime(evt.timestamp)}
                </span>
              </div>
              <p className="text-2xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                {evt.description}
              </p>
              {evt.milestoneTitle && (
                <div className="mt-1 text-3xs font-medium text-blue-600 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded-md inline-block">
                  {evt.milestoneTitle}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
