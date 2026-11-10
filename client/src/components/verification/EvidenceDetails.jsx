import {
  GitBranch,
  Clock,
  ShieldAlert,
  FolderGit2,
  CheckCircle2
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function EvidenceDetails({ report, milestone, className = '' }) {
  if (!report) return null;

  const timelineSteps = [
    { title: 'Repository Inspected', desc: `${milestone?.githubRepo || report.repository}`, status: 'done' },
    { title: 'Commits & SHAs Collected', desc: 'Analyzed commit messages and diff trees', status: 'done' },
    { title: 'Pull Requests Inspected', desc: 'Evaluated PR descriptions and code review status', status: 'done' },
    { title: 'AI Acceptance Criteria Evaluated', desc: 'Compared AST evidence against criteria thresholds', status: 'done' },
    { title: 'Verification Dossier Compiled', desc: `Generated ${formatDateTime(report.generatedAt)}`, status: 'done' }
  ];

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Repository Context Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-slate-400" />
          <span>Repository Telemetry</span>
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Repository</span>
            <span className="font-mono font-semibold text-slate-800">{report.repository}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Branch</span>
            <span className="font-mono text-slate-800 flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-slate-400" /> main
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500">Inspection Time</span>
            <span className="text-slate-700 font-mono text-3xs">
              {formatDateTime(report.generatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Timeline */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Verification Pipeline Stages</span>
        </h4>

        <div className="space-y-3.5 relative">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 relative">
              {idx !== timelineSteps.length - 1 && (
                <div className="absolute left-3 top-5 bottom-0 w-0.5 bg-emerald-100" />
              )}
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 z-10">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900">{step.title}</div>
                <div className="text-3xs text-slate-400 mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Limitations & Scope Safeguard */}
      {report.limitations && report.limitations.length > 0 && (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/60 p-4 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Inspection Limitations & Warnings</span>
          </div>
          <ul className="space-y-1.5 pl-5 list-disc text-2xs text-amber-900/90 leading-relaxed">
            {report.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
