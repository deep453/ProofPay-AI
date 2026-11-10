import { CheckCircle2, XCircle, AlertTriangle, ListChecks } from 'lucide-react';

export default function VerificationSummary({ report, className = '' }) {
  if (!report || !report.findings) return null;

  const findings = report.findings;
  const total = findings.length;
  const supported = findings.filter((f) => f.result === 'supported').length;
  const notSupported = findings.filter((f) => f.result === 'not_supported').length;
  const inconclusive = findings.filter((f) => f.result === 'inconclusive').length;

  const scorePct = total > 0 ? Math.round((supported / total) * 100) : 0;

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Supported */}
      <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/60 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800">
            Supported
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-950 mt-2 font-mono">{supported}</div>
        <p className="text-3xs text-emerald-700 mt-1">Directly satisfied by code evidence</p>
      </div>

      {/* Inconclusive */}
      <div className="rounded-2xl border border-amber-200/90 bg-amber-50/60 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold uppercase tracking-wider text-amber-800">
            Inconclusive
          </span>
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-950 mt-2 font-mono">{inconclusive}</div>
        <p className="text-3xs text-amber-700 mt-1">Requires human review & acknowledgement</p>
      </div>

      {/* Not Supported */}
      <div className="rounded-2xl border border-rose-200/90 bg-rose-50/60 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold uppercase tracking-wider text-rose-800">
            Not Supported
          </span>
          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-rose-950 mt-2 font-mono">{notSupported}</div>
        <p className="text-3xs text-rose-700 mt-1">Evidence missing or targets failed</p>
      </div>

      {/* Total Evaluation */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
            Verification Score
          </span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <ListChecks className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{scorePct}%</div>
        <p className="text-3xs text-slate-500 mt-1">{total} Acceptance Criteria Analyzed</p>
      </div>
    </div>
  );
}
