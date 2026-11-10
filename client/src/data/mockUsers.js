export const MOCK_CLIENTS = [
  {
    id: 'usr_c_01',
    name: 'Sarah Chen',
    email: 'sarah.chen@fintechlabs.io',
    role: 'client',
    company: 'FintechLabs Global',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-12T10:00:00.000Z',
    activeMilestones: 3,
    totalPaid: 650.00
  },
  {
    id: 'usr_c_02',
    name: 'Alex Mercer',
    email: 'alex.mercer@cloudscale.co',
    role: 'client',
    company: 'CloudScale Technologies',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T08:30:00.000Z',
    activeMilestones: 2,
    totalPaid: 1200.00
  }
];

export const MOCK_DEVELOPERS = [
  {
    id: 'usr_d_01',
    name: 'David Kim',
    email: 'david.kim@fullstack.dev',
    role: 'developer',
    githubUsername: 'davidkim-code',
    title: 'Senior Fullstack Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-15T09:15:00.000Z',
    completedMilestones: 8,
    totalEarned: 3850.00
  },
  {
    id: 'usr_d_02',
    name: 'Elena Rostova',
    email: 'elena.rostova@systems.io',
    role: 'developer',
    githubUsername: 'erostova-dev',
    title: 'Distributed Systems & Backend Specialist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-01T11:45:00.000Z',
    completedMilestones: 5,
    totalEarned: 2450.00
  }
];

export const ALL_USERS = [...MOCK_CLIENTS, ...MOCK_DEVELOPERS];

export const DEFAULT_CLIENT = MOCK_CLIENTS[0];
export const DEFAULT_DEVELOPER = MOCK_DEVELOPERS[0];
