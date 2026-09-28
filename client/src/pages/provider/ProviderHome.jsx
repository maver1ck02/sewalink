import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import BarChart from '../../components/BarChart';

export default function ProviderHome() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    api.get('/providers/me/analytics').then(({ data }) => setStats(data.data));
    api.get('/bookings').then(({ data }) => setBookings(data.data.bookings || []));
  }, []);
  const t = stats?.totals || {};
  return (
    <div>
      <h1>Provider dashboard</h1>
      <div className="grid grid-4">
        {[['Requests', t.requests], ['Accepted', t.accepted], ['Completed', t.completed], ['Pending', t.pending], ['Earnings', t.earnings], ['Rating', t.rating]].map(([k, v]) => (
          <div className="stat" key={k}><div className="muted">{k}</div><b>{v ?? 0}</b></div>
        ))}
      </div>
      <div className="grid grid-2" style={{ marginTop: 20 }}>
        <div>
          <h3>Monthly bookings</h3>
          <BarChart items={stats?.monthlyBookings || []} />
        </div>
        <div>
          <h3>Monthly earnings</h3>
          <BarChart items={stats?.monthlyEarnings || []} valueKey="amount" />
        </div>
      </div>
      <h3>Recent requests</h3>
      {bookings.filter((b) => b.status === 'REQUESTED').map((b) => (
        <div key={b._id} className="card"><Link to={`/provider/requests/${b._id}`}>{b.customer?.name} · {b.description}</Link></div>
      ))}
    </div>
  );
}
