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
  const [form, setForm] = useState({ policy: '', amount: '', paymentDate: '', paymentStatus: 'Completed' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadPayments() {
    const { data } = await api.get('/payments');
    setPayments(data);
  }
  useEffect(() => {
    const requests = [loadPayments()];
    if (canRecord) requests.push(api.get('/policies').then(({ data }) => setPolicies(data)));
    Promise.all(requests).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load payments.'));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/payments', form);
      setForm({ policy: '', amount: '', paymentDate: '', paymentStatus: 'Completed' });
      setMessage('Premium payment recorded.');
      await loadPayments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not record payment.');
    }
  }

  return (
    <>
      <PageHeader title="Premium payments" description="Track premium collection and payment dates." />
      {canRecord && (
        <section className="panel">
          <h2>Record a payment</h2>
          <form className="form-grid" onSubmit={submit}>
            <label>Policy<select required value={form.policy} onChange={(event) => setForm({ ...form, policy: event.target.value })}><option value="">Select a policy</option>{policies.map((policy) => <option key={policy._id} value={policy._id}>{policy.policyNumber} — {policy.policyholder?.name}</option>)}</select></label>
            <label>Amount<input type="number" min="0" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
            <label>Payment date<input type="date" value={form.paymentDate} onChange={(event) => setForm({ ...form, paymentDate: event.target.value })} /></label>
            <label>Payment status<select value={form.paymentStatus} onChange={(event) => setForm({ ...form, paymentStatus: event.target.value })}><option>Completed</option><option>Pending</option></select></label>
            <button className="button primary span-all">Save payment record</button>
          </form>
        </section>
      )}
      <Notice message={error} />
      <Notice message={message} kind="success" />
      <section className="panel">
        <h2>Payment history</h2>
        <DataTable columns={[
          { key: 'policy', label: 'Policy', render: (row) => row.policy?.policyNumber },
          ...(canRecord ? [{ key: 'policyholder', label: 'Customer', render: (row) => row.policyholder?.name }] : []),
          { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
          { key: 'paymentDate', label: 'Payment date', render: (row) => formatDate(row.paymentDate) },
          { key: 'paymentStatus', label: 'Status' },
        ]} rows={payments} />
      </section>
    </>
  );
}
