import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  UserCheck,
  Code2,
  Mail,
  Lock,
  User,
  CheckCircle2
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client'); // 'client' | 'developer'
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });
      addToast({
        title: 'Account Created',
        message: `Welcome to ProofPay, ${name}! Your ${role.toUpperCase()} account is ready.`,
        type: 'success'
      });
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Column: Dark Navy Fintech Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#172554] text-white p-12 flex-col justify-between relative overflow-hidden">
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

        <div className="relative z-10 max-w-md space-y-6 my-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Fair terms. <br />
            Verifiable delivery. <br />
            Instant PayPal settlements.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Join hundreds of engineering teams and freelancers who protect their project milestones with ProofPay AI verification and automated PayPal invoicing.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Independent AST code review against acceptance criteria</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Clients retain 100% final sign-off authority</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated PayPal Invoicing API v2 integration</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-blue-900/40 text-2xs text-slate-400">
          ProofPay Agent 2.0 • Fintech SaaS Architecture
        </div>
      </div>

      {/* Right Column: Registration Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your role and enter your details to get started.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                I want to register as a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    role === 'client'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <UserCheck className={`w-5 h-5 mb-2 ${role === 'client' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="text-xs font-bold">Client</div>
                  <div className="text-3xs text-slate-500 mt-0.5 leading-snug">
                    Manage milestones and approve completed work.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('developer')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    role === 'developer'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Code2 className={`w-5 h-5 mb-2 ${role === 'developer' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="text-xs font-bold">Developer</div>
                  <div className="text-3xs text-slate-500 mt-0.5 leading-snug">
                    Submit work and track milestone payments.
                  </div>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Chen or David Kim"
              icon={User}
              required
            />

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
              placeholder="At least 8 characters"
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              icon={Lock}
              required
            />

            <label className="flex items-start gap-2.5 text-xs text-slate-600 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <span>
                I agree to the ProofPay Terms of Service and Privacy Policy.
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Create {role === 'client' ? 'Client' : 'Developer'} Account
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
