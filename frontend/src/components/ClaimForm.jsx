import { useState } from 'react';
import api from '../services/api';
import Notice from './Notice';

export default function ClaimForm({ policies, products, onPoliciesChanged, onSubmitted }) {
  const [form, setForm] = useState({ policy: '', claimAmount: '', description: '', document: null });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  async function selectPolicy(value) {
    setError('');
    setMessage('');
    if (!value.startsWith('product:')) {
      setForm({ ...form, policy: value });
      return;
    }

    setEnrolling(true);
    try {
      const { data: policy } = await api.post('/policies/enroll', { product: value.slice('product:'.length) });
      const nextPolicies = await onPoliciesChanged();
      const issuedPolicy = nextPolicies.find((item) => item._id === policy._id) || policy;
      setForm({ ...form, policy: issuedPolicy._id });
      setMessage(`${issuedPolicy.product?.productName || 'Policy'} is now active and selected.`);
    } catch (requestError) {
      setForm({ ...form, policy: '' });
      setError(requestError.response?.data?.message || 'Could not activate this policy.');
    } finally {
      setEnrolling(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    const data = new FormData();
    data.append('policy', form.policy);
    data.append('claimAmount', form.claimAmount);
    data.append('description', form.description);
    if (form.document) data.append('document', form.document);

    try {
      await api.post('/claims', data);
      setForm({ policy: '', claimAmount: '', description: '', document: null });
      event.target.reset();
      setMessage('Claim submitted. You can track its status below.');
      await onSubmitted();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit claim.');
    }
  }

  const activePolicies = policies.filter((policy) => policy.status === 'Active');
  const existingProductIds = new Set(activePolicies.map((policy) => policy.product?._id).filter(Boolean));
  const availableProducts = products.filter((product) => !existingProductIds.has(product._id));

  return (
    <section className="panel">
      <h2>Submit a claim</h2>
      {activePolicies.length === 0 && (
        <p className="info-box" role="status">
          Select an available policy below to activate it instantly for your account.
        </p>
      )}
      <form className="form-grid" onSubmit={submit}>
        <label>Policy
          <select required disabled={enrolling} value={form.policy} onChange={(event) => selectPolicy(event.target.value)}>
            <option value="">{enrolling ? 'Activating policy...' : 'Select a policy'}</option>
            {activePolicies.length > 0 && (
              <optgroup label="Your active policies">
                {activePolicies.map((policy) => <option key={policy._id} value={policy._id}>{policy.policyNumber} — {policy.product?.productName}</option>)}
              </optgroup>
            )}
            {availableProducts.length > 0 && (
              <optgroup label="Available policies — activate instantly">
                {availableProducts.map((product) => (
                  <option key={product._id} value={`product:${product._id}`}>
                    {product.productName} — ₹{Number(product.premiumAmount).toLocaleString('en-IN')} premium, ₹{Number(product.coverageAmount).toLocaleString('en-IN')} coverage
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
        <label>Claim amount<input type="number" min="1" required value={form.claimAmount} onChange={(event) => setForm({ ...form, claimAmount: event.target.value })} /></label>
        <label className="span-all">Description<textarea rows="3" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label className="span-all">Supporting document (PDF, image, or Word file; max 5 MB)<input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(event) => setForm({ ...form, document: event.target.files[0] || null })} /></label>
        <button className="button primary span-all" disabled={!form.policy || enrolling}>Submit claim</button>
      </form>
      <div className="form-notice"><Notice message={error} /><Notice message={message} kind="success" /></div>
    </section>
  );
}
