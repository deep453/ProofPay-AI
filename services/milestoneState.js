
const transitions = {
  draft: {
    start_verification: "verifying"
  },

  verifying: {
    evidence_ready: "evidence_ready",
    needs_revision: "needs_revision",
    block: "blocked"
  },

  evidence_ready: {
    request_client_approval: "awaiting_client_approval"
  },

  awaiting_client_approval: {
    client_approve: "approved_for_invoice",
    request_revision: "needs_revision",
    block: "blocked"
  },

  needs_revision: {
    restart_verification: "verifying"
  },

  blocked: {
    restart_verification: "verifying"
  },

  approved_for_invoice: {
    invoice_sent: "invoice_sent"
  },

  invoice_sent: {
    payment_confirmed: "paid"
  },

  paid: {}
};

function getNextStatus(currentStatus, action) {
  const nextStatus = transitions[currentStatus]?.[action];

  if (!nextStatus) {
    throw new Error(
      `Invalid transition: ${currentStatus} -> ${action}`
    );
  }

  return nextStatus;
}

module.exports = { getNextStatus };
