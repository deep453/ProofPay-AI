import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Send,
  Lock
} from 'lucide-react';

export default function ApprovalPanel({
  milestone,
  onApprove,
  onRequestRevision,
  isApproving = false,
  isRevising = false,
  className = ''
}) {
  const { role } = useAuth();
  const [acknowledged, setAcknowledged] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const findings = milestone?.evidenceReport?.findings || [];
  const hasInconclusive = findings.some((f) => f.result === 'inconclusive');
  const hasNotSupported = findings.some((f) => f.result === 'not_supported');

  const canApprove = !hasInconclusive || acknowledged;

  const handleConfirmApproval = () => {
    if (!canApprove) return;
    onApprove({ acknowledgeInconclusive: hasInconclusive ? true : undefined });
  };

  const handleConfirmRevision = () => {
    onRequestRevision({ notes: revisionNotes });
    setRevisionModalOpen(false);
  };

  // If user is developer: read-only presentation
  if (role !== 'client') {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Client Approval Authorization</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Only the authenticated client ({milestone?.clientName || 'Client'}) can approve milestones or authorize PayPal invoices.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If milestone is already approved or invoiced or paid
  if (['approved_for_invoice', 'invoice_sent', 'paid'].includes(milestone.status)) {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-2xs ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Milestone Already Approved</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              This milestone was reviewed and approved for invoicing. Current status: <strong className="uppercase font-mono">{milestone.status.replace(/_/g, ' ')}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div>
          <span className="text-2xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Human-In-The-Loop Decision
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1.5">
            Client Milestone Review & Invoicing Authorization
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            AI findings are advisory evidence checks. Your explicit client sign-off is required before any PayPal invoice can be created.
          </p>
        </div>
      </div>

      {/* Inconclusive Warning Box */}
      {hasInconclusive && (
        <div className="mb-5 p-4 rounded-xl border border-amber-200 bg-amber-50/80 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Mandatory Acknowledgement: Inconclusive Evidence Detected
              </h4>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                One or more criteria could not be fully verified autonomously by the AI inspection agent. You must acknowledge this uncertainty before approving this milestone for PayPal invoice generation.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2.5 pt-2 border-t border-amber-200/70 text-xs font-semibold text-amber-950 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 rounded border-amber-300 text-blue-600 focus:ring-blue-500"
            />
            <span>I have inspected the inconclusive findings and approve advancing to invoice.</span>
          </label>
        </div>
      )}

      {/* Not Supported Warning */}
      {hasNotSupported && (
        <div className="mb-5 p-3.5 rounded-xl border border-rose-200 bg-rose-50/80 flex items-start gap-2.5 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Notice:</strong> One or more criteria failed to pass code verification. You may request revision from the developer before authorizing payment.
          </p>
        </div>
      )}

      {/* Decision Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => setRevisionModalOpen(true)}
          disabled={isApproving || isRevising}
          className="text-slate-700 border-slate-300 hover:bg-slate-50"
        >
          Request Revision
        </Button>

        <Button
          variant="primary"
          size="md"
          icon={Send}
          onClick={handleConfirmApproval}
          disabled={!canApprove || isApproving || isRevising}
          loading={isApproving}
        >
          Approve for Invoice
        </Button>
      </div>

      {/* Revision Modal */}
      <Modal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        title="Request Developer Revision"
        subtitle="Explain what modifications are required to satisfy the acceptance criteria."
      >
        <div className="space-y-4">
          <textarea
            rows={4}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="e.g. Please optimize MongoDB query projections and re-run latency benchmark under 25ms..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRevisionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" onClick={handleConfirmRevision} loading={isRevising}>
              Submit Revision Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
