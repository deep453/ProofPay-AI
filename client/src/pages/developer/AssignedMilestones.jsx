import { useMilestones } from '../../hooks/useMilestones';
import PageHeader from '../../components/layout/PageHeader';
import MilestoneTable from '../../components/milestone/MilestoneTable';
import Skeleton from '../../components/common/Skeleton';

export default function AssignedMilestones() {
  const { milestones, loading } = useMilestones();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Milestones"
        subtitle="Review active contract deliverables, requirements, and verification statuses."
        breadcrumbs={[
          { label: 'Overview', to: '/developer/dashboard' },
          { label: 'Assigned Milestones' }
        ]}
      />

      {loading && milestones.length === 0 ? (
        <Skeleton variant="table-row" count={5} />
      ) : (
        <MilestoneTable milestones={milestones} />
      )}
    </div>
  );
}
