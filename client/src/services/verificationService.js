import { apiClient, USE_MOCK_DATA } from './api';

export const verificationService = {
  async getEvidenceReport(milestoneId) {
    if (USE_MOCK_DATA) {
      // Handled via milestoneService
      return null;
    }
    const response = await apiClient.get('/milestones');
    const milestone = response.data.find(
      item => item._id === milestoneId
    );

    if (!milestone) {
      throw new Error('Milestone not found or access denied');
    }

    return milestone.evidenceReport || null;
  },

  async getRepoMetadata(owner, repo) {
    if (USE_MOCK_DATA) {
      return {
        name: repo,
        owner,
        default_branch: 'main',
        private: false,
        open_issues_count: 3,
        updated_at: new Date().toISOString()
      };
    }
    const response = await apiClient.get(`/github/${owner}/${repo}`);
    return response.data;
  },

  async getCommits(owner, repo) {
    if (USE_MOCK_DATA) {
      return [
        { sha: '8f192b1a', commit: { message: 'feat: add Zod form schema and ARIA alerts', author: { date: '2026-10-17T11:22:00Z' } } },
        { sha: 'c44199e1', commit: { message: 'fix: mobile flex wrapping and safe area padding', author: { date: '2026-10-17T15:05:00Z' } } },
        { sha: 'e2910fa0', commit: { message: 'test: add comprehensive auth form test suite', author: { date: '2026-10-18T12:00:00Z' } } }
      ];
    }
    const response = await apiClient.get(`/github/${owner}/${repo}/commits`);
    return response.data;
  }
};

