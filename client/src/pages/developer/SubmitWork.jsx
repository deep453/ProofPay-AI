import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMilestones } from '../../hooks/useMilestones';
import { useNotifications } from '../../hooks/useNotifications';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AIVerificationSimulator from '../../components/ai/AIVerificationSimulator';
import { GitBranch, GitCommit, GitPullRequest, Sparkles, ShieldCheck, CheckCircle2, FileCode } from 'lucide-react';

export default function SubmitWork() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('milestoneId');
  const { milestones, performAction, triggerVerification } = useMilestones();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const submittable = milestones.filter((m) =>
    ['draft', 'needs_revision', 'verifying', 'evidence_ready'].includes(m.status)
  );

  const [selectedMilestoneId, setSelectedMilestoneId] = useState(
    preselectedId || submittable[0]?._id || milestones[0]?._id
  );

  const targetMilestone = milestones.find((m) => m._id === selectedMilestoneId) || milestones[0];

  const [branch, setBranch] = useState('feat/resilient-implementation');
  const [commitSha, setCommitSha] = useState('8f192b1a');
  const [prUrl, setPrUrl] = useState(`https://github.com/${targetMilestone?.githubRepo || 'repo'}/pull/42`);
  const [notes, setNotes] = useState('Implemented all specified acceptance criteria with comprehensive unit tests and accessibility attributes.');
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMilestoneId) return;

    // Launch simulation & backend action
    setSimulatorOpen(true);
  };

  const handleSimulationComplete = async () => {
  setLoading(true);

  try {
    const currentStatus = targetMilestone.status;

    if (currentStatus === 'draft') {
      await performAction(
        targetMilestone._id,
        'start_verification'
      );
    } else if (
      currentStatus === 'needs_revision' ||
      currentStatus === 'blocked'
    ) {
      await performAction(
        targetMilestone._id,
        'restart_verification'
      );
    } else if (currentStatus === 'verifying') {
      // Already verifying. No additional transition required.
    } else {
      throw new Error(
        `Cannot run verification while milestone is ${currentStatus}.`
      );
    }

    await triggerVerification(targetMilestone._id);

    addToast({
      title: 'Work Submitted for AI Verification',
      message: 'Evidence collection completed. Findings dossier compiled.',
      type: 'success'
    });

    navigate(`/developer/verifications?id=${targetMilestone._id}`);

  } catch (err) {
    addToast({
      title: 'Submission Error',
      message: err.message,
      type: 'error'
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit Work for Verification"
        subtitle="Provide GitHub commits and pull requests for autonomous AI evidence evaluation."
        breadcrumbs={[
          { label: 'Overview', to: '/developer/dashboard' },
          { label: 'Submit Work' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>Select Target Milestone</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
                  Contract Deliverable
                </label>
                <select
                  value={selectedMilestoneId}
                  onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {milestones.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} — ${m.amount} USD ({m.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Acceptance Criteria Checklist Preview */}
              {targetMilestone && (
                <div className="pt-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Criteria Requiring Evidence ({targetMilestone.acceptanceCriteria?.length || 0})
                  </span>
                  <div className="space-y-2">
                    {targetMilestone.acceptanceCriteria?.map((c, i) => (
                      <div key={c._id || i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{c.title}</span>
                        </div>
                        <p className="text-slate-500 text-3xs mt-0.5">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Git Artifacts */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600" />
                <span>GitHub Evidence Coordinates</span>
              </h3>

              <Input
                label="Feature Branch Name"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="feat/your-feature-name"
                icon={GitBranch}
                required
              />

              <Input
                label="Latest Head Commit SHA"
                value={commitSha}
                onChange={(e) => setCommitSha(e.target.value)}
                placeholder="7-40 char commit hash"
                icon={GitCommit}
                required
              />

              <Input
                label="Pull Request URL"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/12"
                icon={GitPullRequest}
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
                  Developer Submission Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail changes made, benchmark results, or file paths for the AI evaluator..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Sparkles}
                loading={loading}
              >
                Submit Work & Run AI Verification
              </Button>
            </div>
          </form>
        </div>

        {/* Right Info Box (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>How AI Verification Works</span>
            </div>
            <p className="text-2xs text-indigo-900 leading-relaxed">
              When you submit your branch and PR:
            </p>
            <ol className="text-2xs text-indigo-900/90 space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>ProofPay connects to GitHub API to inspect commits and PR diffs.</li>
              <li>AST analyzer maps files and functions to acceptance criteria.</li>
              <li>Criterion findings are scored as Supported, Inconclusive, or Not Supported.</li>
              <li>A verification dossier is generated for client sign-off.</li>
            </ol>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
            <span className="text-2xs font-bold uppercase text-slate-400 block">Notice</span>
            <p className="text-slate-600 leading-relaxed">
              Developers cannot self-approve milestones or authorize PayPal invoices. Final approval remains with the client.
            </p>
          </div>
        </div>
      </div>

      <AIVerificationSimulator
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        milestone={targetMilestone}
        onComplete={handleSimulationComplete}
      />
    </div>
  );
}
