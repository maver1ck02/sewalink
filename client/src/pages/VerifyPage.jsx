import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getError } from '../services/api';

export default function VerifyPage() {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState('Verifying…');
  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setMsg('Missing token');
      return;
    }
    api.post('/auth/verify-email', { token }).then(({ data }) => setMsg(data.message)).catch((e) => setMsg(getError(e)));
  }, [params]);
  return (
    <div className="auth-page">
      <div className="card auth-card">{msg}</div>
    </div>
  );
}
