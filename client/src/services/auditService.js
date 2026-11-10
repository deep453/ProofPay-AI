import { apiClient, USE_MOCK_DATA } from './api';
import { MOCK_AUDIT_EVENTS } from '../data/mockActivity';

export const auditService = {
  async getAuditEvents(filters = {}) {
    let events;

    if (USE_MOCK_DATA) {
      events = [...MOCK_AUDIT_EVENTS];
    } else {
      const response = await apiClient.get('/audit');
      events = response.data;
    }

    if (filters.category && filters.category !== 'all') {
      events = events.filter(e => e.category === filters.category);
    }

    if (filters.milestoneId && filters.milestoneId !== 'all') {
      events = events.filter(e => e.milestoneId === filters.milestoneId);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();

      events = events.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.actor || '').toLowerCase().includes(q) ||
        (e.referenceId || '').toLowerCase().includes(q) ||
        (e.paypalInvoiceId || '').toLowerCase().includes(q) ||
        (e.milestoneTitle || '').toLowerCase().includes(q)
      );
    }

    return events;
  }
};
