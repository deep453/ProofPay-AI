import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import PageHeader from '../components/layout/PageHeader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { formatDate } from '../utils/formatDate';
import { User, Mail, Building, GitBranch } from 'lucide-react';

export default function Profile() {
  const { user, role } = useAuth();
  const { addToast } = useNotifications();

  const [name, setName] = useState(user?.name || 'Sarah Chen');
  const [email, setEmail] = useState(user?.email || 'sarah.chen@fintechlabs.io');
  const [company, setCompany] = useState(user?.company || 'FintechLabs Global');
  const [github, setGithub] = useState(user?.githubUsername || 'sarah-fintech');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast({
        title: 'Profile Updated',
        message: 'Your personal information has been saved successfully.',
        type: 'success'
      });
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Personal Profile"
        subtitle="Manage your ProofPay public credentials and identity."
        breadcrumbs={[
          { label: 'Overview', to: '/' },
          { label: 'Profile' }
        ]}
      />

      {/* Header Profile Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col sm:flex-row items-center gap-5">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt={name}
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-600 shadow-sm"
        />

        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">{name}</h2>
            <span className="text-2xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{email}</p>
          <div className="text-3xs text-slate-400 mt-2 font-mono">
            Member since: {formatDate(user?.createdAt || '2026-07-15T09:00:00.000Z')}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
          Editable Account Information
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={role === 'client' ? 'Organization / Company' : 'Specialization'}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              icon={Building}
            />

            <Input
              label="GitHub Handle"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              icon={GitBranch}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" variant="primary" size="md" loading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
