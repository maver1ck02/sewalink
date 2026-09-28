import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getError } from '../services/api';
import { toIsoDate } from '../utils/dates';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

export default function RequestPage() {
  const { providerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ serviceId: '', scheduledAt: '', address: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/providers/${providerId}`).then(({ data }) => setServices(data.data.services || []));
  }, [providerId]);

  if (!user) {
    return (
      <div className="section container">
        <p>Please log in as a customer to request a service.</p>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        ...form,
        providerId,
        scheduledAt: toIsoDate(form.scheduledAt),
      });
      success('Booking request sent.');
      navigate(`/app/bookings/${data.data.booking._id}`);
    } catch (err) {
      const message = getError(err);
      setError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section">
      <form className="container card form-stack" onSubmit={submit} style={{ maxWidth: 640 }}>
        <h1>Request a service</h1>
        {error && <div className="alert">{error}</div>}
        <label className="field">
          <span>Service</span>
          <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
            <option value="">Select</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.title}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Date and time</span>
          <input type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
        </label>
        <label className="field">
          <span>Location / address</span>
          <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label className="field">
          <span>Describe the problem</span>
          <textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting && <Spinner />} Send request
        </button>
      </form>
    </div>
  );
}
