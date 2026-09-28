import { useState } from 'react';
import { api, getError } from '../services/api';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMsg(data.message);
    } catch (err) {
      setError(getError(err));
    }
  }
  return (
    <div className="auth-page">
      <form className="card auth-card form-stack" onSubmit={submit}>
        <h1>Forgot password</h1>
        {error && <div className="alert">{error}</div>}
        {msg && <div className="alert-ok">{msg}</div>}
        <label className="field"><span>Email</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <button className="btn btn-primary">Send reset link</button>
      </form>
    </div>
  );
}
