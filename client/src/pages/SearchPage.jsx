import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getError } from '../services/api';
import { CITIES } from '../constants/locations';
import PageState from '../components/PageState';
import Stars from '../components/Stars';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ providers: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [compareIds, setCompareIds] = useState([]);

  const q = params.get('q') || '';
  const location = params.get('location') || '';
  const lat = params.get('lat') || '';
  const lng = params.get('lng') || '';

  function update(next) {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v == null) merged.delete(k);
      else merged.set(k, v);
    });
    setParams(merged);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      update({ lat: pos.coords.latitude, lng: pos.coords.longitude, location: 'Near me' });
    });
  }

  useEffect(() => {
    api.get('/categories').then(({ data: d }) => setCategories(d.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/providers', { params: Object.fromEntries(params.entries()) })
      .then(({ data: d }) => setData(d.data))
      .catch((e) => setError(getError(e)))
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="section">
      <div className="container">
        <h1>Find providers</h1>
        <div className="grid" style={{ gridTemplateColumns: '260px 1fr', gap: 24, marginTop: 20 }}>
          <aside className="card">
            <label className="field">
              <span>Keyword</span>
              <input value={q} onChange={(e) => update({ q: e.target.value, page: 1 })} />
            </label>
            <label className="field">
              <span>Location</span>
              <select
                value={location}
                onChange={(e) => {
                  const city = CITIES.find((c) => c.label === e.target.value);
                  update({ location: e.target.value, lat: city?.lat, lng: city?.lng, page: 1 });
                }}
              >
                <option value="">All cities</option>
                {CITIES.map((c) => (
                  <option key={c.label}>{c.label}</option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn-outline" onClick={useMyLocation}>
              Use my location
            </button>
            <label className="field">
              <span>Category</span>
              <select value={params.get('category') || ''} onChange={(e) => update({ category: e.target.value, page: 1 })}>
                <option value="">Any</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Min rating</span>
              <select value={params.get('minRating') || ''} onChange={(e) => update({ minRating: e.target.value, page: 1 })}>
                <option value="">Any</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </label>
            <label>
              <input type="checkbox" checked={params.get('verified') === 'true'} onChange={(e) => update({ verified: e.target.checked ? 'true' : '', page: 1 })} /> Verified only
            </label>
            <label>
              <input type="checkbox" checked={params.get('available') === 'true'} onChange={(e) => update({ available: e.target.checked ? 'true' : '', page: 1 })} /> Available now
            </label>
            <label className="field">
              <span>Sort</span>
              <select value={params.get('sort') || 'match'} onChange={(e) => update({ sort: e.target.value })}>
                <option value="match">SewaLink Smart Match</option>
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="price">Price</option>
              </select>
            </label>
          </aside>
          <div>
            <PageState loading={loading} error={error} empty={!data.providers?.length && 'No providers match these filters.'}>
              <p className="muted">{data.pagination.total} providers</p>
              {compareIds.length >= 2 && (
                <p>
                  <Link className="btn btn-outline" to={`/compare?ids=${compareIds.join(',')}`}>
                    Compare {compareIds.length} providers
                  </Link>
                </p>
              )}
              <div className="grid grid-2">
                {data.providers.map((p) => (
                  <article key={p._id} className="card">
                    <label style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={compareIds.includes(p._id)}
                        onChange={(e) => {
                          setCompareIds((ids) =>
                            e.target.checked ? [...ids, p._id] : ids.filter((id) => id !== p._id)
                          );
                        }}
                      />
                      Compare
                    </label>
                  <Link to={`/providers/${p._id}${lat ? `?lat=${lat}&lng=${lng}` : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{p.businessName}</strong>
                      <span className="match">{p.matchScore}% Match</span>
                    </div>
                    <div className="muted">{p.locationLabel} {p.distanceLabel ? `· ${p.distanceLabel}` : ''}</div>
                    <Stars value={p.averageRating} />
                    <div className="chips" style={{ marginTop: 8 }}>
                      {p.verificationStatus === 'approved' && <span className="badge badge-ok">Verified</span>}
                      <span className="chip">SewaTrust {p.trustScore}%</span>
                      {p.startingFrom ? <span className="chip">From NPR {p.startingFrom}</span> : <span className="chip">Quote</span>}
                    </div>
                  </Link>
                  </article>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-outline" disabled={data.pagination.page <= 1} onClick={() => update({ page: data.pagination.page - 1 })}>
                  Previous
                </button>
                <button className="btn btn-outline" disabled={data.pagination.page >= data.pagination.pages} onClick={() => update({ page: data.pagination.page + 1 })}>
                  Next
                </button>
              </div>
            </PageState>
          </div>
        </div>
      </div>
    </div>
  );
}
