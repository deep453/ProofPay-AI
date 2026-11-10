import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMilestones } from '../../hooks/useMilestones';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/layout/PageHeader';
import MilestoneTimeline from '../../components/milestone/MilestoneTimeline';
import AcceptanceCriteria from '../../components/milestone/AcceptanceCriteria';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AIVerificationSimulator from '../../components/ai/AIVerificationSimulator';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import {
  GitPullRequest,
  ExternalLink,
  ShieldCheck,
  Send,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';

export default function MilestoneDetails() {
  const { id } = useParams();
  const { milestones, createInvoice, triggerVerification } = useMilestones();
  const { role } = useAuth();
  const navigate = useNavigate();

  const milestone = milestones.find((m) => m._id === id) || null;

  const [invoicingLoading, setInvoicingLoading] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  if (!milestone) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner size="lg" message="Loading milestone record..." />
      </div>
    );
  }

  const handleGenerateInvoice = async () => {
    setInvoicingLoading(true);
    try {
      await createInvoice(milestone._id);
    } finally {
      setInvoicingLoading(false);
    }
  };

  const handleCompleteSimulation = async () => {
    await triggerVerification(milestone._id);
  };

  const hasReport = !!milestone.evidenceReport;
  const isAwaitingApproval = milestone.status === 'awaiting_client_approval';
  const isApproved = milestone.status === 'approved_for_invoice';
  const isPaid = milestone.status === 'paid';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={milestone.title}
        subtitle={`Milestone ID: ${milestone._id}`}
        breadcrumbs={[
          { label: 'Overview', to: `/${role}/dashboard` },
          { label: 'Milestones', to: `/${role}/milestones` },
          { label: milestone.title }
        ]}
        action={
          <div className="flex items-center gap-2">
            {role === 'client' && isAwaitingApproval && (
              <Button
                variant="primary"
                size="md"
                icon={FileCheck2}
                onClick={() => navigate(`/client/verifications?id=${milestone._id}`)}
              >
                Review Verification Dossier
              </Button>
            )}

            {role === 'client' && isApproved && (
              <Button
                variant="success"
                size="md"
                icon={Send}
                onClick={handleGenerateInvoice}
                loading={invoicingLoading}
              >
                Generate PayPal Invoice
              </Button>
            )}

            {hasReport && !isAwaitingApproval && !isApproved && (
              <Link to={`/${role}/verifications?id=${milestone._id}`}>
                <Button variant="outline" size="md" icon={ShieldCheck}>
                  View Verification Report
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Progress Timeline */}
      <MilestoneTimeline currentStatus={milestone.status} />

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deliverable Info Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400">
                  Deliverable Description
                </span>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {milestone.description}
                </p>
              </div>
              <StatusBadge status={milestone.status} size="lg" />
            </div>

            {/* GitHub Repository Bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-800">
                <GitPullRequest className="w-4 h-4 text-slate-500" />
                <span className="font-semibold">{milestone.githubRepo}</span>
              </div>
              <a
                href={`https://github.com/${milestone.githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 text-xs"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <AcceptanceCriteria
              criteria={milestone.acceptanceCriteria || []}
              readOnly={true}
            />
          </div>

          {/* Verification Status Card / Teaser */}
          {hasReport ? (
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    AI Evidence Dossier Ready
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Evaluated {milestone.evidenceReport.findings?.length} criteria against repository commits.
                  </p>
                </div>
              </div>

              <Link to={`/${role}/verifications?id=${milestone._id}`}>
                <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                  Open Dossier
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">No Verification Report Generated Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Once developer commits code to {milestone.githubRepo}, ProofPay AI runs automated evidence collection.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Sparkles}
                onClick={() => setSimulatorOpen(true)}
              >
                Simulate AI Verification Runner
              </Button>
            </div>
          )}
        </div>

        {/* Right Sidebar Details (1 col) */}
        <div className="space-y-6">
          {/* Financials Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Milestone Compensation
            </h4>

            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {formatCurrency(milestone.amount, milestone.currency)}
              </div>
              <div className="text-2xs text-slate-500 mt-0.5">PayPal Invoicing API v2</div>
            </div>

            {/* Invoicing State */}
            {milestone.paypalInvoiceId && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-2xs">
                <span className="font-bold text-slate-700 block">PayPal Invoice Reference</span>
                <span className="font-mono text-blue-600 font-semibold block truncate">
                  {milestone.paypalInvoiceId}
                </span>
                <div className="text-3xs text-slate-400 pt-1">
                  Payment Status: <strong>{isPaid ? 'PAID & CONFIRMED' : 'AWAITING PAYMENT'}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Parties */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Contract Parties
            </h4>

            {/* Client */}
            <div className="space-y-1 text-xs">
              <span className="text-3xs font-bold uppercase text-slate-400">Client (Approver)</span>
              <div className="font-semibold text-slate-900">{milestone.clientName || 'Sarah Chen'}</div>
              <div className="text-3xs text-slate-500 font-mono">{milestone.clientEmail || 'sarah.chen@fintechlabs.io'}</div>
            </div>

            {/* Developer */}
            <div className="space-y-1 text-xs pt-2 border-t border-slate-50">
              <span className="text-3xs font-bold uppercase text-slate-400">Developer (Deliverer)</span>
              <div className="font-semibold text-slate-900">{milestone.developerName || 'David Kim'}</div>
              <div className="text-3xs text-slate-500 font-mono">{milestone.developerEmail || 'david.kim@fullstack.dev'}</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs text-2xs text-slate-500 space-y-2">
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="font-mono text-slate-700">{formatDate(milestone.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Modified:</span>
              <span className="font-mono text-slate-700">{formatDateTime(milestone.updatedAt || milestone.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      <AIVerificationSimulator
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        milestone={milestone}
        onComplete={handleCompleteSimulation}
      />
    </div>
  );
}

