import { useState } from 'react';
import api from '../services/api';
import Notice from './Notice';

export default function ClaimForm({ policies, onSubmitted }) {
  const [form, setForm] = useState({ policy: '', claimAmount: '', description: '', document: null });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

  return (
    <section className="panel">
      <h2>Submit a claim</h2>
      <form className="form-grid" onSubmit={submit}>
        <label>Policy<select required value={form.policy} onChange={(event) => setForm({ ...form, policy: event.target.value })}><option value="">Select your policy</option>{policies.map((policy) => <option key={policy._id} value={policy._id}>{policy.policyNumber} — {policy.product?.productName}</option>)}</select></label>
        <label>Claim amount<input type="number" min="1" required value={form.claimAmount} onChange={(event) => setForm({ ...form, claimAmount: event.target.value })} /></label>
        <label className="span-all">Description<textarea rows="3" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label className="span-all">Supporting document (PDF, image, or Word file; max 5 MB)<input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(event) => setForm({ ...form, document: event.target.files[0] || null })} /></label>
        <button className="button primary span-all">Submit claim</button>
      </form>
      <div className="form-notice"><Notice message={error} /><Notice message={message} kind="success" /></div>
    </section>
  );
}
