import { Link } from 'react-router-dom';
import { useMilestones } from '../../hooks/useMilestones';
import PageHeader from '../../components/layout/PageHeader';
import MilestoneTable from '../../components/milestone/MilestoneTable';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import { PlusCircle } from 'lucide-react';

export default function Milestones() {
  const { milestones, loading } = useMilestones();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Milestones"
        subtitle="Manage verifiable engineering deliverables and track AI evidence evaluations."
        breadcrumbs={[
          { label: 'Overview', to: '/client/dashboard' },
          { label: 'Milestones' }
        ]}
        action={
          <Link to="/client/milestones/create">
            <Button variant="primary" size="md" icon={PlusCircle}>
              Create Milestone
            </Button>
          </Link>
        }
      />

      {loading && milestones.length === 0 ? (
        <Skeleton variant="table-row" count={5} />
      ) : (
        <MilestoneTable milestones={milestones} />
      )}
    </div>
  );
}
