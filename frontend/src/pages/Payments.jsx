import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Notice from '../components/Notice';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '—';

export default function Payments() {
  const { user } = useAuth();
  const canRecord = user?.role === 'admin' || user?.role === 'agent';
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [balances, setBalances] = useState([]);
  const [payingPolicy, setPayingPolicy] = useState('');
  const [form, setForm] = useState({ policy: '', amount: '', paymentDate: '', paymentStatus: 'Completed', paymentMethod: 'Bank transfer' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    const requests = [api.get('/payments')];
    if (user?.role === 'policyholder') requests.push(api.get('/payments/balances'));
    if (canRecord) requests.push(api.get('/policies'));
    const results = await Promise.all(requests);
    setPayments(results[0].data);
    if (user?.role === 'policyholder') setBalances(results[1].data);
    if (canRecord) setPolicies(results[1].data);
  }

  useEffect(() => {
    loadData().catch((requestError) => setError(requestError.response?.data?.message || 'Could not load payments.'));
  }, [user?.role]);

  async function repay(balance) {
    setError('');
    setMessage('');
    setPayingPolicy(balance.policyId);
    try {
      const { data } = await api.post('/payments/repay', { policy: balance.policyId });
      setMessage(`${data.message} ${money(data.payment.amount)} paid for ${balance.policyNumber}.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not record the bank transfer.');
    } finally {
      setPayingPolicy('');
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/payments', form);
      setForm({ policy: '', amount: '', paymentDate: '', paymentStatus: 'Completed', paymentMethod: 'Bank transfer' });
      setMessage('Premium payment recorded.');
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not record payment.');
    }
  }

  return (
    <>
      <PageHeader title="Premium payments" description={user?.role === 'policyholder' ? 'See what is due and pay your remaining premium.' : 'Track premium collection and payment dates.'} />
      <Notice message={error} />
      <Notice message={message} kind="success" />
      {user?.role === 'policyholder' && (
        <section className="panel">
          <div className="payment-overview">
            <div className="payment-overview-copy">
              <span className="payment-overview-icon" aria-hidden="true">₹</span>
              <div>
                <p className="payment-overview-label">YOUR PREMIUMS</p>
                <h2>Stay up to date with your coverage</h2>
                <p>One clear view of your policy balances and payment history.</p>
              </div>
            </div>
            <div className="payment-overview-total">
              <span>Total remaining</span>
              <strong>{money(balances.reduce((total, balance) => total + Number(balance.remainingAmount || 0), 0))}</strong>
              <small>across {balances.length} {balances.length === 1 ? 'policy' : 'policies'}</small>
            </div>
          </div>
          <div className="panel-heading balance-heading">
            <div>
              <h2>Premium balance</h2>
              <p className="muted">Select a policy below to make a payment.</p>
            </div>
            <span className="payment-method-badge">Secure demo payment</span>
          </div>
          {balances.length ? (
            <div className="balance-grid">
              {balances.map((balance) => {
                const paidPercent = balance.premiumAmount
                  ? Math.min((balance.amountPaid / balance.premiumAmount) * 100, 100)
                  : 0;
                return (
                  <article className="balance-card" key={balance.policyId}>
                    <div className="balance-card-heading">
                      <span className="balance-icon" aria-hidden="true">₹</span>
                      <span className="status-pill">{balance.remainingAmount === 0 ? 'Paid' : 'Payment due'}</span>
                    </div>
                    <p className="balance-product">{balance.productName}</p>
                    <p className="balance-policy">{balance.policyNumber}</p>
                    <p className="balance-due-label">Remaining amount</p>
                    <strong className="balance-due">{money(balance.remainingAmount)}</strong>
                    <div className="balance-progress" aria-label={`${Math.round(paidPercent)}% of premium paid`}>
                      <span style={{ width: `${paidPercent}%` }} />
                    </div>
                    <p className="balance-paid">Paid {money(balance.amountPaid)} of {money(balance.premiumAmount)}</p>
                    <button
                      className="button primary balance-pay"
                      disabled={balance.remainingAmount === 0 || payingPolicy === balance.policyId}
                      onClick={() => repay(balance)}
                    >
                      {balance.remainingAmount === 0
                        ? 'Premium paid'
                        : payingPolicy === balance.policyId
                          ? 'Processing...'
                          : `Pay ${money(balance.remainingAmount)}`}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">No policies are linked to your account yet.</p>
          )}
          <p className="payment-disclaimer">Demo only: selecting Bank transfer records a sample payment. No bank details are collected and no real money moves.</p>
        </section>
      )}
      {canRecord && (
        <section className="panel">
          <h2>Record a payment</h2>
          <form className="form-grid" onSubmit={submit}>
            <label>Policy<select required value={form.policy} onChange={(event) => setForm({ ...form, policy: event.target.value })}><option value="">Select a policy</option>{policies.map((policy) => <option key={policy._id} value={policy._id}>{policy.policyNumber} — {policy.policyholder?.name}</option>)}</select></label>
            <label>Amount<input type="number" min="0" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
            <label>Payment date<input type="date" value={form.paymentDate} onChange={(event) => setForm({ ...form, paymentDate: event.target.value })} /></label>
            <label>Payment status<select value={form.paymentStatus} onChange={(event) => setForm({ ...form, paymentStatus: event.target.value })}><option>Completed</option><option>Pending</option></select></label>
            <label>Payment method<select value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}><option>Bank transfer</option></select></label>
            <button className="button primary span-all">Save payment record</button>
          </form>
        </section>
      )}
      <section className="panel">
        <h2>Payment history</h2>
        <DataTable columns={[
          { key: 'policy', label: 'Policy', render: (row) => row.policy?.policyNumber },
          ...(canRecord ? [{ key: 'policyholder', label: 'Customer', render: (row) => row.policyholder?.name }] : []),
          { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
          { key: 'paymentDate', label: 'Payment date', render: (row) => formatDate(row.paymentDate) },
          { key: 'paymentMethod', label: 'Method', render: (row) => row.paymentMethod || 'Bank transfer' },
          { key: 'paymentStatus', label: 'Status' },
        ]} rows={payments} />
      </section>
    </>
  );
}
