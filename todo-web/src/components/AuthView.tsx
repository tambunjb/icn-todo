import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { login, register } from '../features/auth/authSlice';

export default function AuthView() {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((s: RootState) => s.auth);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await dispatch(login({ email, password }));
    } else {
      await dispatch(register({ email, password, displayName }));
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setMode('login')} disabled={mode==='login'}>Login</button>
        <button onClick={() => setMode('register')} disabled={mode==='register'}>Register</button>
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {mode === 'register' && (
            <input placeholder="Display name (optional)" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          )}
          <button type="submit" disabled={status==='loading'}>
            {status==='loading' ? 'Please wait…' : (mode==='login' ? 'Login' : 'Register')}
          </button>
          {error && <div style={{ color:'crimson' }}>{error}</div>}
        </div>
      </form>
    </div>
  );
}