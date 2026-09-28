import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, getError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageState from '../components/PageState';
import Stars from '../components/Stars';
import BeforeAfter from '../components/BeforeAfter';
import MapPlaceholder from '../components/MapPlaceholder';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

export default function ProviderPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [action, setAction] = useState('');
  const { success, error: showError } = useToast();

  useEffect(() => {
    api
      .get(`/providers/${id}`, { params: { lat: params.get('lat'), lng: params.get('lng') } })
      .then(({ data }) => setBundle(data.data))
      .catch((e) => setError(getError(e, 'Provider not found')))
      .finally(() => setLoading(false));
  }, [id, params]);

  async function save() {
    setAction('save');
    try {
      await api.post('/favorites', { providerId: id });
      setMessage('Saved to favorites');
      success('Saved to favorites.');
    } catch (e) {
      const nextMessage = getError(e);
      setMessage(nextMessage);
      showError(nextMessage);
    } finally {
      setAction('');
    }
  }

  async function chat() {
    setAction('chat');
    try {
      const { data } = await api.post('/messages/provider', { providerId: id });
      navigate(user.role === 'provider' ? `/provider/messages?c=${data.data.conversation._id}` : `/app/messages?c=${data.data.conversation._id}`);
    } catch (e) {
      showError(getError(e));
    } finally {
      setAction('');
    }
  }

  async function report() {
    const details = window.prompt('Why are you reporting this provider?');
    if (!details) return;
    setAction('report');
    try {
      await api.post('/reports', { targetType: 'provider', targetId: id, reason: 'other', details });
      setMessage('Report submitted');
      success('Report submitted.');
    } catch (e) {
      showError(getError(e));
    } finally {
      setAction('');
    }
  }

  const p = bundle?.provider;

  return (
    <div>
      <PageState loading={loading} error={error}>
        {p && (
          <>
            <div className="cover-hero" style={{ backgroundImage: p.coverImage ? `url(${p.coverImage})` : undefined, backgroundSize: 'cover' }} />
            <div className="container" style={{ paddingBottom: 48 }}>
              <img className="avatar" src={p.profileImage || '/favicon.svg'} alt="" />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1>{p.businessName}</h1>
                  <div className="chips">
                    {p.verificationStatus === 'approved' && <span className="badge badge-ok">Verified Provider</span>}
                    <span className="chip">SewaTrust {p.trustScore}%</span>
                    <span className="chip">{p.locationLabel} {bundle.distanceLabel ? `· ${bundle.distanceLabel}` : ''}</span>
                  </div>
                  <p><Stars value={p.averageRating} /> · {p.totalReviews} reviews · {p.completedJobs} jobs</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link className="btn btn-primary" to={`/request/${p._id}`}>Request service</Link>
                  {user && <button className="btn btn-outline" onClick={chat} disabled={action === 'chat'}>{action === 'chat' && <Spinner />}Chat</button>}
                  {user?.role === 'customer' && <button className="btn btn-outline" onClick={save} disabled={action === 'save'}>{action === 'save' && <Spinner />}Save</button>}
                  {user && <button className="btn btn-ghost" onClick={report} disabled={action === 'report'}>{action === 'report' && <Spinner />}Report</button>}
                </div>
              </div>
              {message && <p className="alert-ok" style={{ padding: 8 }}>{message}</p>}

              <div className="card" style={{ marginTop: 20 }}>
                <h3>SewaTrust</h3>
                <p className="match">{p.trustScore}%</p>
                <ul>
                  <li>{p.verificationStatus === 'approved' ? '✓ Verified' : 'Verification pending'}</li>
                  <li>✓ {p.completedJobs}+ completed jobs</li>
                  <li>✓ {p.averageRating} rating</li>
                  <li>✓ {p.responseRate}% response rate</li>
                </ul>
              </div>

              <h2>About</h2>
              <p>{p.description || 'This provider has not added a description yet.'}</p>
              <h2>Services</h2>
              <div className="grid grid-2">
                {bundle.services.map((s) => (
                  <div key={s._id} className="card">
                    <strong>{s.title}</strong>
                    <p className="muted">{s.description}</p>
                    <div>
                      {s.priceType === 'quotation' ? 'Custom quotation' : s.priceType === 'starting' ? `From NPR ${s.startingPrice}` : `NPR ${s.price}`}
                    </div>
                  </div>
                ))}
              </div>
              <h2>Working hours</h2>
              <div className="card">
                {Object.entries(p.workingHours || {}).map(([day, h]) => (
                  <div key={day}>{day}: {h.closed ? 'Closed' : `${h.open}–${h.close}`}</div>
                ))}
              </div>
              <h2>Service areas</h2>
              <div className="chips">{(p.serviceAreas || []).map((a) => <span key={a} className="chip">{a}</span>)}</div>
              <MapPlaceholder label={p.locationLabel} lat={p.location?.coordinates?.[1]} lng={p.location?.coordinates?.[0]} />
              <h2>Portfolio</h2>
              <div className="gallery">
                {bundle.portfolio.map((item) => (
                  <div key={item._id} className="card">
                    <strong>{item.title}</strong>
                    <p className="muted">{item.description}</p>
                    <BeforeAfter before={item.beforeImage} after={item.afterImage} />
                  </div>
                ))}
              </div>
              <h2>Reviews</h2>
              {bundle.reviews.map((r) => (
                <div key={r._id} className="card" style={{ marginBottom: 8 }}>
                  <Stars value={r.overallRating} />
                  <p>{r.comment}</p>
                  <small className="muted">{r.customer?.name}</small>
                </div>
              ))}
            </div>
          </>
        )}
      </PageState>
    </div>
  );
}
