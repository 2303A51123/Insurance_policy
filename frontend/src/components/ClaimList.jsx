import DataTable from './DataTable';
import ClaimReview from './ClaimReview';
import ClaimDocumentLink from './ClaimDocumentLink';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function ClaimList({ claims, role, officers, onUpdated }) {
  if (role === 'policyholder') {
    return (
      <DataTable columns={[
          { key: 'claimNumber', label: 'Claim number' },
          { key: 'policy', label: 'Policy', render: (row) => row.policy?.policyNumber },
          { key: 'claimAmount', label: 'Requested', render: (row) => money(row.claimAmount) },
          { key: 'status', label: 'Status', render: (row) => <span className="status-pill">{row.status}</span> },
          { key: 'document', label: 'Document', render: (row) => row.document ? <ClaimDocumentLink claimId={row._id} /> : '—' },
          { key: 'remarks', label: 'Remarks', render: (row) => row.remarks || '—' },
        ]} rows={claims} emptyMessage="No claims to show." />
    );
  }

  return (
    claims.length ? <div className="claim-list">
        {claims.map((claim) => (
          <article className="claim-card" key={claim._id}>
            <div className="claim-heading">
              <div><h3>{claim.claimNumber}</h3><p>{claim.policyholder?.name} · {claim.policy?.policyNumber} · {money(claim.claimAmount)}</p></div>
              <span className="status-pill">{claim.status}</span>
            </div>
            <p>{claim.description}</p>
            {claim.document && <ClaimDocumentLink claimId={claim._id} />}
            <ClaimReview claim={claim} role={role} officers={officers} onUpdated={onUpdated} />
          </article>
        ))}
      </div> : <p className="empty-state">No claims to show.</p>
  );
}
