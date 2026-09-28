import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiDroplet, FiZap, FiMonitor, FiSmartphone, FiWind, FiCamera, FiBookOpen, FiTool } from 'react-icons/fi';
import { api } from '../services/api';
import { CITIES } from '../constants/locations';
import Stars from '../components/Stars';

const popular = [
  { name: 'Plumbing', icon: FiDroplet, slug: 'plumbing' },
  { name: 'Electrical', icon: FiZap, slug: 'electrical' },
  { name: 'Computer Repair', icon: FiMonitor, slug: 'computer-repair' },
  { name: 'Mobile Repair', icon: FiSmartphone, slug: 'mobile-repair' },
  { name: 'Cleaning', icon: FiWind, slug: 'cleaning' },
  { name: 'Photography', icon: FiCamera, slug: 'photography' },
  { name: 'Tutoring', icon: FiBookOpen, slug: 'tutoring' },
  { name: 'Carpentry', icon: FiTool, slug: 'carpentry' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('Kathmandu');
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/providers', { params: { sort: 'rating', limit: 4, verified: true } }).then(({ data }) => {
      setFeatured(data.data.providers || []);
    }).catch(() => {});
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const city = CITIES.find((c) => c.label === location);
    const params = new URLSearchParams({ q, location });
    if (city) {
      params.set('lat', city.lat);
      params.set('lng', city.lng);
    }
    navigate(`/search?${params.toString()}`);
  }

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Find trusted people for every job.</h1>
          <p>From home repairs to professional services, discover skilled people near you.</p>
          <form className="search-panel" onSubmit={onSearch}>
            <label className="field">
              <span>What service do you need?</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Laptop repair, plumber, tutor…" />
            </label>
            <label className="field">
              <span>Select location</span>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c.label}>{c.label}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary" type="submit">
              <FiSearch /> Find Services
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Popular services</h2>
          <p className="muted">Start with the jobs people book most often in Nepal.</p>
          <div className="grid grid-4" style={{ marginTop: 20 }}>
            {popular.map((s) => (
              <Link key={s.slug} className="card service-card" to={`/search?q=${encodeURIComponent(s.name)}`}>
                <div className="icon-blob">
                  <s.icon />
                </div>
                <strong>{s.name}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>How SewaLink works</h2>
          <div className="steps" style={{ marginTop: 24 }}>
            {[
              ['01', 'Search', 'Describe the job and pick a city.'],
              ['02', 'Compare', 'Use SewaLink Smart Match, ratings, and SewaTrust.'],
              ['03', 'Book', 'Request a time, get a quote if needed, confirm.'],
              ['04', 'Get it done', 'Chat, track status, then leave a review.'],
            ].map(([n, t, d]) => (
              <div key={n}>
                <div className="step-num">{n}</div>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Trusted providers</h2>
          <div className="grid grid-4" style={{ marginTop: 20 }}>
            {featured.map((p) => (
              <Link key={p._id} to={`/providers/${p._id}`} className="card provider-card">
                <div className="cover" />
                <div className="provider-body">
                  <strong>{p.businessName}</strong>
                  <div className="muted">{p.locationLabel}</div>
                  <Stars value={p.averageRating} />
                  {p.verificationStatus === 'approved' && <div className="badge badge-ok">Verified</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Customer reviews</h2>
          <div className="grid grid-3" style={{ marginTop: 20 }}>
            {[
              ['Anisha T.', 'Booked laptop repair in Kathmandu. Clear quote and same-day fix.'],
              ['Prabin K.', 'Plumber arrived on time and explained the leak before starting.'],
              ['Sita R.', 'Photography for our event in Pokhara felt professional from chat to delivery.'],
            ].map(([n, t]) => (
              <blockquote key={n} className="card">
                <p>{t}</p>
                <footer className="muted">— {n}</footer>
              </blockquote>
            ))}
          </div>
          <div className="cta-band" style={{ marginTop: 40 }}>
            <div>
              <h2>Become a provider</h2>
              <p className="muted">Offer your skills, set your prices, and get verified.</p>
            </div>
            <Link className="btn btn-primary" to="/become-provider">
              Join SewaLink
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
