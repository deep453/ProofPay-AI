import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  CreditCard,
  ShieldCheck,
  Search,
  Clock
} from 'lucide-react';

export default function PaymentTable({ payments = [] }) {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      return [
        p.paymentReference,
        p.milestoneTitle,
        p.paypalInvoiceId,
        p.clientName,
        p.developerName
      ].some((value) => String(value || '').toLowerCase().includes(q));
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payment reference, milestone, invoice ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Payment Records</option>
          <option value="CONFIRMED">Payment Confirmed</option>
          <option value="PENDING">Pending PayPal Payment</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-3xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Payment Reference</th>
                <th className="px-5 py-3.5">Milestone</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Payment Confirmation Date</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isConfirmed = p.status === 'CONFIRMED';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>{p.paymentReference || 'Unavailable'}</span>
                      </div>
                      <div className="text-3xs text-slate-400 font-normal mt-0.5">
                        Invoice: {p.paypalInvoiceId || 'Unavailable'}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {p.milestoneTitle || 'Unavailable'}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 font-mono text-sm">
                      {formatCurrency(p.amount, p.currency)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold border ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isConfirmed ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>
                          {isConfirmed ? 'Confirmed' : 'Pending PayPal Payment'}
                        </span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {isConfirmed
                        ? (p.confirmedAt ? formatDateTime(p.confirmedAt) : 'Date unavailable')
                        : 'Awaiting PayPal confirmation'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayment(p)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-slate-500">
                    {payments.length === 0
                      ? 'No payment records are available yet.'
                      : 'No payment records match your search or filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title="PayPal Payment Record"
          subtitle="Milestone invoice payment status"
          maxWidth="max-w-xl"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-3xs font-mono uppercase tracking-wider text-slate-400 block">
                  Payment Reference
                </span>
                <span className="font-mono text-sm font-bold text-blue-300">
                  {selectedPayment.paymentReference || 'Unavailable'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white font-mono">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                <span className="text-slate-500">Associated Milestone</span>
                <span className="font-bold text-slate-900 text-right">
                  {selectedPayment.milestoneTitle || 'Unavailable'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                <span className="text-slate-500">PayPal Invoice ID</span>
                <span className="font-mono text-slate-800">
                  {selectedPayment.paypalInvoiceId || 'Unavailable'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                <span className="text-slate-500">Verification Method</span>
                <span className="font-semibold text-slate-800 text-right">
                  {selectedPayment.verificationMethod || 'Not yet confirmed'}
                </span>
              </div>
              {selectedPayment.webhookEventId && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                  <span className="text-slate-500">Webhook Event Reference</span>
                  <span className="font-mono text-3xs text-slate-600 break-all text-right">
                    {selectedPayment.webhookEventId}
                  </span>
                </div>
              )}
            </div>

            {selectedPayment.status === 'CONFIRMED' ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-2xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  PayPal invoice payment was confirmed after server-side webhook signature validation and an independent PayPal invoice status check. This confirms invoice payment; it does not represent a separate developer payout.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-2xs text-amber-900 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  This invoice has been sent, but ProofPay has not yet confirmed payment through a verified PayPal webhook and invoice status check. Do not treat it as paid.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPayment(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

