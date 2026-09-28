import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getError } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await login(form);
      const role = data.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'provider' ? '/provider' : '/app');
    } catch (err) {
      setError(getError(err, 'Login failed'));
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card form-stack" onSubmit={submit}>
        <h1>Log in</h1>
        {error && <div className="alert">{error}</div>}
        <label className="field"><span>Email</span><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="field"><span>Password</span><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn btn-primary" type="submit">Continue</button>
        <Link to="/forgot-password">Forgot password?</Link>
        <p className="muted">No account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
