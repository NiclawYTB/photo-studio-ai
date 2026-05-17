import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push('/app');
  };

  return (
    <>
      <Head><title>Créer un compte · Photo Studio</title></Head>
      <div className="page">
        <div className="box">
          <Link href="/" className="logo" style={{ marginBottom: 36, display: 'inline-flex' }}>
            <span className="logo-mark" />
            <span className="logo-text">Photo Studio</span>
          </Link>
          <h1 className="title">Créer un compte</h1>
          <p className="sub">Commence à générer tes photos studio</p>
          <form onSubmit={handleRegister}>
            <label className="lbl">Email</label>
            <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required />
            <label className="lbl">Mot de passe</label>
            <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caractères" required minLength={6} />
            {error && <p className="err">{error}</p>}
            <button type="submit" className={`btn btn-primary btn-block ${loading ? 'btn-disabled' : ''}`} disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte →'}
            </button>
          </form>
          <p className="foot">Déjà un compte ? <Link href="/login" className="accent-link">Se connecter</Link></p>
        </div>
      </div>
      <style jsx>{`
        .page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; background:var(--bg); }
        .box { width:100%; max-width:400px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); padding:40px; }
        .title { font-size:24px; font-weight:600; letter-spacing:-0.02em; margin:0 0 6px; }
        .sub { font-size:14px; color:var(--ink-muted); margin:0 0 32px; }
        .lbl { display:block; font-family:var(--font-mono); font-size:10px; color:var(--ink-faint); letter-spacing:1.6px; text-transform:uppercase; margin-bottom:8px; }
        .inp { display:block; width:100%; padding:11px 14px; background:var(--bg-soft); border:1px solid var(--border-strong); border-radius:var(--r-md); font-size:14px; color:var(--ink); margin-bottom:20px; outline:none; box-sizing:border-box; transition:border-color .15s; }
        .inp:focus { border-color:var(--accent); }
        .err { color:var(--danger); font-size:13px; margin-bottom:16px; padding:10px 12px; background:rgba(225,91,91,.08); border:1px solid rgba(225,91,91,.2); border-radius:var(--r); }
        .foot { text-align:center; margin-top:24px; font-size:14px; color:var(--ink-muted); }
        :global(.accent-link) { color:var(--accent); }
        :global(.accent-link:hover) { color:var(--accent-bright); }
      `}</style>
    </>
  );
}
