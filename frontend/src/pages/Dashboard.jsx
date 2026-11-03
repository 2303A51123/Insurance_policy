import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Notice from '../components/Notice';
import Icon from '../components/Icon';

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
    ...(user?.role === 'admin' || user?.role === 'agent' ? [{ title: 'Policyholders', value: stats?.policyholders, icon: 'users', link: '/users' }] : []),
    { title: user?.role === 'policyholder' ? 'My policies' : 'Policies', value: stats?.policies, icon: 'file', link: '/policies' },
    { title: user?.role === 'policyholder' ? 'My claims' : user?.role === 'claimsOfficer' ? 'Assigned claims' : 'Claims', value: stats?.claims, icon: 'shield', link: '/claims' },
    { title: 'Claims to review', value: stats?.pendingClaims, icon: 'clock', link: '/claims' },
    ...(user?.role === 'admin' ? [{ title: 'Products', value: stats?.products, icon: 'package', link: '/products' }] : []),
    { title: 'Premiums recorded', value: `₹${Number(stats?.premiumCollected || 0).toLocaleString('en-IN')}`, icon: 'credit', link: '/payments' },
  ];

  return (
    <>
      <PageHeader title={`Hello, ${user?.name || 'there'}`} description="Here is the latest overview of your insurance activity." />
      <Notice message={error} />
      <section className="stat-grid">
        {cards.map((card) => (
          <Link className="stat-card" to={card.link} key={card.title}>
            <span className="stat-icon"><Icon name={card.icon} /></span>
            <span className="stat-copy"><span className="stat-label">{card.title}</span><strong>{stats ? card.value ?? 0 : '...'}</strong></span>
            <span className="stat-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>
      <section className="welcome-panel">
        <div className="welcome-content">
          <p className="welcome-kicker">YOUR INSURANCE, SIMPLIFIED</p>
          <h2>{user?.role === 'policyholder' ? 'Protection that moves with you.' : 'Everything you need, in one place.'}</h2>
          <p>{user?.role === 'policyholder' ? 'Keep track of your coverage, upcoming renewals, and claims with a clear view of your account.' : 'Manage policies, stay on top of claims, and keep your customers protected.'}</p>
          <div className="welcome-actions">
            <Link className="button welcome-button" to={user?.role === 'policyholder' ? '/policies' : user?.role === 'claimsOfficer' ? '/claims' : '/policies'}>
              {user?.role === 'policyholder' ? 'View my policies' : user?.role === 'claimsOfficer' ? 'Review claims' : 'Manage policies'} <span aria-hidden="true">→</span>
            </Link>
            {user?.role !== 'claimsOfficer' && <Link className="welcome-secondary" to={user?.role === 'policyholder' ? '/claims' : '/products'}>{user?.role === 'policyholder' ? 'Submit a claim' : 'Browse products'}</Link>}
          </div>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="art-orbit orbit-one"></span><span className="art-orbit orbit-two"></span>
          <span className="art-shield">✓</span><span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span>
        </div>
      </section>
    </>
  );
}
