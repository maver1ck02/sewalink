import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getError } from '../../services/api';
import BarChart from '../../components/BarChart';
import PageState from '../../components/PageState';

export function AdminHome() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data.data.stats)).catch((e) => setError(getError(e)));
  }, []);
  if (!stats) return <PageState loading={!error} error={error} />;
  const cards = [
    ['Total users', stats.users],
    ['Providers', stats.providers],
    ['Verified providers', stats.verified],
    ['Active bookings', stats.activeBookings],
    ['Completed bookings', stats.completed],
    ['Pending reports', stats.pendingReports],
  ];
  return (
    <div>
      <h1>Admin dashboard</h1>
      <div className="grid grid-3">
        {cards.map(([k, v]) => (
          <div className="stat" key={k}><div className="muted">{k}</div><b>{v}</b></div>
        ))}
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  async function load() {
    const { data } = await api.get('/admin/users', { params: { q } });
    setUsers(data.data.users || []);
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1>Users</h1>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" />
        <button className="btn btn-outline">Search</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td><span className="badge badge-muted">{u.status}</span></td>
                <td>
                  {u.status === 'active' ? (
                    <button className="btn btn-ghost" onClick={async () => { await api.patch(`/admin/users/${u.id}/status`, { status: 'suspended' }); load(); }}>Suspend</button>
                  ) : (
                    <button className="btn btn-ghost" onClick={async () => { await api.patch(`/admin/users/${u.id}/status`, { status: 'active' }); load(); }}>Activate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminProviders({ verificationOnly = false }) {
  const [providers, setProviders] = useState([]);
  async function load() {
    const { data } = await api.get('/admin/providers', { params: verificationOnly ? { verificationStatus: 'pending' } : {} });
    setProviders(data.data.providers || []);
  }
  useEffect(() => { load(); }, [verificationOnly]);
  return (
    <div>
      <h1>{verificationOnly ? 'Verifications' : 'Providers'}</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Business</th><th>Category</th><th>Location</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p._id}>
                <td>{p.businessName}<div className="muted">{p.user?.email}</div></td>
                <td>{p.categories?.map((c) => c.name).join(', ')}</td>
                <td>{p.locationLabel}</td>
                <td>{p.verificationSubmittedAt ? new Date(p.verificationSubmittedAt).toLocaleDateString() : '—'}</td>
                <td><span className="badge badge-muted">{p.verificationStatus}</span></td>
                <td>
                  <Link to={`/providers/${p._id}`}>View</Link>
                  {p.verificationStatus === 'pending' && (
                    <>
                      <button className="btn btn-ghost" onClick={async () => { await api.post(`/admin/providers/${p._id}/verification`, { action: 'approve' }); load(); }}>Approve</button>
                      <button className="btn btn-ghost" onClick={async () => {
                        const note = window.prompt('Rejection reason');
                        if (!note) return;
                        await api.post(`/admin/providers/${p._id}/verification`, { action: 'reject', adminNote: note });
                        load();
                      }}>Reject</button>
                    </>
                  )}
                  <button className="btn btn-ghost" onClick={async () => { await api.patch(`/admin/providers/${p._id}/featured`, { featured: !p.featured }); load(); }}>{p.featured ? 'Unfeature' : 'Feature'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState('');
  async function load() {
    const { data } = await api.get('/admin/categories');
    setCats(data.data.categories || []);
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1>Categories</h1>
      <form className="card form-stack" onSubmit={async (e) => { e.preventDefault(); await api.post('/admin/categories', { name }); setName(''); load(); }}>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" />
        <button className="btn btn-primary">Add</button>
      </form>
      {cats.map((c) => <div key={c._id} className="card" style={{ marginTop: 8 }}>{c.name} · {c.isActive ? 'active' : 'hidden'}</div>)}
    </div>
  );
}

export function AdminServices() {
  const [services, setServices] = useState([]);
  useEffect(() => {
    api.get('/admin/services').then(({ data }) => setServices(data.data.services || []));
  }, []);
  return (
    <div>
      <h1>Services</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Provider</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>
            {services.map((s) => (
              <tr key={s._id}>
                <td>{s.title}</td>
                <td>{s.provider?.businessName}</td>
                <td>{s.priceType}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get('/admin/bookings').then(({ data }) => setBookings(data.data.bookings || [])); }, []);
  return (
    <div>
      <h1>Bookings</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Provider</th><th>Status</th><th>When</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}><td>{b.customer?.name}</td><td>{b.provider?.businessName}</td><td>{b.status}</td><td>{new Date(b.scheduledAt).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  async function load() {
    const { data } = await api.get('/admin/reviews');
    setReviews(data.data.reviews || []);
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1>Reviews</h1>
      {reviews.map((r) => (
        <div key={r._id} className="card" style={{ marginBottom: 8 }}>
          <strong>{r.overallRating}/5</strong> {r.comment}
          {r.isHidden ? <span className="badge badge-warn">Hidden</span> : <button className="btn btn-ghost" onClick={async () => { await api.patch(`/admin/reviews/${r._id}/hide`); load(); }}>Remove</button>}
        </div>
      ))}
    </div>
  );
}

export function AdminReports() {
  const [reports, setReports] = useState([]);
  async function load() {
    const { data } = await api.get('/admin/reports');
    setReports(data.data.reports || []);
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1>Reports</h1>
      {reports.map((r) => (
        <div key={r._id} className="card" style={{ marginBottom: 8 }}>
          <strong>{r.targetType}</strong> · {r.reason} · {r.status}
          <p>{r.details}</p>
          {['pending', 'investigating', 'resolved', 'rejected'].map((s) => (
            <button key={s} className="btn btn-ghost" onClick={async () => { await api.patch(`/admin/reports/${r._id}`, { status: s }); load(); }}>{s}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminAnalytics() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/admin/analytics').then(({ data: d }) => setData(d.data)); }, []);
  if (!data) return <div className="loading">Loading…</div>;
  return (
    <div>
      <h1>Analytics</h1>
      <div className="grid grid-2">
        <div><h3>New users</h3><BarChart items={data.usersPerMonth} /></div>
        <div><h3>New providers</h3><BarChart items={data.providersPerMonth} /></div>
        <div><h3>Bookings</h3><BarChart items={data.bookingsPerMonth} /></div>
        <div><h3>Completed</h3><BarChart items={data.completedPerMonth} /></div>
      </div>
      <h3>Popular categories</h3>
      <BarChart items={data.popularCategories} labelKey="name" />
      <h3>Most active providers</h3>
      {data.topProviders?.map((p) => <div key={p._id}>{p.businessName} · {p.completedJobs} jobs</div>)}
    </div>
  );
}

export function AdminAudit() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/admin/audit').then(({ data }) => setLogs(data.data.logs || [])); }, []);
  return (
    <div>
      <h1>Audit logs</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>When</th><th>Actor</th><th>Action</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id}><td>{new Date(l.createdAt).toLocaleString()}</td><td>{l.actor?.email}</td><td>{l.action}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminSettings() {
  const [form, setForm] = useState({ platformName: 'SewaLink', supportEmail: '', cancellationHours: 6 });
  const [msg, setMsg] = useState('');
  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => setForm(data.data.settings));
  }, []);
  return (
    <form className="card form-stack" style={{ maxWidth: 520 }} onSubmit={async (e) => {
      e.preventDefault();
      const { data } = await api.patch('/admin/settings', form);
      setForm(data.data.settings);
      setMsg('Saved');
    }}>
      <h1>Settings</h1>
      {msg && <p className="alert-ok">{msg}</p>}
      <label className="field"><span>Platform name</span><input value={form.platformName || ''} onChange={(e) => setForm({ ...form, platformName: e.target.value })} /></label>
      <label className="field"><span>Support email</span><input value={form.supportEmail || ''} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} /></label>
      <label className="field"><span>Cancellation notice (hours)</span><input type="number" value={form.cancellationHours || 6} onChange={(e) => setForm({ ...form, cancellationHours: Number(e.target.value) })} /></label>
      <button className="btn btn-primary">Save</button>
    </form>
  );
}
