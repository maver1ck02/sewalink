import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function ProviderPortfolio() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const { success, error } = useToast();
  useEffect(() => {
    api.get('/providers/me/portfolio').then(({ data }) => setItems(data.data.items || []));
  }, []);
  return (
    <div>
      <h1>Portfolio</h1>
      <form className="card form-stack" onSubmit={async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
          const { data } = await api.post('/providers/me/portfolio', { title, description });
          setItems((current) => [data.data.item, ...current]);
          setTitle('');
          setDescription('');
          success('Portfolio item added.');
        } catch (err) {
          error(getError(err));
        } finally {
          setCreating(false);
        }
      }}>
        <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn btn-primary" disabled={creating}>{creating && <Spinner />}Add item</button>
      </form>
      {items.map((i) => <div key={i._id} className="card" style={{ marginTop: 8 }}><strong>{i.title}</strong><p>{i.description}</p></div>)}
    </div>
  );
}
