import { useState } from 'react';
import { api, getError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', locationLabel: user?.locationLabel || '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useToast();
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', form);
      setUser(data.data.user);
      setMsg('Saved');
      success('Profile saved.');
    } catch (err) {
      const message = getError(err);
      setMsg(message);
      showError(message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="card form-stack" onSubmit={submit} style={{ maxWidth: 520 }}>
      <h1>Profile</h1>
      {msg && <p>{msg}</p>}
      <label className="field"><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="field"><span>Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label className="field"><span>Location</span><input value={form.locationLabel} onChange={(e) => setForm({ ...form, locationLabel: e.target.value })} /></label>
      <button className="btn btn-primary" disabled={saving}>{saving && <Spinner />}Save</button>
    </form>
  );
}
