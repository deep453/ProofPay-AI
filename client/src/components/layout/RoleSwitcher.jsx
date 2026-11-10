import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, ArrowRightLeft } from 'lucide-react';

export default function RoleSwitcher() {
  const { user, role, switchRole, demoAccounts } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (newRole, userId) => {
    switchRole(newRole, userId);
    setIsOpen(false);
    if (newRole === 'client') {
      navigate('/client/dashboard');
    } else {
      navigate('/developer/dashboard');
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 transition-colors shadow-2xs text-xs font-medium"
      >
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        <span className="font-semibold uppercase tracking-wider text-2xs text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-md">
          {role}
        </span>
        <span className="max-w-[120px] truncate font-medium text-slate-800">{user?.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-blue-700" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3 h-3" /> Demo Mode Role Switcher
            </span>
            <span className="text-2xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          {/* Client Accounts */}
          <div className="pt-2">
            <div className="px-3 py-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
              Client Accounts (Milestone Creators & Approvers)
            </div>
            {demoAccounts.clients.map((c) => {
              const isSelected = user?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectRole('client', c.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                    <div className="truncate">
                      <div className="text-slate-900 font-medium">{c.name}</div>
                      <div className="text-2xs text-slate-400">{c.company}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Developer Accounts */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <div className="px-3 py-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
              Developer Accounts (Work Submissions)
            </div>
            {demoAccounts.developers.map((d) => {
              const isSelected = user?.id === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectRole('developer', d.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                    isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={d.avatar} alt={d.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                    <div className="truncate">
                      <div className="text-slate-900 font-medium">{d.name}</div>
                      <div className="text-2xs text-slate-400">@{d.githubUsername}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 mt-2 bg-slate-50/50 rounded-xl">
            <p className="text-2xs text-slate-500 leading-relaxed">
              Switching roles updates navigation permissions and visible approval actions immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
