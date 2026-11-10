import { Check, Clock, AlertCircle } from 'lucide-react';
import { WORKFLOW_STEPS } from '../../utils/statusConfig';

export default function MilestoneTimeline({ currentStatus, className = '' }) {
  const isRevision = currentStatus === 'needs_revision';
  const isBlocked = currentStatus === 'blocked';

  // Find index in happy-path workflow
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStatus);

  return (
    <div className={`w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Verification & Payment Workflow Progress
        </h3>
        {isRevision && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Revisions Requested
          </span>
        )}
        {isBlocked && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Milestone Blocked
          </span>
        )}
      </div>

      {/* Horizontal Steps Bar */}
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-100 z-0" />

        {WORKFLOW_STEPS.map((step, idx) => {
          const isCompleted = currentIndex > idx;
          const isCurrent = currentIndex === idx;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2 ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-sm animate-pulse'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span
                className={`text-2xs font-semibold mt-2 max-w-[80px] text-center truncate ${
                  isCurrent
                    ? 'text-blue-700 font-bold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
