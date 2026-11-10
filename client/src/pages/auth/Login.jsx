import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  GitBranch,
  CreditCard
} from 'lucide-react';

export default function Login() {
  const { login, demoAccounts, switchRole } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('sarah.chen@fintechlabs.io');
  const [password, setPassword] = useState('SuperSecretPass123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      addToast({
        title: 'Welcome Back',
        message: `Signed in successfully as ${res.user.name} (${res.user.role.toUpperCase()}).`,
        type: 'success'
      });
      navigate(`/${res.user.role}/dashboard`);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role, account) => {
    setEmail(account.email);
    setPassword('DemoPassword123!');
    switchRole(role, account.id);
    addToast({
      title: 'Demo Persona Activated',
      message: `Signed in as ${account.name} (${role.toUpperCase()}).`,
      type: 'info'
    });
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Column: Dark Navy Fintech Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#172554] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">ProofPay</span>
                <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Agent 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Verifiable Milestone Invoicing Platform</p>
            </div>
          </div>
        </div>

        {/* Center Illustration & Copy */}
        <div className="relative z-10 max-w-md space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Code Verification + PayPal Automation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Proof of work verified. <br />
            Payments automated.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            ProofPay bridges the trust gap between clients and freelance engineers. Our autonomous agent evaluates GitHub commits against acceptance criteria—giving clients cryptographic assurance and developers guaranteed payout via PayPal.
          </p>

          {/* Workflow Diagram Card */}
          <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-800/60 space-y-3">
            <div className="flex items-center justify-between text-2xs text-slate-400 border-b border-blue-900/60 pb-2">
              <span className="font-mono">VERIFICATION PIPELINE</span>
              <span className="text-emerald-400 font-semibold">NON-ESCROW</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-2xs">
              <div className="p-2 rounded-xl bg-blue-900/30 border border-blue-700/30">
                <GitBranch className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                <span className="font-semibold text-white block">1. Inspect PR</span>
                <span className="text-3xs text-slate-400">AST Analysis</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-900/30 border border-blue-700/30">
                <ShieldCheck className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                <span className="font-semibold text-white block">2. Client Sign-off</span>
                <span className="text-3xs text-slate-400">Human Approval</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-900/30 border border-blue-700/30">
                <CreditCard className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                <span className="font-semibold text-white block">3. PayPal Payout</span>
                <span className="text-3xs text-slate-400">Webhook Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Trust Bar */}
        <div className="relative z-10 pt-6 border-t border-blue-900/40 flex items-center justify-between text-2xs text-slate-400">
          <span>Enterprise-grade sandbox integration</span>
          <span className="font-mono">PayPal Invoicing API v2</span>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to ProofPay</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a demo account below or enter your credentials.
            </p>
          </div>

          {/* Quick Demo Selector */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-blue-800">
                1-Click Demo Personas
              </span>
              <span className="text-3xs bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                Hackathon Ready
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('client', demoAccounts.clients[0])}
                className="p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-500 text-left transition-all shadow-2xs hover:shadow-xs group"
              >
                <div className="text-2xs font-bold text-blue-900 group-hover:text-blue-600">
                  Sarah Chen (Client)
                </div>
                <div className="text-3xs text-slate-400 truncate">FintechLabs Global</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('developer', demoAccounts.developers[0])}
                className="p-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 text-left transition-all shadow-2xs hover:shadow-xs group"
              >
                <div className="text-2xs font-bold text-indigo-900 group-hover:text-indigo-600">
                  David Kim (Developer)
                </div>
                <div className="text-3xs text-slate-400 truncate">Senior Fullstack Eng</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={Lock}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
