import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getError } from '../services/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await register(form);
      setOk(data.message + (data.data.verifyToken ? ` Dev verify token: ${data.data.verifyToken}` : ''));
    } catch (err) {
      setError(getError(err));
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card form-stack" onSubmit={submit}>
        <h1>Create account</h1>
        {error && <div className="alert">{error}</div>}
        {ok && <div className="alert-ok">{ok}</div>}
        <label className="field"><span>Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="field"><span>Email</span><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="field"><span>Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="field"><span>Password</span><input type="password" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label className="field">
          <span>I am a</span>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="customer">Customer</option>
            <option value="provider">Service provider</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit">Register</button>
        <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
