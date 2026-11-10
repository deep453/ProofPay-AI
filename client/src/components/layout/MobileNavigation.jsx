import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { X, Sparkles, LogOut } from 'lucide-react';

export default function MobileNavigation({ isOpen, onClose, onOpenAIChat }) {
  const { role, user, logout } = useAuth();

  if (!isOpen) return null;

  const clientLinks = [
    { to: '/client/dashboard', label: 'Overview' },
    { to: '/client/milestones', label: 'All Milestones' },
    { to: '/client/milestones/create', label: 'Create Milestone' },
    { to: '/client/verifications', label: 'Verification Reviews' },
    { to: '/client/invoices', label: 'Invoices' },
    { to: '/client/payments', label: 'Payments' },
    { to: '/audit', label: 'Audit History' },
    { to: '/settings', label: 'Settings' }
  ];

  const developerLinks = [
    { to: '/developer/dashboard', label: 'Overview' },
    { to: '/developer/milestones', label: 'Assigned Milestones' },
    { to: '/developer/submit', label: 'Submit Work' },
    { to: '/developer/verifications', label: 'Verification Results' },
    { to: '/developer/invoices', label: 'Invoices' },
    { to: '/developer/payments', label: 'Payment History' },
    { to: '/audit', label: 'Audit History' },
    { to: '/settings', label: 'Settings' }
  ];

  const links = role === 'client' ? clientLinks : developerLinks;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-[#172554] text-white p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          <div className="flex items-center justify-between border-b border-blue-900/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
                P
              </div>
              <span className="font-bold text-base">ProofPay</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-blue-900/50"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAIChat();
            }}
            className="w-full mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-200 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Open AI Copilot</span>
          </button>

          <nav className="mt-6 space-y-1.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `block px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-blue-900/40 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-blue-900/50">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{user?.name}</div>
              <div className="text-3xs text-blue-300 uppercase">{role}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-2 text-xs text-rose-300 hover:text-rose-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
