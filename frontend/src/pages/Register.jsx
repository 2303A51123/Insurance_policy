import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';
import { BrandMark } from '../components/Icon';

export default function Register() {
  const { user, authError, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandMark large />
        <p className="eyebrow">POLICY DESK</p>
        <h1>Create policyholder account</h1>
        <p className="muted">Registration creates a policyholder account.</p>
        <Notice message={authError} />
        <form className="form-stack" onSubmit={submit}>
          <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Phone<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label>Password (at least 6 characters)<input type="password" minLength="6" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <Notice message={error} />
          <button className="button primary" disabled={saving}>{saving ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="auth-link">Already registered? <Link to="/login">Log in</Link></p>
      </section>
    </main>
  );
}
