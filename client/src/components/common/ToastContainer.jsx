import { useNotifications } from "../../hooks/useNotifications";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    error: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = iconMap[toast.type] || iconMap.info;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-white shadow-xl transition-all duration-200 animate-in slide-in-from-bottom-3 ${style.border}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${style.bg} ${style.color}`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>}
              {toast.message && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
