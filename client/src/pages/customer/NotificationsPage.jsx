import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState('');
  const { success, error } = useToast();
  async function load() {
    const { data } = await api.get('/notifications');
    setItems(data.data.notifications || []);
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Notifications</h1>
        <button className="btn btn-outline" disabled={busy === 'all'} onClick={async () => { setBusy('all'); try { await api.post('/notifications/read-all'); await load(); success('All notifications marked as read.'); } catch (err) { error(getError(err)); } finally { setBusy(''); } }}>{busy === 'all' && <Spinner />}Mark all as read</button>
      </div>
      {items.map((n) => (
        <div key={n._id} className="card" style={{ marginBottom: 8, opacity: n.read ? 0.7 : 1 }}>
          <strong>{n.title}</strong>
          <p>{n.message}</p>
          {!n.read && <button className="btn btn-ghost" disabled={busy === n._id} onClick={async () => { setBusy(n._id); try { await api.post(`/notifications/${n._id}/read`); await load(); } catch (err) { error(getError(err)); } finally { setBusy(''); } }}>{busy === n._id && <Spinner />}Mark as read</button>}
        </div>
      ))}
    </div>
  );
}
