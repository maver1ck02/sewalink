import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CustomerHome() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [favs, setFavs] = useState([]);
  const [notes, setNotes] = useState({ notifications: [], unread: 0 });

  useEffect(() => {
    api.get('/bookings').then(({ data }) => setBookings(data.data.bookings || []));
    api.get('/favorites').then(({ data }) => setFavs(data.data.favorites || []));
    api.get('/notifications').then(({ data }) => setNotes(data.data));
  }, []);

  const upcoming = bookings.filter((b) => ['ACCEPTED', 'SCHEDULED', 'PROVIDER_ON_THE_WAY', 'IN_PROGRESS'].includes(b.status));
  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    active: upcoming.length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  return (
    <div>
      <h1>Welcome back, {user?.name}</h1>
      <div className="grid grid-4">
        {Object.entries(stats).map(([k, v]) => (
          <div className="stat" key={k}><div className="muted">{k}</div><b>{v}</b></div>
        ))}
      </div>
      <div className="grid grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <h3>Upcoming booking</h3>
          {upcoming[0] ? <Link to={`/app/bookings/${upcoming[0]._id}`}>{upcoming[0].provider?.businessName} · {upcoming[0].status}</Link> : <p className="muted">None scheduled.</p>}
        </div>
        <div className="card">
          <h3>Notifications</h3>
          <p>{notes.unread} unread</p>
          <Link to="/app/notifications">View all</Link>
        </div>
        <div className="card">
          <h3>Saved providers</h3>
          {favs.slice(0, 3).map((f) => <div key={f._id}>{f.provider?.businessName}</div>)}
        </div>
        <div className="card">
          <h3>Recent bookings</h3>
          {bookings.slice(0, 3).map((b) => <div key={b._id}>{b.status}</div>)}
        </div>
      </div>
    </div>
  );
}
