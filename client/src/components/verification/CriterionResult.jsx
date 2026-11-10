import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import EvidenceCard from './EvidenceCard';

export default function CriterionResult({
  finding,
  criterionDescription,
  index = 0,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const resultStyles = {
    supported: {
      cardBg: 'bg-emerald-50/40 border-emerald-200/90',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      label: 'Supported'
    },
    not_supported: {
      cardBg: 'bg-rose-50/40 border-rose-200/90',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: XCircle,
      iconColor: 'text-rose-600',
      label: 'Not Supported'
    },
    inconclusive: {
      cardBg: 'bg-amber-50/40 border-amber-200/90',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      label: 'Inconclusive'
    }
  };

  const style = resultStyles[finding.result] || resultStyles.inconclusive;
  const ResultIcon = style.icon;

  return (
    <div className={`rounded-2xl border p-5 transition-all shadow-2xs ${style.cardBg} ${className}`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 mt-0.5">
            {index + 1}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">
                {finding.criterionTitle}
              </h4>
              <span
                className={`inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full border ${style.badgeBg}`}
              >
                <ResultIcon className="w-3 h-3 shrink-0" />
                <span>{style.label}</span>
              </span>
            </div>

            {criterionDescription && (
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {criterionDescription}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors shrink-0"
          aria-label={isExpanded ? 'Collapse evidence' : 'Expand evidence'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content: AI Evaluation & Evidence */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3.5">
          {/* Explanation Box */}
          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/70 text-xs text-slate-800 space-y-1">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">
              AI Verification Finding
            </span>
            <p className="leading-relaxed font-sans">{finding.explanation}</p>
          </div>

          {/* Evidence Items */}
          {finding.evidence && finding.evidence.length > 0 && (
            <div className="space-y-2">
              <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">
                Corroborating Evidence ({finding.evidence.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {finding.evidence.map((item, idx) => (
                  <EvidenceCard key={idx} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
