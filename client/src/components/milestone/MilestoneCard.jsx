import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelativeTime } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import { GitPullRequest, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MilestoneCard({ milestone, className = '' }) {
  const { role } = useAuth();
  const linkTarget = `/${role}/milestones/${milestone._id}`;

  const criteriaCount = milestone.acceptanceCriteria?.length || 0;
  const findingsCount = milestone.evidenceReport?.findings?.length || 0;
  const supportedCount = milestone.evidenceReport?.findings?.filter((f) => f.result === 'supported').length || 0;

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <StatusBadge status={milestone.status} size="sm" />
          <span className="text-base font-extrabold text-slate-900 font-mono">
            {formatCurrency(milestone.amount, milestone.currency)}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
          <Link to={linkTarget} className="hover:text-blue-600 transition-colors">
            {milestone.title}
          </Link>
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {milestone.description}
        </p>

        {/* Details Pills */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-3xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1 font-mono">
              <GitPullRequest className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[150px]">{milestone.githubRepo}</span>
            </span>
            <span className="font-medium text-slate-700">
              {role === 'client' ? milestone.developerName : milestone.clientName}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>Criteria: <strong>{criteriaCount} defined</strong></span>
            {milestone.evidenceReport ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {supportedCount}/{findingsCount} verified
              </span>
            ) : (
              <span className="text-slate-400">Report pending</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-3xs text-slate-400">
          Updated {formatRelativeTime(milestone.updatedAt || milestone.createdAt)}
        </span>

        <Link
          to={linkTarget}
          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors text-xs"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
