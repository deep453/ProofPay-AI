import { useState, useEffect, useCallback, useMemo } from 'react';
import { milestoneService } from '../services/milestoneService';
import { useNotifications } from '../hooks/useNotifications';

import { MilestoneContext } from './MilestoneContextValue';
import { useAuth } from '../hooks/useAuth';

export function MilestoneProvider({ children }) {
  const [milestones, setMilestones] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useNotifications();
  const { isAuthenticated, user } = useAuth();

  const loadMilestones = useCallback(async (isActive = () => true) => {
    try {
      const data = await milestoneService.getMilestones();
      if (!isActive()) return;
      setMilestones(data);
      setLoadedUserId(user?.id ?? null);
      setError(null);
    } catch (err) {
      if (!isActive()) return;
      setMilestones([]);
      setLoadedUserId(user?.id ?? null);
      setError(err.message || 'Failed to load milestones');
      addToast({
        title: 'Error loading milestones',
        message: err.message,
        type: 'error'
      });
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [addToast, user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        return loadMilestones(() => active);
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id, loadMilestones]);

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

  const visibleMilestones = useMemo(() => isAuthenticated && loadedUserId === user?.id ? milestones : [], [isAuthenticated, loadedUserId, user?.id, milestones]);
  const stats = useMemo(() => {
    const totalMilestones = visibleMilestones.length;
    const activeMilestones = visibleMilestones.filter((m) =>
      ['draft', 'verifying', 'evidence_ready', 'awaiting_client_approval', 'approved_for_invoice', 'invoice_sent'].includes(m.status)
    ).length;
    const pendingApprovals = visibleMilestones.filter((m) => m.status === 'awaiting_client_approval').length;
    const invoicesSent = visibleMilestones.filter((m) => m.status === 'invoice_sent').length;
    const paidMilestones = visibleMilestones.filter((m) => m.status === 'paid');
    const paymentsReceived = paidMilestones.length;
    const totalAmountPaid = paidMilestones.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const awaitingVerification = visibleMilestones.filter((m) => m.status === 'verifying').length;
    const needsRevisionCount = visibleMilestones.filter((m) => m.status === 'needs_revision').length;

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
  }, [visibleMilestones]);

  const value = {
    milestones: visibleMilestones,
    loading: isAuthenticated && (loading || loadedUserId !== user?.id),
    error,
    refreshMilestones: async () => {
      setLoading(true);
      await loadMilestones();
    },
    createMilestone,
    triggerVerification,
    performAction,
    createInvoice,
    resetMockData,
    stats
  };

  return <MilestoneContext.Provider value={value}>{children}</MilestoneContext.Provider>;
}
