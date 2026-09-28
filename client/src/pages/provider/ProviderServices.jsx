import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function ProviderServices() {
  const [services, setServices] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', priceType: 'fixed', price: '', startingPrice: '', description: '' });
  const [creating, setCreating] = useState(false);
  const { success, error } = useToast();
  useEffect(() => {
    api.get('/providers/me/services').then(({ data }) => setServices(data.data.services || []));
    api.get('/categories').then(({ data }) => setCats(data.data.categories || []));
  }, []);
  async function create(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/providers/me/services', form);
      setServices((current) => [data.data.service, ...current]);
      setForm({ title: '', category: '', priceType: 'fixed', price: '', startingPrice: '', description: '' });
      success('Service added.');
    } catch (err) {
      error(getError(err));
    } finally {
      setCreating(false);
    }
  }
  return (
    <div>
      <h1>Services</h1>
      <form className="card form-stack" onSubmit={create}>
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="">Category</option>
          {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value })}>
          <option value="fixed">Fixed</option>
          <option value="starting">Starting price</option>
          <option value="quotation">Quotation</option>
        </select>
        <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" placeholder="Starting price" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn btn-primary" disabled={creating}>{creating && <Spinner />}Add service</button>
      </form>
      {services.map((s) => (
        <div key={s._id} className="card" style={{ marginTop: 8 }}>
          <strong>{s.title}</strong> · {s.priceType} · NPR {s.price || s.startingPrice || 0}
        </div>
      ))}
    </div>
  );
}
