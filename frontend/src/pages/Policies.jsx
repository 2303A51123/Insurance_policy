import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Notice from '../components/Notice';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
const date = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '—';

export default function Policies() {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'agent';
  const [policies, setPolicies] = useState([]);
  const [products, setProducts] = useState([]);
  const [holders, setHolders] = useState([]);
  const [form, setForm] = useState({ policyholder: '', product: '', startDate: '', expiryDate: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const { data } = await api.get('/policies');
    setPolicies(data);
  }

  useEffect(() => {
    Promise.all([
      load(),
      api.get('/products').then(({ data }) => setProducts(data)),
      ...(canCreate ? [api.get('/users').then(({ data }) => setHolders(data.filter((person) => person.role === 'policyholder')))] : []),
    ]).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load policies.'));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/policies', form);
      setForm({ policyholder: '', product: '', startDate: '', expiryDate: '' });
      setMessage('Policy created successfully.');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create policy.');
    }
  }

  const columns = [
    { key: 'policyNumber', label: 'Policy number' },
    ...(canCreate ? [{ key: 'policyholder', label: 'Customer', render: (row) => row.policyholder?.name }] : []),
    { key: 'product', label: 'Product', render: (row) => row.product?.productName },
    { key: 'premiumAmount', label: 'Premium', render: (row) => money(row.premiumAmount) },
    { key: 'expiryDate', label: 'Renewal date', render: (row) => date(row.renewalDate || row.expiryDate) },
    { key: 'status', label: 'Status', render: (row) => <span className="status-pill">{row.status}</span> },
  ];

  return (
    <>
      <PageHeader title={user?.role === 'policyholder' ? 'My policies' : 'Policy management'} description="Review coverage, premium amounts, and renewal dates." />
      {canCreate && (
        <section className="panel">
          <h2>Create a policy</h2>
          <form className="form-grid" onSubmit={submit}>
            <label>Policyholder<select required value={form.policyholder} onChange={(event) => setForm({ ...form, policyholder: event.target.value })}><option value="">Select a customer</option>{holders.map((holder) => <option key={holder._id} value={holder._id}>{holder.name} — {holder.email}</option>)}</select></label>
            <label>Insurance product<select required value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })}><option value="">Select a product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.productName}</option>)}</select></label>
            <label>Start date<input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
            <label>Expiry / renewal date<input type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} /></label>
            <button className="button primary span-all">Create policy</button>
          </form>
        </section>
      )}
      <Notice message={error} />
      <Notice message={message} kind="success" />
      <section className="panel">
        <h2>Policy register</h2>
        <DataTable columns={columns} rows={policies} emptyMessage="No policies yet." />
      </section>
    </>
  );
}
