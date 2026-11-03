import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Notice from '../components/Notice';

const roles = {
  admin: 'Admin',
  agent: 'Policy Agent',
  policyholder: 'Policy Holder',
  claimsOfficer: 'Claims Officer',
};

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadUsers() {
    const { data } = await api.get('/users');
    setUsers(data);
  }
  useEffect(() => {
    loadUsers().catch((requestError) => setError(requestError.response?.data?.message || 'Could not load users.'));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/users/policyholders', form);
      setForm({ name: '', email: '', password: '', phone: '' });
      setMessage('Policyholder account created.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create account.');
    }
  }

  return (
    <>
      <PageHeader title={user?.role === 'admin' ? 'User management' : 'Register policyholder'} description="Register customers and review their account details." />
      {user?.role === 'agent' && <p className="info-box">New policyholders can sign in using the temporary password you set. Ask them to change it after their first login.</p>}
      <Notice message={error} />
      <Notice message={message} kind="success" />
      <section className="panel">
        <h2>Register a policyholder</h2>
        <form className="form-grid" onSubmit={submit}>
          <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Phone<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label>Temporary password<input type="password" minLength="6" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <button className="button primary span-all">Create policyholder</button>
        </form>
      </section>
      {user?.role === 'admin' && <section className="panel">
        <h2>All users</h2>
        <DataTable columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'role', label: 'Role', render: (row) => roles[row.role] },
        ]} rows={users} />
      </section>}
    </>
  );
}
