import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Notice from '../components/Notice';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(({ data }) => setStats(data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load dashboard.'));
  }, []);

  const cards = [
    ...(user?.role === 'admin' || user?.role === 'agent' ? [{ title: 'Policyholders', value: stats?.policyholders }] : []),
    { title: user?.role === 'policyholder' ? 'My policies' : 'Policies', value: stats?.policies },
    { title: user?.role === 'policyholder' ? 'My claims' : user?.role === 'claimsOfficer' ? 'Assigned claims' : 'Claims', value: stats?.claims },
    { title: 'Claims to review', value: stats?.pendingClaims },
    ...(user?.role === 'admin' ? [{ title: 'Products', value: stats?.products }] : []),
    { title: 'Premiums recorded', value: `₹${Number(stats?.premiumCollected || 0).toLocaleString('en-IN')}` },
  ];

  return (
    <>
      <PageHeader title={`Hello, ${user?.name || 'there'}`} description="A quick view of your insurance activity." />
      <Notice message={error} />
      <section className="stat-grid">
        {cards.map((card) => (
          <article className="stat-card" key={card.title}>
            <p>{card.title}</p>
            <strong>{stats ? card.value ?? 0 : '...'}</strong>
          </article>
        ))}
      </section>
      <section className="welcome-panel">
        <div>
          <h2>{user?.role === 'policyholder' ? 'Your policies and claims, all in one place.' : 'Welcome to Policy Desk.'}</h2>
          <p>Use the menu to manage products, policies, claims, payments, and reports based on your role.</p>
        </div>
        <span className="welcome-icon">✓</span>
      </section>
    </>
  );
}
