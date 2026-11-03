import { useState } from 'react';
import api from '../services/api';
import Notice from './Notice';

export default function ClaimReview({ claim, role, officers, onUpdated }) {
  const [remarks, setRemarks] = useState(claim.remarks || '');
  const [settlementAmount, setSettlementAmount] = useState(claim.settlementAmount || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function updateClaim(status) {
    setError('');
    setMessage('');
    try {
      await api.patch(`/claims/${claim._id}/review`, { status, remarks, settlementAmount });
      setMessage(`${claim.claimNumber} updated.`);
      await onUpdated();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update claim.');
    }
  }

  async function assignOfficer(assignedOfficer) {
    if (!assignedOfficer) return;
    setError('');
    try {
      await api.patch(`/claims/${claim._id}/assign`, { assignedOfficer });
      setMessage('Claims officer assigned.');
      await onUpdated();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not assign officer.');
    }
  }

  return (
    <div className="claim-review">
      {role === 'admin' && (
        <label>Assigned claims officer<select value={claim.assignedOfficer?._id || ''} onChange={(event) => assignOfficer(event.target.value)}><option value="">Choose an officer</option>{officers.map((officer) => <option key={officer._id} value={officer._id}>{officer.name}</option>)}</select></label>
      )}
      {['Submitted', 'Under Review'].includes(claim.status) && (
        <>
          <label>Review remarks<textarea rows="2" value={remarks} onChange={(event) => setRemarks(event.target.value)} /></label>
          <div className="action-row">
            {claim.status === 'Submitted' && <button className="button secondary small" onClick={() => updateClaim('Under Review')}>Mark in review</button>}
            <button className="button primary small" onClick={() => updateClaim('Approved')}>Approve</button>
            <button className="button danger-button small" onClick={() => updateClaim('Rejected')}>Reject</button>
          </div>
        </>
      )}
      {claim.status === 'Approved' && (
        <div className="settlement-row">
          <label>Settlement amount<input type="number" min="0" value={settlementAmount} onChange={(event) => setSettlementAmount(event.target.value)} /></label>
          <button className="button secondary small" onClick={() => updateClaim('Settled')}>Record settlement</button>
        </div>
      )}
      <Notice message={error} />
      <Notice message={message} kind="success" />
    </div>
  );
}
