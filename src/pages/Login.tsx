import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(email, password); navigate('/dashboard'); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.'); } finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-[460px] px-5 py-16"><div className="border border-line bg-white rounded-sm p-6"><p className="text-[11px] font-semibold tracking-[0.14em] text-navy-500">YATRASHIELD ACCOUNT</p><h1 className="mt-3 text-3xl font-semibold text-navy tracking-tight">Sign in</h1><p className="mt-2 text-sm text-charcoal-600">Access saved checks and emergency context.</p><form className="mt-7 space-y-4" onSubmit={submit}><label className="block text-[11px] font-semibold tracking-wide text-charcoal-400">EMAIL<input required type="email" className="mt-1.5 w-full border border-line rounded-sm px-3 py-2.5 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="block text-[11px] font-semibold tracking-wide text-charcoal-400">PASSWORD<input required type="password" className="mt-1.5 w-full border border-line rounded-sm px-3 py-2.5 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p role="alert" className="text-sm text-crit bg-crit-soft border border-crit/20 rounded-sm px-3 py-2">{error}</p>}<button disabled={busy} className="w-full bg-navy text-white text-xs font-semibold tracking-wide px-5 py-3 rounded-sm disabled:opacity-50">{busy ? 'SIGNING IN...' : 'SIGN IN'}</button></form><p className="mt-5 text-sm text-charcoal-600">New to YatraShield? <Link className="font-semibold text-navy-500" to="/register">Create a traveler account</Link></p><div className="mt-5 border-t border-line pt-4"><p className="text-[11px] font-semibold tracking-wide text-charcoal-400">DEMO ADMIN ACCESS</p><p className="mt-1 text-[11px] text-charcoal-600">admin@yatrashield.demo · Admin@12345</p><p className="mt-1 text-[11px] text-charcoal-400">Prototype credentials only. Replace with Supabase Auth before production.</p></div></div></div>;
}
