import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMilestones } from '../../hooks/useMilestones';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/layout/PageHeader';
import VerificationSummary from '../../components/verification/VerificationSummary';
import CriterionResult from '../../components/verification/CriterionResult';
import EvidenceDetails from '../../components/verification/EvidenceDetails';
import ApprovalPanel from '../../components/verification/ApprovalPanel';
import StatusBadge from '../../components/common/StatusBadge';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatDate';
import { ShieldCheck, Bot, GitPullRequest, AlertTriangle } from 'lucide-react';

export default function VerificationReview() {
  const [searchParams] = useSearchParams();
  const milestoneIdParam = searchParams.get('id');
  const { milestones, performAction } = useMilestones();
  const { role } = useAuth();
  const navigate = useNavigate();

  // Find target milestone: either specified by query param or default to the one awaiting approval
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(
    milestoneIdParam || 'ms_002_rest_api'
  );

  const [isApproving, setIsApproving] = useState(false);
  const [isRevising, setIsRevising] = useState(false);

  const currentMilestone =
    milestones.find((m) => m._id === selectedMilestoneId) ||
    milestones.find((m) => !!m.evidenceReport) ||
    milestones[0];

  const report = currentMilestone?.evidenceReport;

  const handleApprove = async ({ acknowledgeInconclusive }) => {
    setIsApproving(true);
    try {
      await performAction(currentMilestone._id, 'client_approve', {
        acknowledgeInconclusive
      });
      navigate(`/client/milestones/${currentMilestone._id}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevision = async ({ notes }) => {
    setIsRevising(true);
    try {
      await performAction(currentMilestone._id, 'request_revision', { notes });
      navigate(`/client/milestones/${currentMilestone._id}`);
    } finally {
      setIsRevising(false);
    }
  };

  if (!currentMilestone) {
    return <LoadingSpinner size="lg" message="Loading AI verification report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="AI Evidence Verification Workspace"
        subtitle="GitHub source evidence review against milestone acceptance criteria"
        breadcrumbs={[
          { label: 'Overview', to: `/${role}/dashboard` },
          { label: 'Milestones', to: `/${role}/milestones` },
          { label: currentMilestone.title, to: `/${role}/milestones/${currentMilestone._id}` },
          { label: 'Verification Dossier' }
        ]}
        action={
          <div className="flex items-center gap-2">
            {/* Milestone selector for demo reviewer */}
            <select
              value={currentMilestone._id}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-2xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              {milestones
                .filter((m) => !!m.evidenceReport)
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} ({m.status})
                  </option>
                ))}
            </select>
          </div>
        }
      />

      {/* Top Banner: Verification Report Metadata */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-900 to-[#172554] text-white p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-blue-500/30 text-blue-300">
                <Bot className="w-4 h-4" />
              </span>
              <span className="text-2xs font-extrabold uppercase tracking-wider text-blue-300 font-mono">
                ProofPay Agent 2.0 Evaluation Dossier
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentMilestone.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentMilestone.githubRepo}</span>
              </span>
              <span>â€¢</span>
              <span>
                Generated: {report ? formatDateTime(report.generatedAt) : 'Pending'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={currentMilestone.status} size="lg" />
          </div>
        </div>

        {/* Advisory Safeguard Disclaimer */}
        <div className="mt-5 pt-4 border-t border-blue-800/60 flex items-center gap-2 text-2xs text-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />
          <span>
            <strong>Human Approval Required:</strong> AI findings are evidence-based assessments. They do not independently approve work or authorize payments.
          </span>
        </div>
      </div>

      {report ? (
        <>
          {/* Summary Metric Cards */}
          <VerificationSummary report={report} />

          {/* Main 2-Column Evaluation Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (approx 65% width): Acceptance Criteria Findings */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Acceptance Criteria Verification Breakdown</span>
                  <span className="text-xs text-slate-500 font-normal">
                    ({report.findings.length} evaluated)
                  </span>
                </h3>
              </div>

              <div className="space-y-4">
                {report.findings.map((finding, idx) => {
                  const matchingCriterion = currentMilestone.acceptanceCriteria?.find(
                    (c) => c._id === finding.criterionId
                  );

                  return (
                    <CriterionResult
                      key={finding.criterionId || idx}
                      finding={finding}
                      criterionDescription={matchingCriterion?.description}
                      index={idx}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right Column (approx 35% width): Telemetry, Timeline, Limitations */}
            <div>
              <EvidenceDetails report={report} milestone={currentMilestone} />
            </div>
          </div>

          {/* Bottom Approval Decision Panel */}
          <ApprovalPanel
            milestone={currentMilestone}
            onApprove={handleApprove}
            onRequestRevision={handleRequestRevision}
            isApproving={isApproving}
            isRevising={isRevising}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Verification Report Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This milestone has not yet undergone AI evidence collection. Once the developer submits code, the verification dossier will be rendered here.
          </p>
        </div>
      )}
    </div>
  );
}

