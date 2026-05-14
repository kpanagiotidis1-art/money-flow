import { useState } from 'react';
import { supabase } from '../lib/supabase';

// AuthScreen — shown when no user is logged in.
// Handles both sign up and login with the same form.
// Supabase handles all the password hashing and session management.

export default function AuthScreen() {
  const [mode,     setMode]     = useState('login');   // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);     // signup confirmation sent

  async function handleSubmit() {
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setDone(true); // Supabase sends a confirmation email
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      // On success, App.jsx will detect the session and unmount this screen
    }

    setLoading(false);
  }

  // ── Styles (inline so this screen has zero dependency on index.css) ──
  const wrap = {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#f8f8f7', padding: '32px 24px', fontFamily: "'DM Sans', sans-serif",
  };
  const card = {
    width: '100%', maxWidth: 360, background: '#fff',
    borderRadius: 20, padding: '32px 24px',
    border: '0.5px solid #e4e3df',
  };
  const inputStyle = {
    width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 15,
    padding: '12px 14px', borderRadius: 10, marginBottom: 10,
    border: '0.5px solid #e4e3df', background: '#f8f8f7',
    color: '#0a0a0a', outline: 'none', boxSizing: 'border-box',
  };
  const btn = {
    width: '100%', padding: 16, borderRadius: 12, border: 'none',
    background: '#0a0a0a', color: '#fff', fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, fontWeight: 500, textTransform: 'uppercase',
    letterSpacing: '0.08em', cursor: 'pointer', marginTop: 4,
    opacity: loading ? 0.6 : 1,
  };
  const switchBtn = {
    background: 'none', border: 'none', color: '#b0aea8',
    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
    cursor: 'pointer', marginTop: 16, textAlign: 'center',
    width: '100%', display: 'block',
  };

  if (done) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 10 }}>Check your email</div>
          <div style={{ fontSize: 14, color: '#6b6966', lineHeight: 1.6 }}>
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account, then come back and log in.
          </div>
          <button style={{ ...switchBtn, marginTop: 24 }} onClick={() => { setDone(false); setMode('login'); }}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 4 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </div>
        <div style={{ fontSize: 13, color: '#b0aea8', marginBottom: 24 }}>Money Flow</div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          autoCapitalize="none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        {error && (
          <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 8, padding: '8px 12px', background: '#fceeed', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button style={btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <button
          style={switchBtn}
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
