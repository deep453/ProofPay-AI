import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMilestones } from '../../hooks/useMilestones';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import RecentMilestones from '../../components/dashboard/RecentMilestones';
import ActivityFeed from '../../components/dashboard/ActivityFeed';

import { formatCurrency } from '../../utils/formatCurrency';

import { FolderGit2, Send, ShieldCheck, DollarSign, Code2, Sparkles } from 'lucide-react';

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const { milestones, stats } = useMilestones();

  // Milestones assigned to this developer
  const assigned = milestones;
  const awaitingSubmission = assigned.filter((m) =>
    ['draft', 'needs_revision'].includes(m.status)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Code2 className="w-4 h-4" />
            <span>Developer Workspace</span>
            <span>•</span>
            <span className="text-slate-400 font-normal">@{user?.githubUsername || 'davidkim-code'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'David Kim'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You have <strong className="text-indigo-600 font-bold">{awaitingSubmission.length} deliverable(s)</strong> awaiting code submission or revision.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/developer/submit">
            <Button variant="primary" size="md" icon={Send}>
              Submit Work for Verification
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarned)}
          subtitle="Received via PayPal"
          icon={DollarSign}
          variant="dark"
          allowPrivacy={true}
          trend="Disbursed"
          trendType="up"
        />

        <StatCard
          title="Assigned Milestones"
          value={assigned.length}
          subtitle="All contract deliverables"
          icon={FolderGit2}
          variant="light"
        />

        <StatCard
          title="Active Work"
          value={awaitingSubmission.length}
          subtitle="Awaiting code submission"
          icon={Code2}
          variant="light"
          trend={awaitingSubmission.length > 0 ? "Pending Work" : "Up to date"}
          trendType={awaitingSubmission.length > 0 ? "down" : "up"}
        />

        <StatCard
          title="Awaiting Verification"
          value={stats.pendingApprovals + stats.awaitingVerification}
          subtitle="In AI review or client sign-off"
          icon={ShieldCheck}
          variant="light"
          trend="In Progress"
          trendType="neutral"
        />
      </div>

      {/* Action Prompt: Work awaiting submission */}
      {awaitingSubmission.length > 0 && (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Action Required
              </span>
              <h3 className="text-sm font-bold text-amber-950">
                Ready to submit code for "{awaitingSubmission[0].title}"?
              </h3>
              <p className="text-xs text-amber-900/90 leading-relaxed max-w-xl">
                Repository: <strong className="font-mono">{awaitingSubmission[0].githubRepo}</strong> ({awaitingSubmission[0].acceptanceCriteria?.length} criteria). Submit your branch and pull request to trigger autonomous AI evidence evaluation.
              </p>
            </div>

            <Link to={`/developer/submit?milestoneId=${awaitingSubmission[0]._id}`}>
              <Button variant="secondary" size="sm" icon={Send}>
                Submit Work Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Assigned Milestones & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentMilestones milestones={assigned} />
        </div>
        <div>
          <ActivityFeed limit={6} />
        </div>
      </div>
    </div>
  );
}
