import { apiClient, USE_MOCK_DATA } from './api';
import { MOCK_MILESTONES } from '../data/mockMilestones';

const MILESTONES_STORAGE_KEY = 'proofpay_milestones_cache';

function getStoredMilestones() {
  const cached = localStorage.getItem(MILESTONES_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(MOCK_MILESTONES));
  return [...MOCK_MILESTONES];
}

function saveStoredMilestones(milestones) {
  localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(milestones));
}

export const milestoneService = {
  async getMilestones() {
    if (USE_MOCK_DATA) {
      return getStoredMilestones();
    }
    const response = await apiClient.get('/milestones');
    return response.data;
  },

  async getMilestoneById(id) {
    if (USE_MOCK_DATA) {
      const list = getStoredMilestones();
      const item = list.find(m => m._id === id);
      if (!item) {
        throw new Error('Milestone not found');
      }
      return item;
    }
    const list = await this.getMilestones();
    const item = list.find(m => m._id === id);
    if (!item) {
      throw new Error('Milestone not found');
    }
    return item;
  },

  async createMilestone(data) {
    if (USE_MOCK_DATA) {
      const list = getStoredMilestones();
      const newMilestone = {
        _id: `ms_${Date.now()}`,
        title: data.title.trim(),
        description: data.description.trim(),
        githubRepo: data.githubRepo.trim(),
        amount: Number(data.amount),
        currency: (data.currency || 'USD').toUpperCase(),
        clientId: data.clientId || 'usr_c_01',
        clientName: data.clientName || 'Sarah Chen',
        clientEmail: data.clientEmail || 'sarah.chen@fintechlabs.io',
        developerId: data.developerId || 'usr_d_01',
        developerName: data.developerName || 'David Kim',
        developerEmail: data.developerEmail || 'david.kim@fullstack.dev',
        status: 'draft',
        paypalInvoiceId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        acceptanceCriteria: data.acceptanceCriteria.map((c, i) => ({
          _id: `crit_${Date.now()}_${i}`,
          title: c.title.trim(),
          description: c.description.trim()
        })),
        evidenceReport: null
      };

      const updated = [newMilestone, ...list];
      saveStoredMilestones(updated);
      return newMilestone;
    }

    const response = await apiClient.post('/milestones', data);
    return response.data;
  },

  async triggerVerification(id) {
    if (USE_MOCK_DATA) {
      const list = getStoredMilestones();
      const index = list.findIndex(m => m._id === id);
      if (index === -1) throw new Error('Milestone not found');

      // Set to verifying first, then generate simulated evidence
      const milestone = { ...list[index] };
      milestone.status = 'evidence_ready';
      milestone.updatedAt = new Date().toISOString();

      // Compile generated findings for acceptance criteria
      const findings = milestone.acceptanceCriteria.map((criterion, idx) => {
        // give realistic results
        const result = idx === 0 ? 'supported' : idx === 1 ? 'supported' : 'inconclusive';
        return {
          criterionId: criterion._id,
          criterionTitle: criterion.title,
          result,
          explanation: `Automated AST analysis verified commit artifacts against repository rules for "${criterion.title}".`,
          evidence: [
            {
              type: 'commit',
              title: `feat: implement ${criterion.title.toLowerCase()}`,
              url: `https://github.com/${milestone.githubRepo}/commit/a7b8c${idx}`,
              date: new Date().toISOString(),
              reference: `a7b8c${idx}`
            }
          ]
        };
      });

      milestone.evidenceReport = {
        generatedAt: new Date().toISOString(),
        repository: milestone.githubRepo,
        findings,
        limitations: [
          'Static AST analysis completed. External sandbox network requests stubbed during verification.'
        ]
      };

      list[index] = milestone;
      saveStoredMilestones(list);
      return milestone;
    }

    const response = await apiClient.post(`/milestones/${id}/verify`);
    return response.data;
  },

  async performAction(id, action, extraBody = {}) {
    if (USE_MOCK_DATA) {
      const list = getStoredMilestones();
      const index = list.findIndex(m => m._id === id);
      if (index === -1) throw new Error('Milestone not found');

      const milestone = { ...list[index] };

      // Transition handling mirroring services/milestoneState.js
      if (action === 'start_verification') {
        milestone.status = 'verifying';
      } else if (action === 'restart_verification') {
        milestone.status = 'verifying';
      } else if (action === 'request_client_approval') {
        milestone.status = 'awaiting_client_approval';
      } else if (action === 'client_approve') {
        // check for inconclusive findings acknowledgement
        const hasInconclusive = milestone.evidenceReport?.findings?.some(f => f.result === 'inconclusive');
        if (hasInconclusive && extraBody.acknowledgeInconclusive !== true) {
          const err = new Error('Some findings are inconclusive. Explicit acknowledgement is required before approval.');
          err.requiresInconclusiveAcknowledgement = true;
          throw err;
        }
        milestone.status = 'approved_for_invoice';
      } else if (action === 'request_revision') {
        milestone.status = 'needs_revision';
      }

      milestone.updatedAt = new Date().toISOString();
      list[index] = milestone;
      saveStoredMilestones(list);
      return milestone;
    }

    const response = await apiClient.patch(`/milestones/${id}/action`, {
      action,
      ...extraBody
    });
    return response.data;
  },

  async createInvoice(id) {
    if (USE_MOCK_DATA) {
      const list = getStoredMilestones();
      const index = list.findIndex(m => m._id === id);
      if (index === -1) throw new Error('Milestone not found');

      const milestone = { ...list[index] };
      if (milestone.status !== 'approved_for_invoice') {
        throw new Error('Only approved milestones can be invoiced');
      }

      const generatedInvoiceId = `INV2-SIM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      milestone.paypalInvoiceId = generatedInvoiceId;
      milestone.status = 'invoice_sent';
      milestone.updatedAt = new Date().toISOString();

      list[index] = milestone;
      saveStoredMilestones(list);

      return {
        message: 'PayPal invoice sent successfully',
        milestoneId: milestone._id,
        invoiceId: generatedInvoiceId,
        status: milestone.status
      };
    }

    const response = await apiClient.post(`/milestones/${id}/invoice`);
    return response.data;
  },

  resetMockData() {
    localStorage.removeItem(MILESTONES_STORAGE_KEY);
    return getStoredMilestones();
  }
};
