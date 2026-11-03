import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ClaimDocumentLink({ claimId }) {
  const [fileUrl, setFileUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let objectUrl = '';
    api.get(`/claims/${claimId}/document`, { responseType: 'blob' })
      .then(({ data }) => {
        objectUrl = URL.createObjectURL(data);
        setFileUrl(objectUrl);
      })
      .catch(() => setError('Document unavailable.'));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [claimId]);

  if (error) return <span className="muted">{error}</span>;
  if (!fileUrl) return <span className="muted">Loading file...</span>;
  return <a href={fileUrl} target="_blank" rel="noreferrer">View file</a>;
}
