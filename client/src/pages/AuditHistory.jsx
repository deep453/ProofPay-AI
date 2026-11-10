import { useState, useEffect } from 'react';
import { auditService } from '../services/auditService';
import PageHeader from '../components/layout/PageHeader';
import StatCard from '../components/common/StatCard';
import Skeleton from '../components/common/Skeleton';
import { formatDateTime, formatRelativeTime } from '../utils/formatDate';
import {
  History,
  ShieldCheck,
  Search,
  CheckCircle2,
  Send,
  CreditCard,
  Sparkles,
  Filter,
  FileCode2
} from 'lucide-react';

export default function AuditHistory() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadAudit() {
      try {
        const data = await auditService.getAuditEvents({
          category: categoryFilter,
          search: searchQuery
        });
        setEvents(data);
      } catch (err) {
        console.error('Failed to load audit trail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, [categoryFilter, searchQuery]);

  const totalEvents = events.length;
  const webhooksProcessed = events.filter((e) => e.status === 'success').length;
  const eventsNeedingAttention = events.filter((e) => e.status === 'warning').length;

  const getEventIcon = (category) => {
    switch (category) {
      case 'payment':
      case 'webhook':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'invoice':
        return <Send className="w-4 h-4 text-purple-600" />;
      case 'approval':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'verification':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileCode2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="PayPal Webhook History"
        subtitle="Persisted PayPal webhook events associated with your milestones, including processing outcomes and timestamps."
        breadcrumbs={[
          { label: 'Overview', to: '/' },
          { label: 'Audit History' }
        ]}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Recorded Webhook Events"
          value={totalEvents}
          subtitle="Persisted in the ProofPay database"
          icon={History}
          variant="light"
        />

        <StatCard
          title="Successfully Processed"
          value={webhooksProcessed}
          subtitle="Webhook processing completed successfully"
          icon={ShieldCheck}
          variant="light"
          trend="Processed"
          trendType="up"
        />

        <StatCard
          title="Events Needing Attention"
          value={eventsNeedingAttention}
          subtitle="Failed webhook events"
          icon={CheckCircle2}
          variant="light"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event type, invoice, milestone or event ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Webhook Events</option>
            <option value="webhook">PayPal Webhooks</option>
          </select>
        </div>
      </div>

      {/* Timeline & Event Table Layout */}
      {loading ? (
        <Skeleton variant="table-row" count={5} />
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          No audit records matched your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vertical Timeline (1 col) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Chronological Webhook Events
            </h3>

            <div className="relative space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {events.map((evt, idx) => (
                <div key={evt.id || idx} className="flex items-start gap-3 relative">
                  {idx !== events.length - 1 && (
                    <div className="absolute left-3.5 top-7 -bottom-4 w-0.5 bg-slate-100" />
                  )}
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 shrink-0 z-10">
                    {getEventIcon(evt.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                    <div className="text-3xs text-slate-400 font-mono mt-0.5">
                      {formatRelativeTime(evt.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Telemetry Table (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-3xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">PayPal Event & Details</th>
                    <th className="px-5 py-3.5">Source</th>
                    <th className="px-5 py-3.5">Webhook Event ID</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-xs">{evt.title}</div>
                        <p className="text-3xs text-slate-500 mt-0.5 max-w-sm line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>
                        {evt.milestoneTitle && (
                          <span className="mt-1 text-3xs text-blue-600 font-medium inline-block">
                            Milestone: {evt.milestoneTitle}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">{evt.actor}</div>
                        <span className="text-3xs uppercase font-semibold text-slate-400">
                          {evt.actorRole}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-3xs text-slate-600">
                        {evt.referenceId || 'â€”'}
                      </td>

                      <td className="px-5 py-4 text-3xs text-slate-500">
                        {formatDateTime(evt.timestamp)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full border ${
                            evt.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : evt.status === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              evt.status === 'success'
                                ? 'bg-emerald-500'
                                : evt.status === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span className="uppercase">{evt.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

