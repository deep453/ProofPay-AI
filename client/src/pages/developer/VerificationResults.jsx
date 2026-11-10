import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMilestones } from '../../hooks/useMilestones';
import PageHeader from '../../components/layout/PageHeader';
import VerificationSummary from '../../components/verification/VerificationSummary';
import CriterionResult from '../../components/verification/CriterionResult';
import EvidenceDetails from '../../components/verification/EvidenceDetails';
import ApprovalPanel from '../../components/verification/ApprovalPanel';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatDate';
import { Bot, GitPullRequest } from 'lucide-react';

export default function VerificationResults() {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const { milestones } = useMilestones();

  const [selectedId, setSelectedId] = useState(
    idParam || 'ms_002_rest_api'
  );

  const currentMilestone =
    milestones.find((m) => m._id === selectedId) ||
    milestones.find((m) => !!m.evidenceReport) ||
    milestones[0];

  const report = currentMilestone?.evidenceReport;

  if (!currentMilestone) {
    return <LoadingSpinner size="lg" message="Loading verification report..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Results Dossier"
        subtitle="Review GitHub source evidence and acceptance criteria findings for your deliverables."
        breadcrumbs={[
          { label: 'Overview', to: '/developer/dashboard' },
          { label: 'Verification Results' }
        ]}
        action={
          <select
            value={currentMilestone._id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-600"
          >
            {milestones
              .filter((m) => !!m.evidenceReport)
              .map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.status})
                </option>
              ))}
          </select>
        }
      />

      {/* Banner */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-[#172554] to-indigo-950 text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-300 text-2xs font-extrabold uppercase font-mono">
              <Bot className="w-4 h-4" />
              <span>Developer AI Dossier Feedback</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{currentMilestone.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-300 font-mono mt-2">
              <span className="flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentMilestone.githubRepo}</span>
              </span>
              <span>â€¢</span>
              <span>Report Generated: {report ? formatDateTime(report.generatedAt) : 'Pending'}</span>
            </div>
          </div>

          <StatusBadge status={currentMilestone.status} size="lg" />
        </div>
      </div>

      {report ? (
        <>
          <VerificationSummary report={report} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Acceptance Criteria Inspection Breakdown
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

            <div>
              <EvidenceDetails report={report} milestone={currentMilestone} />
            </div>
          </div>

          {/* Read-only approval panel for developer */}
          <ApprovalPanel milestone={currentMilestone} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          No verification report recorded for this milestone yet. Submit work to generate report.
        </div>
      )}
    </div>
  );
}

