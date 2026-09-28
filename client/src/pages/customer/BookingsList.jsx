import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import PageState from '../../components/PageState';

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/bookings').then(({ data }) => setBookings(data.data.bookings || [])).finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <h1>Bookings</h1>
      <PageState loading={loading} empty={!bookings.length && 'No bookings yet.'}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Provider / customer</th><th>When</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td><Link to={`./${b._id}`}>{b.provider?.businessName || b.customer?.name}</Link></td>
                  <td>{new Date(b.scheduledAt).toLocaleString()}</td>
                  <td><span className="badge badge-muted">{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageState>
    </div>
  );
}
