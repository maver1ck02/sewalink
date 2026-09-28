import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getError } from '../services/api';

export default function ResetPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/reset-password', { token: params.get('token'), password });
      setMsg(data.message);
    } catch (err) {
      setError(getError(err));
    }
  }
  return (
    <div className="auth-page">
      <form className="card auth-card form-stack" onSubmit={submit}>
        <h1>Reset password</h1>
        {error && <div className="alert">{error}</div>}
        {msg && <div className="alert-ok">{msg}</div>}
        <label className="field"><span>New password</span><input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn btn-primary">Update password</button>
      </form>
    </div>
  );
}
