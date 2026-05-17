import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const PLANS = {
  starter:  { label: 'Starter',       color: '#9A968C' },
  passion:  { label: 'Pack Passion',  color: '#E4B86E' },
  studio:   { label: 'Pack Studio',   color: '#6EC79A' },
};

const TIPS = [
  'Photographiez le vêtement en entier, sans rogner les bords.',
  'Évitez les fonds surchargés ou trop colorés.',
  'Lumière naturelle ou fond uni = résultat optimal.',
  'Ne zoomez pas uniquement sur un détail (logo, couture).',
  "L'IA préserve 100% des couleurs et de la coupe d'origine.",
];

export default function Account() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const d = await res.json();
      setProfile(d);
      setGenerations(d.generations || []);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="loading-page"><span className="loading-dot" /></div>;

  const plan = PLANS[profile?.plan] || PLANS.starter;

  return (
    <>
      <Head><title>Votre Studio · Photo Studio</title></Head>

      <nav className="nav container">
        <Link href="/app" className="back-link">← Retour</Link>
        <button className="btn btn-ghost" onClick={handleLogout}>→ Se déconnecter</button>
      </nav>

      <main className="container main">
        <div className="page-head">
          <h1 className="page-title">Votre Studio</h1>
          <p className="page-sub">Gérez vos crédits et sublimez vos vêtements.</p>
        </div>

        <div className="grid">
          {/* Card gauche — Crédits & Plan */}
          <div className="card">
            <div className="card-head">
              <span className="card-icon">◈</span>
              <span className="card-title">Crédits & Plan</span>
              <span className="realtime-dot">● Mis à jour en temps réel</span>
            </div>

            <div className="credits-block">
              <span className="credits-num">{profile?.credits ?? 0}</span>
              <span className="credits-lbl">crédits disponibles</span>
            </div>

            <div className="plan-badge" style={{ color: plan.color, borderColor: plan.color }}>
              {plan.label}
            </div>

            <div className="buy-actions">
              <Link href="/buy">
                <button className="btn btn-primary btn-block buy-btn">⚡ Acheter des crédits</button>
              </Link>
            </div>

            <div className="profile-info">
              <div className="avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
              </div>
              <div>
                <p className="profile-email">{profile?.email}</p>
                {profile?.full_name && <p className="profile-name">{profile.full_name}</p>}
              </div>
            </div>
          </div>

          {/* Card droite — Règles d'or */}
          <div className="card">
            <div className="card-head">
              <span className="card-icon">◎</span>
              <span className="card-title">Règles d'or pour un rendu parfait</span>
            </div>
            <ul className="tips">
              {TIPS.map((t, i) => (
                <li key={i} className="tip">
                  <span className="tip-check">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Galerie */}
        {generations.length > 0 && (
          <div className="gallery-section">
            <h2 className="gallery-title">Ma Galerie</h2>
            <div className="gallery-grid">
              {generations.map((g) => (
                <div key={g.id} className="gallery-item">
                  {g.image_url
                    ? <img src={g.image_url} alt="" className="gallery-img" />
                    : <div className="gallery-placeholder">…</div>}
                  <p className="gallery-date">{new Date(g.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        :global(.loading-page) { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; }
        :global(.loading-dot) { width:8px; height:8px; background:var(--accent); border-radius:50%; animation:pulse 1s ease infinite; }

        .nav { display:flex; align-items:center; justify-content:space-between; padding-top:20px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .back-link { font-size:14px; color:var(--ink-muted); transition:color .15s; }
        .back-link:hover { color:var(--ink); }

        .main { padding-top:48px; padding-bottom:80px; }
        .page-head { margin-bottom:36px; }
        .page-title { font-size:32px; font-weight:700; letter-spacing:-0.03em; margin:0 0 6px; }
        .page-sub { font-size:14px; color:var(--ink-muted); margin:0; }

        .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:48px; }
        @media (max-width:768px) { .grid { grid-template-columns:1fr; } }

        .card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); padding:28px; }

        .card-head { display:flex; align-items:center; gap:10px; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .card-icon { font-size:16px; color:var(--accent); }
        .card-title { font-size:14px; font-weight:600; flex:1; }
        .realtime-dot { font-size:11px; color:var(--success); font-family:var(--font-mono); letter-spacing:0.3px; }

        .credits-block { margin-bottom:16px; }
        .credits-num { display:block; font-size:56px; font-weight:700; letter-spacing:-0.04em; color:var(--ink); line-height:1; }
        .credits-lbl { font-size:13px; color:var(--ink-muted); font-family:var(--font-mono); letter-spacing:0.3px; }

        .plan-badge { display:inline-block; font-size:12px; font-weight:600; border:1px solid; border-radius:4px; padding:3px 10px; margin-bottom:24px; font-family:var(--font-mono); letter-spacing:0.5px; text-transform:uppercase; }

        .buy-actions { margin-bottom:28px; }
        .buy-btn { font-size:14px; padding:12px 22px; }

        .profile-info { display:flex; align-items:center; gap:12px; padding-top:20px; border-top:1px solid var(--border); }
        .avatar { width:36px; height:36px; background:var(--bg-soft); border:1px solid var(--border-strong); border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--ink-faint); flex-shrink:0; }
        .profile-email { font-size:13px; color:var(--ink-muted); margin:0; }
        .profile-name { font-size:12px; color:var(--ink-faint); margin:2px 0 0; font-family:var(--font-mono); }

        .tips { list-style:none; display:flex; flex-direction:column; gap:14px; }
        .tip { display:flex; align-items:flex-start; gap:10px; font-size:14px; color:var(--ink-muted); line-height:1.5; }
        .tip-check { color:var(--success); flex-shrink:0; margin-top:1px; font-size:13px; }

        .gallery-section { margin-top:8px; }
        .gallery-title { font-size:16px; font-weight:600; letter-spacing:-0.01em; margin:0 0 20px; }
        .gallery-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:10px; }
        .gallery-item { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-md); overflow:hidden; }
        .gallery-img { width:100%; aspect-ratio:1; object-fit:cover; display:block; }
        .gallery-placeholder { aspect-ratio:1; display:flex; align-items:center; justify-content:center; color:var(--ink-faint); font-size:20px; }
        .gallery-date { font-size:10px; color:var(--ink-faint); text-align:center; padding:6px; font-family:var(--font-mono); letter-spacing:0.3px; margin:0; }
      `}</style>
    </>
  );
}
