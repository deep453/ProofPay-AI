import PageHeader from '../../components/layout/PageHeader';
import MilestoneForm from '../../components/milestone/MilestoneForm';

export default function CreateMilestone() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Milestone"
        subtitle="Specify acceptance criteria, assign developer, and set PayPal compensation."
        breadcrumbs={[
          { label: 'Overview', to: '/client/dashboard' },
          { label: 'Milestones', to: '/client/milestones' },
          { label: 'Create New' }
        ]}
      />

      <MilestoneForm />
    </div>
  );
}
