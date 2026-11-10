import { useState, useEffect } from 'react';
import { GitBranch, GitCommit, GitPullRequest, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const STEPS = [
  { title: 'Connecting to Repository', icon: GitBranch },
  { title: 'Fetching Commits & Hashes', icon: GitCommit },
  { title: 'Inspecting Pull Requests', icon: GitPullRequest },
  { title: 'AI Acceptance Criteria Evaluation', icon: Cpu },
  { title: 'Verification Dossier Assembled', icon: ShieldCheck }
];

export default function AIVerificationSimulator({
  isOpen,
  onClose,
  milestone,
  onComplete
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const timeouts = [];
    const stepTimes = [600, 1200, 1800, 2400, 3000];

    stepTimes.forEach((delay, index) => {
      const t = setTimeout(() => {
        if (!active) return;
        setCurrentStep(index);
        setLogs((prev) => [
          ...prev,
          `[LIVE] ${STEPS[index].title}`
        ]);
        if (index === STEPS.length - 1) {
          setIsFinished(true);
          if (onComplete) onComplete();
        }
      }, delay);
      timeouts.push(t);
    });

    return () => {
      active = false;
      timeouts.forEach(clearTimeout);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl" title="ProofPay AI Evidence Inspector">
      <div className="space-y-6">
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
            <span>TARGET REPO: {milestone?.githubRepo}</span>
            <span className="text-emerald-400 font-bold animate-pulse">● LIVE VERIFICATION</span>
          </div>

          <div className="space-y-3 pt-2">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isPast = currentStep > idx;
              const isCurrent = currentStep === idx && !isFinished;

              return (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-blue-500/20 text-blue-400 animate-spin'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold ${isPast ? 'text-slate-200' : isCurrent ? 'text-blue-300' : 'text-slate-500'}`}>
                      {s.title}
                    </div>
                  </div>
                  {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Realtime stream output */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-3xs text-slate-400 max-h-28 overflow-y-auto space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-emerald-400">
              {log}
            </div>
          ))}
          {!isFinished && <div className="text-blue-400 animate-pulse">&gt; Processing GitHub tree diffs...</div>}
        </div>

        {/* Notice */}
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            ProofPay AI analyzes evidence autonomously but does <strong>not</strong> authorize payments. The client retains final approval authority.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            size="md"
            disabled={!isFinished}
            onClick={onClose}
          >
            {isFinished ? 'View Generated Verification Report' : 'Analyzing...'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
