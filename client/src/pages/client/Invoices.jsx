import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import PageHeader from '../../components/layout/PageHeader';
import InvoiceTable from '../../components/invoice/InvoiceTable';
import StatCard from '../../components/common/StatCard';
import Skeleton from '../../components/common/Skeleton';
import { FileText, Send, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await invoiceService.getInvoices();
        setInvoices(data);
      } catch (err) {
        console.error('Failed to load invoices:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const totalInvoices = invoices.length;
  const sentInvoices = invoices.filter((i) => i.status === 'SENT').length;
  const paidInvoices = invoices.filter((i) => i.status === 'PAID').length;
  const draftInvoices = invoices.filter((i) => i.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & PayPal Billing"
        subtitle="Manage PayPal Sandbox invoices generated following client milestone sign-off."
        breadcrumbs={[
          { label: 'Overview', to: '/client/dashboard' },
          { label: 'Invoices' }
        ]}
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoices"
          value={totalInvoices}
          subtitle="All milestone invoices"
          icon={FileText}
          variant="light"
        />

        <StatCard
          title="Invoices Sent"
          value={sentInvoices}
          subtitle="Awaiting payment settlement"
          icon={Send}
          variant="light"
          trend="Awaiting Webhook"
          trendType="neutral"
        />

        <StatCard
          title="Paid & Confirmed"
          value={paidInvoices}
          subtitle="Confirmed on ledger"
          icon={CheckCircle2}
          variant="light"
          trend="Settled"
          trendType="up"
        />

        <StatCard
          title="Draft Invoices"
          value={draftInvoices}
          subtitle="Prepared for dispatch"
          icon={Clock}
          variant="light"
        />
      </div>

      {/* Rule Notification */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Fintech Integrity Guarantee:</strong> Invoices are sent via PayPal Invoicing API v2. ProofPay never marks an invoice as Paid until receipt of an authenticated PayPal webhook and independent API status reconciliation.
        </p>
      </div>

      {loading ? (
        <Skeleton variant="table-row" count={3} />
      ) : (
        <InvoiceTable invoices={invoices} />
      )}
    </div>
  );
}
