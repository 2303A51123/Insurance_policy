export default function Notice({ message, kind = 'error' }) {
  if (!message) return null;
  return <p className={`notice ${kind}`} role="status">{message}</p>;
}
