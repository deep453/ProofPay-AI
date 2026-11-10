import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelativeTime } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import { ArrowUpRight, GitPullRequest } from 'lucide-react';

export default function RecentMilestones({ milestones = [], className = '' }) {
  const { role } = useAuth();
  const recent = milestones.slice(0, 5);

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Milestones</h3>
          <p className="text-xs text-slate-500">Deliverables in progress and awaiting sign-off</p>
        </div>
        <Link
          to={`/${role}/milestones`}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          View all ({milestones.length}) &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider text-3xs border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3">Milestone</th>
              <th className="py-2.5 px-3">{role === 'client' ? 'Developer' : 'Client'}</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Updated</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.map((m) => (
              <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900 line-clamp-1">{m.title}</div>
                  <div className="text-3xs text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                    <GitPullRequest className="w-2.5 h-2.5" />
                    <span>{m.githubRepo}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="font-medium text-slate-700">
                    {role === 'client' ? m.developerName : m.clientName}
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                  {formatCurrency(m.amount, m.currency)}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={m.status} size="sm" />
                </td>
                <td className="py-3 px-3 text-slate-500 text-3xs">
                  {formatRelativeTime(m.updatedAt || m.createdAt)}
                </td>
                <td className="py-3 px-3 text-right">
                  <Link
                    to={`/${role}/milestones/${m._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
