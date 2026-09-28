import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { getError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function FavoritesPage() {
  const [items, setItems] = useState([]);
  const [removing, setRemoving] = useState('');
  const { success, error } = useToast();
  useEffect(() => {
    api.get('/favorites').then(({ data }) => setItems(data.data.favorites || []));
  }, []);
  return (
    <div>
      <h1>Saved providers</h1>
      <div className="grid grid-2">
        {items.map((f) => (
          <div key={f._id} className="card">
            <Link to={`/providers/${f.provider?._id}`}><strong>{f.provider?.businessName}</strong></Link>
            <button className="btn btn-ghost" disabled={removing === f._id} onClick={async () => {
              setRemoving(f._id);
              try {
                await api.delete(`/favorites/${f.provider._id}`);
                setItems((current) => current.filter((x) => x._id !== f._id));
                success('Removed from saved providers.');
              } catch (err) {
                error(getError(err));
              } finally {
                setRemoving('');
              }
            }}>{removing === f._id && <Spinner />}Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
