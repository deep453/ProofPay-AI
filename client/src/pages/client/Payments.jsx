import { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import PageHeader from '../../components/layout/PageHeader';
import PaymentTable from '../../components/payment/PaymentTable';
import StatCard from '../../components/common/StatCard';
import Skeleton from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/formatCurrency';
import { CreditCard, CheckCircle2, Clock, DollarSign, ShieldCheck } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await paymentService.getPayments();
        setPayments(data);
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const totalPayments = payments.length;
  const confirmedPayments = payments.filter((p) => p.status === 'CONFIRMED');
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;
  const totalAmountSettled = confirmedPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="PayPal Invoice Payments"
        subtitle="Track milestone invoices and their independently verified PayPal payment status."
        breadcrumbs={[
          { label: 'Overview', to: '/client/dashboard' },
          { label: 'Payments' }
        ]}
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Paid Invoices"
          value={formatCurrency(totalAmountSettled)}
          subtitle="Verified as paid by PayPal"
          icon={DollarSign}
          variant="dark"
          allowPrivacy={true}
          trend="Verified"
          trendType="up"
        />

        <StatCard
          title="Total Payments"
          value={totalPayments}
          subtitle="All transactions"
          icon={CreditCard}
          variant="light"
        />

        <StatCard
          title="Confirmed Payments"
          value={confirmedPayments.length}
          subtitle="Webhook and invoice status verified"
          icon={CheckCircle2}
          variant="light"
          trend="Verified"
          trendType="up"
        />

        <StatCard
          title="Awaiting Payment"
          value={pendingPayments}
          subtitle="Awaiting PayPal payment"
          icon={Clock}
          variant="light"
          trend={pendingPayments > 0 ? "Pending" : "None"}
          trendType={pendingPayments > 0 ? "down" : "up"}
        />
      </div>

      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Independent Verification:</strong> When a client pays a PayPal invoice, ProofPay validates the PayPal webhook signature and independently checks the invoice status through the PayPal API before marking the milestone as paid. This confirms invoice payment; it does not represent a separate developer payout.
        </p>
      </div>

      {loading ? (
        <Skeleton variant="table-row" count={3} />
      ) : (
        <PaymentTable payments={payments} />
      )}
    </div>
  );
}

