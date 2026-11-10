import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import Modal from '../common/Modal';
import { invoiceService } from '../../services/invoiceService';
import Button from '../common/Button';
import {
  FileText,
  ExternalLink,
  Search,
  ShieldCheck
} from 'lucide-react';

export default function InvoiceTable({ invoices = [] }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingPayPalLink, setLoadingPayPalLink] = useState(false);
  const [paypalLinkError, setPaypalLinkError] = useState('');

  const handleRetrievePayPalLink = async () => {
    if (!selectedInvoice?.milestoneId) {
      setPaypalLinkError('Milestone reference is unavailable.');
      return;
    }

    setLoadingPayPalLink(true);
    setPaypalLinkError('');

    try {
      const details = await invoiceService.getPayPalInvoiceDetails(
        selectedInvoice.milestoneId
      );

      if (!details.invoiceUrl) {
        setPaypalLinkError('PayPal has not returned a viewable invoice link.');
        return;
      }

      setSelectedInvoice((current) => ({
        ...current,
        paypalViewUrl: details.invoiceUrl
      }));
    } catch (error) {
      setPaypalLinkError(
        error.message || 'Unable to retrieve the PayPal invoice link.'
      );
    } finally {
      setLoadingPayPalLink(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.milestoneTitle.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        inv.developerName.toLowerCase().includes(q) ||
        (inv.paypalInvoiceId && inv.paypalInvoiceId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number, milestone, recipient..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Invoicing States</option>
          <option value="SENT">Sent (Awaiting Payment)</option>
          <option value="PAID">Paid & Confirmed</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-3xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Milestone</th>
                <th className="px-5 py-3.5">Client & Developer</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Invoice Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{inv.invoiceNumber}</span>
                    </div>
                    {inv.paypalInvoiceId && (
                      <div className="text-3xs text-slate-400 font-normal mt-0.5 truncate max-w-[140px]">
                        {inv.paypalInvoiceId}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {inv.milestoneTitle}
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-slate-800 font-medium">To: {inv.clientName}</div>
                    <div className="text-3xs text-slate-400">By: {inv.developerName}</div>
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(inv.amount, inv.currency)}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {inv.invoiceDate ? formatDate(inv.invoiceDate) : 'â€”'}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold border ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : inv.status === 'SENT'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          inv.status === 'PAID' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      />
                      <span>{inv.status}</span>
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      View Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle="Official ProofPay PayPal Disbursement Record"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {selectedInvoice.invoiceNumber}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  PayPal ID: {selectedInvoice.paypalInvoiceId || 'Pending'}
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedInvoice.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedInvoice.status === 'PAID' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  />
                  <span>Status: {selectedInvoice.status}</span>
                </span>
                <div className="text-3xs text-slate-400 mt-1">
                  Issued on {selectedInvoice.invoiceDate ? formatDateTime(selectedInvoice.invoiceDate) : 'Date unavailable'}
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">
                  Billed To (Client)
                </span>
                <div className="font-bold text-slate-900">{selectedInvoice.clientName}</div>
                <div className="text-slate-500">{selectedInvoice.clientEmail}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">
                  Payable To (Developer)
                </span>
                <div className="font-bold text-slate-900">{selectedInvoice.developerName}</div>
                <div className="text-slate-500">{selectedInvoice.developerEmail}</div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-600 border-b border-slate-200 flex justify-between">
                <span>Milestone Deliverable</span>
                <span>Amount</span>
              </div>
              <div className="p-4 flex justify-between items-center bg-white">
                <div>
                  <div className="font-bold text-slate-900">{selectedInvoice.milestoneTitle}</div>
                  <div className="text-slate-500 text-3xs mt-0.5">
                    Verified milestone proof of work
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-900 text-base">
                  {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                </div>
              </div>
            </div>

            {/* Settlement telemetry */}
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-2xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Fintech Verification Notice</span>
              </div>
              <p className="leading-relaxed">
                Dispatching an invoice does not confirm payment. ProofPay confirms payment solely upon verified PayPal webhook delivery and independent server status check.
              </p>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {selectedInvoice.paypalViewUrl ? (
                <a
                  href={selectedInvoice.paypalViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <span>Open PayPal Sandbox View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="flex flex-col items-start gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetrievePayPalLink}
                    disabled={loadingPayPalLink}
                  >
                    {loadingPayPalLink ? 'Retrieving link...' : 'Retrieve PayPal Link'}
                  </Button>
                  {paypalLinkError && (
                    <span className="text-3xs text-red-600">
                      {paypalLinkError}
                    </span>
                  )}
                </div>
              )}

              <Button variant="secondary" size="sm" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

