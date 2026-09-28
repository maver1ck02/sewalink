import { Link } from 'react-router-dom';

export default function BecomeProviderPage() {
  return (
    <div className="section">
      <div className="container">
        <h1>Offer your skills on SewaLink</h1>
        <p className="muted">Create a provider account, add services, request verification, and start receiving jobs.</p>
        <Link className="btn btn-primary" to="/register">Register as a provider</Link>
      </div>
    </div>
  );
}
