import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function ProviderProfileManage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ businessName: '', description: '', locationLabel: '', phone: '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { success, error } = useToast();
  useEffect(() => {
    api.get('/providers/me').then(({ data }) => {
      const p = data.data.provider;
      setForm({
        businessName: p.businessName || '',
        description: p.description || '',
        locationLabel: p.locationLabel || '',
        phone: p.phone || '',
      });
    });
  }, []);
  return (
    <div className="form-stack" style={{ maxWidth: 640 }}>
      <h1>Business profile</h1>
      {msg && <p>{msg}</p>}
      <form className="card form-stack" onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await api.put('/providers/me', form);
          setMsg('Saved');
          success('Business profile saved.');
        } catch (err) {
          error(getError(err));
        } finally {
          setSaving(false);
        }
      }}>
        <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input value={form.locationLabel} onChange={(e) => setForm({ ...form, locationLabel: e.target.value })} />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button className="btn btn-primary" disabled={saving}>{saving && <Spinner />}Save</button>
      </form>
      <button className="btn btn-outline" disabled={requesting} onClick={async () => {
        setRequesting(true);
        try {
          await api.post('/providers/me/verification', { message: `Verification request from ${user.name}` });
          setMsg('Verification requested');
          success('Verification request sent.');
        } catch (err) {
          error(getError(err));
        } finally {
          setRequesting(false);
        }
      }}>{requesting && <Spinner />}Request verification</button>
    </div>
  );
}
