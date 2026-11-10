import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMilestones } from '../../hooks/useMilestones';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import MilestoneChart from '../../components/dashboard/MilestoneChart';
import PaymentChart from '../../components/dashboard/PaymentChart';
import RecentMilestones from '../../components/dashboard/RecentMilestones';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import Skeleton from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import {
  CheckCircle2,
  Send,
  DollarSign,
  PlusCircle
} from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { milestones, stats, loading } = useMilestones();

  const todayStr = formatDate(new Date().toISOString(), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  if (loading && milestones.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" count={3} />
        <Skeleton variant="table-row" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Fintech Operations Overview</span>
            <span>•</span>
            <span className="text-slate-400 font-normal">{todayStr}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Sarah Chen'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You have <strong className="text-blue-600 font-bold">{stats.pendingApprovals} milestone(s)</strong> awaiting your verification approval.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/client/milestones/create">
            <Button variant="primary" size="md" icon={PlusCircle}>
              Create Milestone
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Executive Stat Cards (Fintech reference inspired) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Settled - Dark card matching reference image! */}
        <StatCard
          title="Total Amount Paid"
          value={formatCurrency(stats.totalAmountPaid)}
          subtitle="Verified via PayPal Sandbox"
          trend="↑ 12.73%"
          trendType="up"
          trendLabel="vs last month"
          icon={DollarSign}
          variant="dark"
          allowPrivacy={true}
        />

        {/* Pending Approvals */}
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          subtitle="Awaiting client human review"
          trend={stats.pendingApprovals > 0 ? "Action Required" : "All Clear"}
          trendType={stats.pendingApprovals > 0 ? "down" : "up"}
          icon={CheckCircle2}
          variant="light"
        />

        {/* Invoices Dispatched */}
        <StatCard
          title="Invoices Sent"
          value={stats.invoicesSent}
          subtitle="Awaiting webhook payment confirmation"
          trend="Dispatched"
          trendType="neutral"
          icon={Send}
          variant="light"
        />
      </div>

      {/* Row 2: Secondary Quick Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
            Total Milestones
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            {stats.totalMilestones}
          </div>
          <div className="text-3xs text-slate-500 mt-0.5">Across active repositories</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
            Active in Progress
          </span>
          <div className="text-xl font-extrabold text-blue-600 font-mono mt-1">
            {stats.activeMilestones}
          </div>
          <div className="text-3xs text-slate-500 mt-0.5">Draft, Verifying, or Review</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
            Completed & Verified
          </span>
          <div className="text-xl font-extrabold text-emerald-600 font-mono mt-1">
            {stats.paymentsReceived}
          </div>
          <div className="text-3xs text-slate-500 mt-0.5">100% PayPal Webhook Settled</div>
        </div>
      </div>

      {/* Row 3: Charts (Distribution & Monthly Payment Curve) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MilestoneChart />
        <PaymentChart />
      </div>

      {/* Row 4: Recent Milestones (65%) & Activity Feed (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentMilestones milestones={milestones} />
        </div>
        <div>
          <ActivityFeed limit={6} />
        </div>
      </div>
    </div>
  );
}
