import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { FileText, ExternalLink } from 'lucide-react';
import Button from '../common/Button';

export default function InvoiceCard({ invoice, onInspect, className = '' }) {
  const isPaid = invoice.status === 'PAID';
  const isSent = invoice.status === 'SENT';

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={`text-2xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isSent
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {invoice.status}
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono">
            {formatCurrency(invoice.amount, invoice.currency)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 mb-1">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>{invoice.invoiceNumber}</span>
        </div>

        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 mb-2">
          {invoice.milestoneTitle}
        </h4>

        <div className="space-y-1.5 text-3xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex justify-between">
            <span>Recipient:</span>
            <span className="font-medium text-slate-700">{invoice.developerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice Date:</span>
            <span>{formatDate(invoice.invoiceDate)}</span>
          </div>
          {invoice.paidDate && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Paid Date:</span>
              <span>{formatDate(invoice.paidDate)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {invoice.paypalViewUrl ? (
          <a
            href={invoice.paypalViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>PayPal Sandbox View</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-3xs text-slate-400">Internal Record</span>
        )}

        <Button variant="outline" size="sm" onClick={() => onInspect(invoice)}>
          Details
        </Button>
      </div>
    </div>
  );
}
