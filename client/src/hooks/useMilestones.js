import { useContext } from 'react';
import { MilestoneContext } from '../context/MilestoneContextValue';

export function useMilestones() {
  const context = useContext(MilestoneContext);
  if (!context) {
    throw new Error('useMilestones must be used within MilestoneProvider');
  }
  return context;
}
