import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getError } from '../services/api';
import PageState from '../components/PageState';
import Stars from '../components/Stars';

export default function ComparePage() {
  const [params] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const ids = params.get('ids') || '';

  useEffect(() => {
    if (!ids) return;
    api
      .get('/providers/compare', { params: { ids } })
      .then(({ data: d }) => setData(d.data))
      .catch((e) => setError(getError(e)));
  }, [ids]);

  return (
    <div className="section">
      <div className="container">
        <h1>Compare providers</h1>
        <PageState loading={!data && !error && Boolean(ids)} error={error} empty={!ids && 'Select at least two providers from search.'}>
          {data && (
            <div className="compare">
              {data.providers.map((p) => (
                <article key={p._id} className="card">
                  <h2>{p.businessName}</h2>
                  <p className="muted">{p.locationLabel}</p>
                  {p.verificationStatus === 'approved' && <span className="badge badge-ok">Verified</span>}
                  <p>SewaTrust {p.trustScore}%</p>
                  <Stars value={p.averageRating} />
                  <p>{p.completedJobs} completed jobs</p>
                  <p>{p.experienceYears} years experience</p>
                  <ul>
                    {data.services
                      .filter((s) => String(s.provider) === String(p._id))
                      .map((s) => (
                        <li key={s._id}>
                          {s.title} — {s.priceType === 'quotation' ? 'Quote' : `NPR ${s.price || s.startingPrice}`}
                        </li>
                      ))}
                  </ul>
                  <Link className="btn btn-primary" to={`/providers/${p._id}`}>
                    View profile
                  </Link>
                </article>
              ))}
            </div>
          )}
        </PageState>
      </div>
    </div>
  );
}
