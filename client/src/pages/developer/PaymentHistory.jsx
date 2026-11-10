import { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import PageHeader from '../../components/layout/PageHeader';
import PaymentTable from '../../components/payment/PaymentTable';
import StatCard from '../../components/common/StatCard';
import Skeleton from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/formatCurrency';
import { DollarSign, CreditCard, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadPayments() {
      try {
        setRefreshing(true);
        setError('');

        const data = await paymentService.getPayments();

        if (active) {
          setPayments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Unable to load payment records.');
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadPayments();

    const intervalId = setInterval(loadPayments, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [refreshKey]);

  const confirmed = payments.filter((p) => p.status === 'CONFIRMED');
  const pending = payments.filter((p) => p.status === 'PENDING');

  const totalEarned = confirmed.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  const pendingAmount = pending.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment & Earnings History"
        subtitle="Track PayPal invoice payments confirmed by the ProofPay server. Confirmed invoice payments do not represent separate developer payouts."
        breadcrumbs={[
          { label: 'Overview', to: '/developer/dashboard' },
          { label: 'Payment History' }
        ]}
        action={
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="ml-2 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Paid Invoices"
          value={formatCurrency(totalEarned)}
          subtitle="Invoice payments confirmed"
          icon={DollarSign}
          variant="dark"
          allowPrivacy={true}
          trend="Verified"
          trendType="up"
        />

        <StatCard
          title="Awaiting Payment"
          value={formatCurrency(pendingAmount)}
          subtitle="Invoiced to clients"
          icon={Clock}
          variant="light"
          trend={pendingAmount > 0 ? 'Pending' : 'None'}
          trendType="neutral"
        />

        <StatCard
          title="Paid Invoices"
          value={confirmed.length}
          subtitle="Invoices confirmed as paid"
          icon={CheckCircle2}
          variant="light"
          trend="Reconciled"
          trendType="up"
        />

        <StatCard
          title="Payment Method"
          value="PayPal Invoicing"
          subtitle="PayPal Sandbox invoices"
          icon={CreditCard}
          variant="light"
        />
      </div>

      {loading ? (
        <Skeleton variant="table-row" count={3} />
      ) : (
        <PaymentTable payments={payments} />
      )}

      <p className="text-2xs text-slate-400">
        Payment records refresh automatically every 30 seconds. Last refresh is based on the latest successful API response.
      </p>
    </div>
  );
}
