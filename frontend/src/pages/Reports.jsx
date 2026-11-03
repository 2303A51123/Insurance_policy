import { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Notice from '../components/Notice';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
const reportDefinitions = [
  { key: 'policies', title: 'Policy register report', endpoint: 'policy-register', columns: [
    { key: 'policyNumber', label: 'Policy number' },
    { key: 'customerName', label: 'Customer name' },
    { key: 'productName', label: 'Product name' },
    { key: 'premiumAmount', label: 'Premium', render: (row) => money(row.premiumAmount) },
    { key: 'status', label: 'Policy status' },
  ] },
  { key: 'claims', title: 'Claims status report', endpoint: 'claims-status', columns: [
    { key: 'claimNumber', label: 'Claim number' },
    { key: 'customerName', label: 'Customer name' },
    { key: 'claimAmount', label: 'Claim amount', render: (row) => money(row.claimAmount) },
    { key: 'status', label: 'Claim status' },
  ] },
  { key: 'payments', title: 'Premium collection report', endpoint: 'premium-collection', columns: [
    { key: 'customerName', label: 'Customer name' },
    { key: 'policyNumber', label: 'Policy number' },
    { key: 'premiumAmount', label: 'Premium amount', render: (row) => money(row.premiumAmount) },
    { key: 'paymentDate', label: 'Payment date', render: (row) => new Date(row.paymentDate).toLocaleDateString('en-IN') },
  ] },
  { key: 'settlements', title: 'Claim settlement report', endpoint: 'claim-settlement', columns: [
    { key: 'claimNumber', label: 'Claim number' },
    { key: 'customerName', label: 'Customer name' },
    { key: 'requestedAmount', label: 'Requested amount', render: (row) => money(row.requestedAmount) },
    { key: 'settlementAmount', label: 'Settlement amount', render: (row) => money(row.settlementAmount) },
    { key: 'settlementStatus', label: 'Settlement status' },
  ] },
];

export default function Reports() {
  const [reports, setReports] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all(reportDefinitions.map(async (report) => {
      const { data } = await api.get(`/reports/${report.endpoint}`);
      return [report.key, data];
    }))
      .then((results) => setReports(Object.fromEntries(results)))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load reports.'));
  }, []);

  return (
    <>
      <PageHeader title="Reports" description="Simple reports built from your MongoDB records." />
      <Notice message={error} />
      {reportDefinitions.map((report) => (
        <section className="panel report-panel" key={report.key}>
          <h2>{report.title}</h2>
          <DataTable columns={report.columns} rows={reports[report.key] || []} />
        </section>
      ))}
    </>
  );
}
