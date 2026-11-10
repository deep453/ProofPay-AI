import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { CheckCircle2, Clock } from 'lucide-react';

export default function PaymentCard({ payment, onInspect, className = '' }) {
  const isConfirmed = payment.status === 'CONFIRMED';

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold border ${
              isConfirmed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isConfirmed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            <span>{isConfirmed ? 'Confirmed' : 'Pending Settlement'}</span>
          </span>

          <span className="text-base font-extrabold text-slate-900 font-mono">
            {formatCurrency(payment.amount, payment.currency)}
          </span>
        </div>

        <div className="font-mono text-xs font-bold text-slate-800 mb-1">
          {payment.paymentReference}
        </div>

        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 mb-2">
          {payment.milestoneTitle}
        </h4>

        <div className="space-y-1.5 text-3xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex justify-between">
            <span>Method:</span>
            <span className="font-medium text-slate-700">{payment.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Confirmation:</span>
            <span>{isConfirmed ? formatDate(payment.confirmedAt) : 'Awaiting Webhook'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-3xs text-slate-400 font-mono truncate max-w-[150px]">
          {payment.paypalInvoiceId}
        </span>
        <button
          type="button"
          onClick={() => onInspect(payment)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          View Receipt
        </button>
      </div>
    </div>
  );
}
