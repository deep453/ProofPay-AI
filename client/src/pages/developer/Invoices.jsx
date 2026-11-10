import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import PageHeader from '../../components/layout/PageHeader';
import InvoiceTable from '../../components/invoice/InvoiceTable';
import StatCard from '../../components/common/StatCard';
import Skeleton from '../../components/common/Skeleton';
import { FileText, Send, CheckCircle2 } from 'lucide-react';

export default function DeveloperInvoices() {
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

  const total = invoices.length;
  const sent = invoices.filter((i) => i.status === 'SENT').length;
  const paid = invoices.filter((i) => i.status === 'PAID').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receivable Invoices"
        subtitle="Track PayPal invoices dispatched to clients upon milestone sign-off."
        breadcrumbs={[
          { label: 'Overview', to: '/developer/dashboard' },
          { label: 'Invoices' }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Invoices"
          value={total}
          subtitle="All contract invoices"
          icon={FileText}
          variant="light"
        />

        <StatCard
          title="Awaiting Settlement"
          value={sent}
          subtitle="Sent to client on PayPal"
          icon={Send}
          variant="light"
          trend="In Flight"
          trendType="neutral"
        />

        <StatCard
          title="Paid & Cleared"
          value={paid}
          subtitle="Disbursed to PayPal account"
          icon={CheckCircle2}
          variant="light"
          trend="Settled"
          trendType="up"
        />
      </div>

      {loading ? (
        <Skeleton variant="table-row" count={3} />
      ) : (
        <InvoiceTable invoices={invoices} />
      )}
    </div>
  );
}
