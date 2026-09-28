import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, getError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageState from '../../components/PageState';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const providerNext = {
  REQUESTED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['SCHEDULED'],
  SCHEDULED: ['PROVIDER_ON_THE_WAY'],
  PROVIDER_ON_THE_WAY: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
};

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState({ estimatedPrice: '', description: '', notes: '' });
  const [review, setReview] = useState({ overallRating: 5, serviceQuality: 5, communication: 5, professionalism: 5, comment: '' });
  const [busy, setBusy] = useState('');
  const { success, error: showError } = useToast();

  async function load() {
    const { data: d } = await api.get(`/bookings/${id}`);
    setData(d.data);
  }
  useEffect(() => { load().catch((e) => setError(getError(e))); }, [id]);

  async function setStatus(status) {
    setBusy(`status-${status}`);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      await load();
      success(`Booking status updated to ${status.replace(/_/g, ' ')}.`);
    } catch (e) {
      showError(getError(e));
    } finally {
      setBusy('');
    }
  }

  const booking = data?.booking;
  const isProvider = user?.role === 'provider';

  return (
    <PageState loading={!data && !error} error={error}>
      {booking && (
        <div>
          <h1>Booking</h1>
          <p className="badge badge-muted">{booking.status}</p>
          <p>{booking.description}</p>
          <p>{booking.address} · {new Date(booking.scheduledAt).toLocaleString()}</p>
          <p>Price: NPR {booking.quotedPrice || 0}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {user?.role === 'customer' && ['REQUESTED', 'ACCEPTED', 'SCHEDULED'].includes(booking.status) && (
              <button className="btn btn-outline" onClick={() => setStatus('CANCELLED')} disabled={Boolean(busy)}>{busy === 'status-CANCELLED' && <Spinner />}Cancel</button>
            )}
            {isProvider && (providerNext[booking.status] || []).map((s) => (
              <button key={s} className="btn btn-primary" onClick={() => setStatus(s)} disabled={Boolean(busy)}>{busy === `status-${s}` && <Spinner />}{s.replace(/_/g, ' ')}</button>
            ))}
          </div>

          {isProvider && booking.status === 'REQUESTED' && (
            <form className="card form-stack" style={{ marginTop: 16 }} onSubmit={async (e) => {
              e.preventDefault();
              setBusy('quote');
              try {
                await api.post('/quotations', { bookingId: id, ...quote, estimatedPrice: Number(quote.estimatedPrice) });
                await load();
                success('Quotation sent.');
              } catch (err) {
                showError(getError(err));
              } finally {
                setBusy('');
              }
            }}>
              <h3>Send quotation</h3>
              <input type="number" required placeholder="Estimated price (NPR)" value={quote.estimatedPrice} onChange={(e) => setQuote({ ...quote, estimatedPrice: e.target.value })} />
              <textarea placeholder="What's included" value={quote.description} onChange={(e) => setQuote({ ...quote, description: e.target.value })} />
              <button className="btn btn-primary" disabled={Boolean(busy)}>{busy === 'quote' && <Spinner />}Send quote</button>
            </form>
          )}

          {data.quotations?.map((q) => (
            <div key={q._id} className="card" style={{ marginTop: 12 }}>
              <strong>NPR {q.estimatedPrice}</strong> · {q.status}
              <p>{q.description}</p>
              {user?.role === 'customer' && q.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" disabled={Boolean(busy)} onClick={async () => { setBusy(`quote-${q._id}`); try { await api.post(`/quotations/${q._id}/respond`, { action: 'accept' }); await load(); success('Quotation accepted.'); } catch (err) { showError(getError(err)); } finally { setBusy(''); } }}>{busy === `quote-${q._id}` && <Spinner />}Accept quote</button>
                  <button className="btn btn-outline" disabled={Boolean(busy)} onClick={async () => { setBusy(`quote-${q._id}`); try { await api.post(`/quotations/${q._id}/respond`, { action: 'reject' }); await load(); success('Quotation rejected.'); } catch (err) { showError(getError(err)); } finally { setBusy(''); } }}>Reject</button>
                </div>
              )}
            </div>
          ))}

          {user?.role === 'customer' && booking.status === 'COMPLETED' && (
            <form className="card form-stack" style={{ marginTop: 16 }} onSubmit={async (e) => {
              e.preventDefault();
              setBusy('review');
              try {
                await api.post('/reviews', { bookingId: id, ...review });
                await load();
                success('Review submitted.');
              } catch (err) {
                showError(getError(err));
              } finally {
                setBusy('');
              }
            }}>
              <h3>Leave a review</h3>
              {['overallRating', 'serviceQuality', 'communication', 'professionalism'].map((k) => (
                <label key={k} className="field"><span>{k}</span>
                  <input type="number" min="1" max="5" value={review[k]} onChange={(e) => setReview({ ...review, [k]: Number(e.target.value) })} />
                </label>
              ))}
              <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
              <button className="btn btn-primary" disabled={Boolean(busy)}>{busy === 'review' && <Spinner />}Submit review</button>
            </form>
          )}
        </div>
      )}
    </PageState>
  );
}
