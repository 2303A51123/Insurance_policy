import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Notice from '../components/Notice';

const emptyForm = { productName: '', category: '', description: '', premiumAmount: '', coverageAmount: '' };
const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadProducts() {
    const { data } = await api.get('/products');
    setProducts(data);
  }
  useEffect(() => {
    loadProducts().catch((requestError) => setError(requestError.response?.data?.message || 'Could not load products.'));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editingId) await api.put(`/products/${editingId}`, form);
      else await api.post('/products', form);
      setForm(emptyForm);
      setEditingId('');
      setMessage(editingId ? 'Product updated.' : 'Product added.');
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save product.');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete product.');
    }
  }

  const columns = [
    { key: 'productName', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'premiumAmount', label: 'Premium', render: (row) => money(row.premiumAmount) },
    { key: 'coverageAmount', label: 'Coverage', render: (row) => money(row.coverageAmount) },
    { key: 'description', label: 'Description' },
    ...(user?.role === 'admin' ? [{
      key: 'actions',
      label: 'Actions',
      render: (row) => <div className="action-row">
        <button className="text-button" onClick={() => { setEditingId(row._id); setForm({ productName: row.productName, category: row.category, description: row.description, premiumAmount: row.premiumAmount, coverageAmount: row.coverageAmount }); }}>Edit</button>
        <button className="text-button danger" onClick={() => remove(row._id)}>Delete</button>
      </div>,
    }] : []),
  ];

  return (
    <>
      <PageHeader title="Insurance products" description="Browse the products available to policyholders." />
      {user?.role === 'admin' && (
        <section className="panel">
          <h2>{editingId ? 'Update product' : 'Add a product'}</h2>
          <form className="form-grid" onSubmit={submit}>
            <label>Product name<input required value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} /></label>
            <label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
            <label>Premium amount<input type="number" min="0" required value={form.premiumAmount} onChange={(event) => setForm({ ...form, premiumAmount: event.target.value })} /></label>
            <label>Coverage amount<input type="number" min="0" required value={form.coverageAmount} onChange={(event) => setForm({ ...form, coverageAmount: event.target.value })} /></label>
            <label className="span-all">Description<textarea rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <div className="span-all action-row">
              <button className="button primary">{editingId ? 'Save changes' : 'Add product'}</button>
              {editingId && <button className="button secondary" type="button" onClick={() => { setEditingId(''); setForm(emptyForm); }}>Cancel</button>}
            </div>
          </form>
        </section>
      )}
      <Notice message={error} />
      <Notice message={message} kind="success" />
      <section className="panel">
        <h2>Product list</h2>
        <DataTable columns={columns} rows={products} />
      </section>
    </>
  );
}
