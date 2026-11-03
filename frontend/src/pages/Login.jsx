import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';
import { BrandMark } from '../components/Icon';

export default function Login() {
  const { user, authError, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not log in. Check that the API is running.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandMark large />
        <p className="eyebrow">POLICY DESK</p>
        <h1>Welcome back</h1>
        <p className="muted">Log in to manage your insurance account.</p>
        <Notice message={authError} />
        <form className="form-stack" onSubmit={submit}>
          <label>Email<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <Notice message={error} />
          <button className="button primary" disabled={saving}>{saving ? 'Logging in...' : 'Log in'}</button>
        </form>
        <p className="auth-link">New policyholder? <Link to="/register">Create an account</Link></p>
        <p className="demo-hint">Try the sample accounts shown in the README.</p>
      </section>
    </main>
  );
}
