import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import MilestoneCard from './MilestoneCard';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelativeTime } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import {
  Search,
  ArrowRight,
  GitPullRequest
} from 'lucide-react';

export default function MilestoneTable({ milestones = [] }) {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'amount_high' | 'amount_low'

  // Filter pipeline
  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      // Tab filter
      if (activeTab === 'active') {
        if (!['draft', 'verifying', 'evidence_ready', 'needs_revision'].includes(m.status)) return false;
      } else if (activeTab === 'pending') {
        if (!['awaiting_client_approval', 'approved_for_invoice', 'invoice_sent'].includes(m.status)) return false;
      } else if (activeTab === 'completed') {
        if (m.status !== 'paid') return false;
      }

      // Status dropdown filter
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesRepo = m.githubRepo.toLowerCase().includes(q);
        const matchesDev = m.developerName?.toLowerCase().includes(q);
        const matchesClient = m.clientName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesRepo && !matchesDev && !matchesClient) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      if (sortBy === 'amount_high') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_low') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [milestones, activeTab, statusFilter, searchQuery, sortBy]);

  const tabs = [
    { id: 'all', label: 'All Deliverables', count: milestones.length },
    {
      id: 'active',
      label: 'In Progress',
      count: milestones.filter((m) => ['draft', 'verifying', 'evidence_ready', 'needs_revision'].includes(m.status)).length
    },
    {
      id: 'pending',
      label: 'Awaiting Action',
      count: milestones.filter((m) => ['awaiting_client_approval', 'approved_for_invoice', 'invoice_sent'].includes(m.status)).length
    },
    {
      id: 'completed',
      label: 'Paid & Settled',
      count: milestones.filter((m) => m.status === 'paid').length
    }
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-2xs ${
                activeTab === tab.id ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestone title, repo, developer..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="verifying">Verifying</option>
            <option value="evidence_ready">Evidence Ready</option>
            <option value="awaiting_client_approval">Awaiting Approval</option>
            <option value="approved_for_invoice">Approved for Invoice</option>
            <option value="invoice_sent">Invoice Sent</option>
            <option value="paid">Paid</option>
            <option value="needs_revision">Needs Revision</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="latest">Sort: Latest</option>
            <option value="amount_high">Amount: High to Low</option>
            <option value="amount_low">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Results View */}
      {filteredMilestones.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <p className="text-sm text-slate-600 font-medium">No milestones match your current filters.</p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-3xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Milestone Title & Repo</th>
                  <th className="px-5 py-3.5">{role === 'client' ? 'Developer' : 'Client'}</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMilestones.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        to={`/${role}/milestones/${m._id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-sm line-clamp-1"
                      >
                        {m.title}
                      </Link>
                      <div className="flex items-center gap-1.5 text-3xs text-slate-400 font-mono mt-0.5">
                        <GitPullRequest className="w-3 h-3 text-slate-400" />
                        <span>{m.githubRepo}</span>
                        <span>•</span>
                        <span>{m.acceptanceCriteria?.length || 0} criteria</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {role === 'client' ? m.developerName : m.clientName}
                      </div>
                      <div className="text-3xs text-slate-400 font-mono">
                        {role === 'client' ? m.developerEmail : m.clientEmail}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 font-mono text-sm">
                      {formatCurrency(m.amount, m.currency)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={m.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-slate-500 text-3xs">
                      {formatRelativeTime(m.updatedAt || m.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/${role}/milestones/${m._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all font-semibold shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid (Visible on mobile screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredMilestones.map((m) => (
              <MilestoneCard key={m._id} milestone={m} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
