import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMilestones } from '../hooks/useMilestones';
import { useNotifications } from '../hooks/useNotifications';
import { USE_MOCK_DATA } from '../services/api';
import PageHeader from '../components/layout/PageHeader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import {
  ShieldCheck,
  Lock,
  GitBranch,
  CreditCard,
  RotateCcw,
  LogOut,
  CheckCircle2
} from 'lucide-react';

export default function Settings() {
  const { logout } = useAuth();
  const { resetMockData } = useMilestones();
  const { addToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('integrations'); // 'integrations' | 'security' | 'demo'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast({
        title: 'Validation Error',
        message: 'New password must be at least 8 characters.',
        type: 'error'
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast({
        title: 'Validation Error',
        message: 'Passwords do not match.',
        type: 'error'
      });
      return;
    }

    setPasswordUpdating(true);
    setTimeout(() => {
      setPasswordUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      addToast({
        title: 'Demo Simulation',
        message: 'Demo only: password change simulated; no account password was changed.',
        type: 'success'
      });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Settings & System Integrations"
        subtitle="Manage platform connectivity, security, and demonstration controls."
        breadcrumbs={[
          { label: 'Overview', to: '/' },
          { label: 'Settings' }
        ]}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Integration Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Authentication</span>
        </button>

        {USE_MOCK_DATA && (
        <button
          type="button"
          onClick={() => setActiveTab('demo')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'demo'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Hackathon Demo Controls</span>
        </button>
        )}
      </div>

      {/* Tab: Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* GitHub Telemetry Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 text-white">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">GitHub API Integration</h3>
                  <p className="text-xs text-slate-500">Autonomous AST code inspection agent connection</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected & Verified</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">API Endpoint</span>
                <span className="font-mono text-slate-800">https://api.github.com</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Active Repositories</span>
                <span className="font-mono text-slate-800">fintechlabs/proofpay-core, cloudscale/identity-gateway</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Security Credentials</span>
                <span className="text-slate-600 font-mono text-3xs">Managed server-side (Zero frontend exposure)</span>
              </div>
            </div>
          </div>

          {/* PayPal Sandbox Telemetry Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">PayPal Invoicing API v2</h3>
                  <p className="text-xs text-slate-500">Automated invoice dispatch & webhook settlement</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Sandbox Operational</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">PayPal Environment</span>
                <span className="font-mono text-slate-800">https://api-m.sandbox.paypal.com</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Webhook Event Listener</span>
                <span className="font-mono text-slate-800">INVOICING.INVOICE.PAID</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Signature Verification</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CRC32 & RSA Public Cert
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Credentials Safeguard</span>
                <span className="text-slate-600 font-mono text-3xs">PayPal secrets strictly stored in backend .env</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && !USE_MOCK_DATA && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Password changes unavailable</h3>
          <p className="text-xs text-slate-600">
            The backend does not currently provide a password-change endpoint.
            No password has been changed. Registration and sign-in are available.
          </p>
        </div>
      )}
      {/* Tab: Security */}
      {activeTab === 'security' && USE_MOCK_DATA && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Password & Session Hardening</h3>
            <p className="text-xs text-slate-500">Demo-only form: password changes are simulated and are not saved.</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              icon={Lock}
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              icon={Lock}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              icon={Lock}
              required
            />

            <Button type="submit" variant="primary" size="md" loading={passwordUpdating}>
              Update Password
            </Button>
          </form>
        </div>
      )}

      {/* Tab: Demo Controls */}
      {USE_MOCK_DATA && activeTab === 'demo' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Hackathon Demonstration Utilities</h3>
            <p className="text-xs text-slate-500">Manage mock datasets, reset milestone lifecycle states, and review test coverage.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Restore Default Mock Data</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Resets the 5 test milestones (Login Page Implementation, REST API Integration, Dashboard Redesign, Authentication Module, Database Optimization) to their pristine starting states.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={resetMockData}
            >
              Reset All Milestone States
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Sign out of current demonstration session:
            </div>
            <Button variant="danger" size="sm" icon={LogOut} onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
