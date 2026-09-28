import Spinner from './Spinner';

export default function PageState({ loading, error, empty, children }) {
  if (loading) return <div className="loading"><Spinner /><span>Loading...</span></div>;
  if (error) return <div className="error-state">{error}</div>;
  if (empty) return <div className="empty">{empty}</div>;
  return children;
}
