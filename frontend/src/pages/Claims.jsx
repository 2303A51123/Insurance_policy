import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import ClaimForm from '../components/ClaimForm';
import ClaimList from '../components/ClaimList';
import Notice from '../components/Notice';

export default function Claims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [products, setProducts] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [error, setError] = useState('');

  async function loadClaims() {
    const { data } = await api.get('/claims');
    setClaims(data);
  }

  useEffect(() => {
    const requests = [loadClaims()];
    if (user?.role === 'policyholder') {
      requests.push(api.get('/policies').then(({ data }) => setPolicies(data)));
      requests.push(api.get('/products').then(({ data }) => setProducts(data)));
    }
    if (user?.role === 'admin') requests.push(api.get('/users/officers').then(({ data }) => setOfficers(data)));
    Promise.all(requests).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load claims.'));
  }, []);

  return (
    <>
      <PageHeader title={user?.role === 'policyholder' ? 'Submit and track claims' : user?.role === 'admin' ? 'Claims management' : 'Assigned claims'} description="Follow claim progress and keep review notes together." />
      {user?.role === 'policyholder' && (
        <ClaimForm
          policies={policies}
          products={products}
          onPoliciesChanged={async () => {
            const { data: nextPolicies } = await api.get('/policies');
            setPolicies(nextPolicies);
            return nextPolicies;
          }}
          onSubmitted={loadClaims}
        />
      )}
      <Notice message={error} />
      <section className="panel">
        <h2>{user?.role === 'policyholder' ? 'Your claims' : 'Claims to review'}</h2>
        <ClaimList claims={claims} role={user?.role} officers={officers} onUpdated={loadClaims} />
      </section>
    </>
  );
}
