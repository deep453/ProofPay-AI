// Status configuration matching backend models and state transitions exactly

export const MILESTONE_STATUSES = {
  DRAFT: 'draft',
  VERIFYING: 'verifying',
  EVIDENCE_READY: 'evidence_ready',
  AWAITING_CLIENT_APPROVAL: 'awaiting_client_approval',
  APPROVED_FOR_INVOICE: 'approved_for_invoice',
  INVOICE_SENT: 'invoice_sent',
  PAID: 'paid',
  NEEDS_REVISION: 'needs_revision',
  BLOCKED: 'blocked'
};

export const STATUS_CONFIG = {
  [MILESTONE_STATUSES.DRAFT]: {
    label: 'Draft',
    color: 'slate',
    bgClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-500',
    description: 'Milestone created and awaiting developer work submission.',
    stepIndex: 0
  },
  [MILESTONE_STATUSES.VERIFYING]: {
    label: 'Verifying',
    color: 'blue',
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
    dotClass: 'bg-blue-500',
    description: 'AI Agent is actively inspecting repository commits and PRs.',
    stepIndex: 1
  },
  [MILESTONE_STATUSES.EVIDENCE_READY]: {
    label: 'Evidence Ready',
    color: 'indigo',
    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
    description: 'Evidence collected and report compiled. Awaiting formal submission to client.',
    stepIndex: 2
  },
  [MILESTONE_STATUSES.AWAITING_CLIENT_APPROVAL]: {
    label: 'Awaiting Approval',
    color: 'amber',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    description: 'Client review required. Evaluation findings ready for human sign-off.',
    stepIndex: 3
  },
  [MILESTONE_STATUSES.APPROVED_FOR_INVOICE]: {
    label: 'Approved for Invoice',
    color: 'emerald',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    description: 'Client approved milestone. Ready for PayPal invoice generation.',
    stepIndex: 4
  },
  [MILESTONE_STATUSES.INVOICE_SENT]: {
    label: 'Invoice Sent',
    color: 'purple',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
    description: 'PayPal invoice delivered to client. Awaiting independent payment confirmation.',
    stepIndex: 5
  },
  [MILESTONE_STATUSES.PAID]: {
    label: 'Paid',
    color: 'teal',
    bgClass: 'bg-teal-50 text-teal-700 border-teal-200',
    dotClass: 'bg-teal-500',
    description: 'PayPal webhook verified and payment confirmed on ledger.',
    stepIndex: 6
  },
  [MILESTONE_STATUSES.NEEDS_REVISION]: {
    label: 'Needs Revision',
    color: 'rose',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    description: 'Client or AI flagged items requiring code revisions before invoice.',
    stepIndex: -1
  },
  [MILESTONE_STATUSES.BLOCKED]: {
    label: 'Blocked',
    color: 'red',
    bgClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
    description: 'Blocked due to verification failure or missing repository permissions.',
    stepIndex: -1
  }
};

export const WORKFLOW_STEPS = [
  { id: 'draft', label: 'Draft' },
  { id: 'verifying', label: 'Verifying' },
  { id: 'evidence_ready', label: 'Evidence Ready' },
  { id: 'awaiting_client_approval', label: 'Awaiting Approval' },
  { id: 'approved_for_invoice', label: 'Approved' },
  { id: 'invoice_sent', label: 'Invoice Sent' },
  { id: 'paid', label: 'Paid' }
];

export const INVOICE_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', bgClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SENT: { label: 'Sent', bgClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  PAID: { label: 'Paid', bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', bgClass: 'bg-rose-50 text-rose-700 border-rose-200' }
};

export const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pending Confirmation', bgClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Payment Confirmed', bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FAILED: { label: 'Failed / Unverified', bgClass: 'bg-rose-50 text-rose-700 border-rose-200' }
};
