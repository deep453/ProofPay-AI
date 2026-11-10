import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary' | 'success'
  loading = false,
  children
}) {
  const iconConfig = {
    danger: { icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    warning: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    primary: { icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    success: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
  };

  const currentIcon = iconConfig[variant] || iconConfig.primary;
  const Icon = currentIcon.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl border shrink-0 ${currentIcon.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'warning' ? 'secondary' : variant}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
