export default function PageHeader({ title, description, children }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">INSURANCE POLICY MANAGEMENT</p>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
