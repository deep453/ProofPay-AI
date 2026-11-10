import { useState, useEffect, useCallback, useMemo } from 'react';
import { milestoneService } from '../services/milestoneService';
import { useNotifications } from '../hooks/useNotifications';

import { MilestoneContext } from './MilestoneContextValue';

export function MilestoneProvider({ children }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useNotifications();

  const loadMilestones = useCallback(async () => {
    try {
      const data = await milestoneService.getMilestones();
      setMilestones(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load milestones');
      addToast({
        title: 'Error loading milestones',
        message: err.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    let active = true;
    milestoneService.getMilestones().then((data) => {
      if (active) {
        setMilestones(data);
        setLoading(false);
      }
    }).catch((err) => {
      if (active) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const createMilestone = async (milestoneData) => {
    setLoading(true);
    try {
      const created = await milestoneService.createMilestone(milestoneData);
      setMilestones((prev) => [created, ...prev]);
      addToast({
        title: 'Milestone Created',
        message: `"${created.title}" successfully created.`,
        type: 'success'
      });
      return created;
    } catch (err) {
      addToast({
        title: 'Failed to create milestone',
        message: err.message,
        type: 'error'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const triggerVerification = async (id) => {
    try {
      const updated = await milestoneService.triggerVerification(id);
      setMilestones((prev) => prev.map((m) => (m._id === id ? updated : m)));
      addToast({
        title: 'Verification Complete',
        message: 'AI Evidence Report successfully generated.',
        type: 'success'
      });
      return updated;
    } catch (err) {
      addToast({
        title: 'Verification failed',
        message: err.message,
        type: 'error'
      });
      throw err;
    }
  };

  const performAction = async (id, action, extra = {}) => {
    try {
      const updated = await milestoneService.performAction(id, action, extra);
      setMilestones((prev) => prev.map((m) => (m._id === id ? updated : m)));
      
      const actionLabels = {
        client_approve: 'Approved for Invoicing',
        request_revision: 'Revision Requested',
        request_client_approval: 'Submitted to Client for Approval',
        start_verification: 'Verification Initiated',
        restart_verification: 'Re-verification Initiated'
      };

      addToast({
        title: actionLabels[action] || 'Action Successful',
        message: `Milestone status updated to ${updated.status}.`,
        type: action === 'request_revision' ? 'warning' : 'success'
      });
      return updated;
    } catch (err) {
      addToast({
        title: 'Action Error',
        message: err.message,
        type: 'error'
      });
      throw err;
    }
  };

  const createInvoice = async (id) => {
    try {
      const result = await milestoneService.createInvoice(id);
      setMilestones((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: result.status, paypalInvoiceId: result.invoiceId } : m))
      );
      addToast({
        title: 'PayPal Invoice Dispatched',
        message: `Invoice #${result.invoiceId} generated and delivered via PayPal.`,
        type: 'success'
      });
      return result;
    } catch (err) {
      addToast({
        title: 'Invoicing Failed',
        message: err.message,
        type: 'error'
      });
      throw err;
    }
  };

  const resetMockData = () => {
    const fresh = milestoneService.resetMockData();
    setMilestones(fresh);
    addToast({
      title: 'Demo Data Reset',
      message: 'Milestones restored to original demonstration state.',
      type: 'info'
    });
  };

  const stats = useMemo(() => {
    const totalMilestones = milestones.length;
    const activeMilestones = milestones.filter((m) =>
      ['draft', 'verifying', 'evidence_ready', 'awaiting_client_approval', 'approved_for_invoice', 'invoice_sent'].includes(m.status)
    ).length;
    const pendingApprovals = milestones.filter((m) => m.status === 'awaiting_client_approval').length;
    const invoicesSent = milestones.filter((m) => m.status === 'invoice_sent').length;
    const paidMilestones = milestones.filter((m) => m.status === 'paid');
    const paymentsReceived = paidMilestones.length;
    const totalAmountPaid = paidMilestones.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const awaitingVerification = milestones.filter((m) => m.status === 'verifying').length;
    const needsRevisionCount = milestones.filter((m) => m.status === 'needs_revision').length;

    return {
      totalMilestones,
      activeMilestones,
      pendingApprovals,
      invoicesSent,
      paymentsReceived,
      totalAmountPaid,
      awaitingVerification,
      needsRevisionCount,
      totalEarned: totalAmountPaid
    };
  }, [milestones]);

  const value = {
    milestones,
    loading,
    error,
    refreshMilestones: loadMilestones,
    createMilestone,
    triggerVerification,
    performAction,
    createInvoice,
    resetMockData,
    stats
  };

  return <MilestoneContext.Provider value={value}>{children}</MilestoneContext.Provider>;
}
