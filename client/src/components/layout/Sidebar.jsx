import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FolderGit2,
  PlusCircle,
  FileCheck2,
  FileText,
  CreditCard,
  History,
  Settings,
  Send,
  Sparkles,
  LogOut
} from 'lucide-react';

export default function Sidebar({ onOpenAIChat }) {
  const { role, user, logout } = useAuth();

  const clientLinks = [
    { to: '/client/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/client/milestones', label: 'All Milestones', icon: FolderGit2 },
    { to: '/client/milestones/create', label: 'Create Milestone', icon: PlusCircle },
    { to: '/client/verifications', label: 'Verification Reviews', icon: FileCheck2 },
    { to: '/client/invoices', label: 'Invoices', icon: FileText },
    { to: '/client/payments', label: 'Payments', icon: CreditCard },
    { to: '/audit', label: 'Audit History', icon: History },
    { to: '/settings', label: 'Profile & Settings', icon: Settings }
  ];

  const developerLinks = [
    { to: '/developer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/developer/milestones', label: 'Assigned Milestones', icon: FolderGit2 },
    { to: '/developer/submit', label: 'Submit Work', icon: Send },
    { to: '/developer/verifications', label: 'Verification Results', icon: FileCheck2 },
    { to: '/developer/invoices', label: 'Invoices', icon: FileText },
    { to: '/developer/payments', label: 'Payment History', icon: CreditCard },
    { to: '/audit', label: 'Audit History', icon: History },
    { to: '/settings', label: 'Profile & Settings', icon: Settings }
  ];

  const links = role === 'client' ? clientLinks : developerLinks;

  return (
    <aside className="w-64 bg-[#172554] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-blue-950/60 shadow-xl select-none">
      {/* Top Branding Section */}
      <div>
        <div className="p-5 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold tracking-tight text-base">ProofPay</span>
                <span className="text-3xs font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/20">
                  Agent 2.0
                </span>
              </div>
              <p className="text-3xs text-slate-400">Verifiable Milestone Invoicing</p>
            </div>
          </div>
        </div>

        {/* AI Agent Quick Launcher Card */}
        <div className="p-3">
          <button
            type="button"
            onClick={onOpenAIChat}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-blue-900/30 border border-blue-500/30 text-white hover:border-blue-400/60 transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">Ask ProofPay AI</div>
                <div className="text-3xs text-blue-300">Evidence inspection copilot</div>
              </div>
            </div>
            <span className="text-3xs bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded-md font-mono">
              /ai
            </span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-3xs font-bold uppercase tracking-wider text-slate-400">
            {role === 'client' ? 'Client Workspace' : 'Developer Workspace'}
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area */}
      <div className="p-4 border-t border-blue-900/40 space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-950/40 border border-blue-900/30">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover border border-blue-400/30"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-3xs text-blue-300 uppercase font-semibold">{role}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1 text-2xs text-slate-400">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <span className="text-3xs text-slate-500 font-mono">v2.0.4-hackathon</span>
        </div>
      </div>
    </aside>
  );
}
