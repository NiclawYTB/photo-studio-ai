import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const PLANS = {
  starter: { label: 'Starter',      color: '#E4B86E' },
  passion: { label: 'Pack Passion', color: '#E4B86E' },
  studio:  { label: 'Pack Studio',  color: '#6EC79A' },
};

// Récompenses parrainage (affichage ; le créditage auto = phase 2 backend)
const REFERRAL_REWARD = 5;   // crédits pour le parrain
const REFERRAL_WELCOME = 2;  // crédits offerts au filleul

export default function Account() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Édition du nom
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Parrainage
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
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

  const displayName = () => {
    if (profile?.full_name) return profile.full_name;
    const email = profile?.email || '';
    return email.split('@')[0] || 'Mon profil';
  };

  const startEdit = () => {
    setNameInput(profile?.full_name || '');
    setEditingName(true);
  };

  const saveName = async () => {
    setSavingName(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ full_name: nameInput }),
      });
      const d = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, full_name: d.full_name }));
        setEditingName(false);
      }
    } finally {
      setSavingName(false);
    }
  };

  const inviteLink = profile?.id && origin ? `${origin}/register?ref=${profile.id}` : '';

  const copyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) { /* clipboard indisponible */ }
  };

  if (loading) return <div className="loading-page"><span className="loading-dot" /></div>;

  const plan = PLANS[profile?.plan] || PLANS.starter;

  return (
    <>
      <Head><title>Mon Compte · Photo Studio</title></Head>

      <nav className="nav container">
        <Link href="/app" className="logo">
          <span className="logo-mark" />
          <span className="logo-text">Photo Studio</span>
        </Link>

        <div className="nav-mid">
          <a href="#galerie" className="nav-link">Ma Galerie</a>
          <span className="nav-link nav-link-active">Mon Compte</span>
          <a href="#parrainage" className="nav-link">Devenir affilié</a>
        </div>

        <div className="nav-right">
          <Link href="/buy" className="upgrade-btn">✦ Mettre à niveau</Link>
          <Link href="/buy" className="credits-pill">
            <span className="credits-pill-num">{profile?.credits ?? 0}</span>
            <span className="credits-pill-lbl">crédits</span>
          </Link>
        </div>
      </nav>

      <main className="container main">
        <div className="page-head">
          <h1 className="page-title">Mon compte</h1>
          <p className="page-sub">Gérez votre profil et vos crédits.</p>
        </div>

        {/* PROFIL */}
        <div className="card profile-card">
          <div className="profile-left">
            {editingName ? (
              <div className="name-edit">
                <input
                  className="name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={60}
                  placeholder="Ton nom"
                  autoFocus
                />
                <button className="name-save" onClick={saveName} disabled={savingName}>
                  {savingName ? '…' : 'OK'}
                </button>
                <button className="name-cancel" onClick={() => setEditingName(false)}>Annuler</button>
              </div>
            ) : (
              <div className="name-row">
                <span className="profile-name">{displayName()}</span>
                <button className="name-pencil" onClick={startEdit} title="Modifier le nom">✎</button>
              </div>
            )}
            <span className="profile-email">{profile?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>↪ Se déconnecter</button>
        </div>

        {/* CRÉDITS */}
        <div className="card credits-card">
          <div className="credits-top">
            <div className="credits-block">
              <span className="credits-num">{profile?.credits ?? 0}</span>
              <span className="credits-word">crédits</span>
            </div>
            <span className="plan-badge" style={{ color: plan.color, borderColor: plan.color }}>
              ♔ {plan.label}
            </span>
          </div>
          <p className="credits-hint">1 crédit = 1 photo studio générée.</p>
          <Link href="/buy" className="btn btn-primary btn-block recharge-btn">⚡ Recharger des crédits</Link>
        </div>

        {/* PARRAINAGE */}
        <div className="card referral-card" id="parrainage">
          <div className="referral-head">
            <span className="referral-emoji">🎁</span>
            <div>
              <h2 className="referral-title">Gagnez des crédits gratuits</h2>
              <p className="referral-sub">
                Invitez vos amis et gagnez <strong>{REFERRAL_REWARD} crédits</strong> par inscription.
                Votre ami reçoit <strong>{REFERRAL_WELCOME} crédits</strong> offerts pour commencer.
              </p>
            </div>
          </div>

          <div className="invite-row">
            <input className="invite-input" value={inviteLink} readOnly onFocus={(e) => e.target.select()} />
            <button className="invite-copy" onClick={copyLink} disabled={!inviteLink}>
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
          <p className="referral-note">Partage ce lien : tes amis créent leur compte avec, et tu es crédité.</p>
        </div>

        {/* GALERIE */}
        <div className="gallery-section" id="galerie">
          <h2 className="gallery-title">Ma Galerie</h2>
          {generations.length > 0 ? (
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
          ) : (
            <div className="gallery-empty">
              Aucune photo pour l'instant. <Link href="/app" className="accent-link">Crée ta première photo →</Link>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        :global(.loading-page) { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; }
        :global(.loading-dot) { width:8px; height:8px; background:var(--accent); border-radius:50%; animation:pulse 1s ease infinite; }

        .nav { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-top:18px; padding-bottom:18px; border-bottom:1px solid var(--border); flex-wrap:wrap; }
        .nav-mid { display:flex; align-items:center; gap:22px; }
        .nav-link { font-size:13px; color:var(--ink-muted); transition:color .15s; cursor:pointer; }
        .nav-link:hover { color:var(--ink); }
        .nav-link-active { color:var(--accent); font-weight:600; }
        .nav-right { display:flex; align-items:center; gap:12px; }
        .upgrade-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:8px 16px; border-radius:999px;
          background:var(--accent); color:var(--bg);
          font-size:13px; font-weight:600; transition:all .15s;
        }
        .upgrade-btn:hover { background:var(--accent-bright); transform:translateY(-1px); }
        .credits-pill {
          display:inline-flex; align-items:baseline; gap:6px;
          padding:7px 14px; background:var(--bg-card);
          border:1px solid var(--border-accent); border-radius:999px; transition:all .15s;
        }
        .credits-pill:hover { border-color:var(--accent); }
        .credits-pill-num { font-size:14px; font-weight:700; color:var(--accent); }
        .credits-pill-lbl { font-size:11px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.4px; }

        @media (max-width:720px) { .nav-mid { display:none; } }

        .main { padding-top:40px; padding-bottom:80px; max-width:680px; }
        .page-head { margin-bottom:28px; }
        .page-title { font-size:30px; font-weight:700; letter-spacing:-0.03em; margin:0 0 6px; }
        .page-sub { font-size:14px; color:var(--ink-muted); margin:0; }

        .card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); padding:24px; margin-bottom:16px; }

        /* Profil */
        .profile-card { display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .profile-left { display:flex; flex-direction:column; gap:4px; min-width:0; }
        .name-row { display:flex; align-items:center; gap:8px; }
        .profile-name { font-size:18px; font-weight:600; color:var(--ink); }
        .name-pencil { background:none; border:none; color:var(--ink-faint); cursor:pointer; font-size:14px; padding:2px; transition:color .15s; }
        .name-pencil:hover { color:var(--accent); }
        .profile-email { font-size:13px; color:var(--ink-muted); font-family:var(--font-mono); }
        .name-edit { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .name-input { padding:8px 12px; background:var(--bg-soft); border:1px solid var(--border-strong); border-radius:var(--r-md); color:var(--ink); font-size:15px; font-family:inherit; outline:none; }
        .name-input:focus { border-color:var(--accent); }
        .name-save { padding:8px 14px; background:var(--accent); color:var(--bg); border:none; border-radius:var(--r-md); font-weight:600; font-size:13px; cursor:pointer; }
        .name-cancel { background:none; border:none; color:var(--ink-faint); font-size:13px; cursor:pointer; }
        .logout-btn { background:none; border:1px solid var(--border-strong); color:var(--ink-muted); padding:9px 14px; border-radius:var(--r); font-size:13px; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .logout-btn:hover { color:var(--ink); border-color:var(--ink-faint); }

        /* Crédits */
        .credits-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
        .credits-block { display:flex; align-items:baseline; gap:8px; }
        .credits-num { font-size:48px; font-weight:700; letter-spacing:-0.04em; line-height:1; color:var(--ink); }
        .credits-word { font-size:14px; color:var(--ink-muted); font-family:var(--font-mono); }
        .plan-badge { display:inline-block; font-size:12px; font-weight:600; border:1px solid; border-radius:999px; padding:4px 12px; font-family:var(--font-mono); letter-spacing:0.5px; }
        .credits-hint { font-size:13px; color:var(--ink-faint); margin:0 0 18px; }
        .recharge-btn { margin-top:4px; }

        /* Parrainage */
        .referral-head { display:flex; gap:14px; margin-bottom:18px; }
        .referral-emoji { font-size:26px; line-height:1; }
        .referral-title { font-size:16px; font-weight:600; margin:0 0 6px; }
        .referral-sub { font-size:13px; color:var(--ink-muted); line-height:1.55; margin:0; }
        .referral-sub strong { color:var(--accent); }
        .invite-row { display:flex; gap:8px; }
        .invite-input { flex:1; min-width:0; padding:10px 14px; background:var(--bg-soft); border:1px solid var(--border-strong); border-radius:var(--r-md); color:var(--ink-muted); font-size:13px; font-family:var(--font-mono); outline:none; }
        .invite-copy { padding:10px 18px; background:var(--ink); color:var(--bg); border:none; border-radius:var(--r-md); font-weight:600; font-size:13px; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .invite-copy:hover:not(:disabled) { background:var(--accent); }
        .invite-copy:disabled { opacity:.4; cursor:not-allowed; }
        .referral-note { font-size:11px; color:var(--ink-faint); margin:10px 0 0; font-family:var(--font-mono); letter-spacing:0.3px; }

        /* Galerie */
        .gallery-section { margin-top:32px; }
        .gallery-title { font-size:16px; font-weight:600; margin:0 0 16px; }
        .gallery-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:10px; }
        .gallery-item { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-md); overflow:hidden; }
        .gallery-img { width:100%; aspect-ratio:1; object-fit:cover; display:block; }
        .gallery-placeholder { aspect-ratio:1; display:flex; align-items:center; justify-content:center; color:var(--ink-faint); font-size:20px; }
        .gallery-date { font-size:10px; color:var(--ink-faint); text-align:center; padding:6px; font-family:var(--font-mono); margin:0; }
        .gallery-empty { padding:32px; text-align:center; font-size:14px; color:var(--ink-muted); background:var(--bg-card); border:1px dashed var(--border); border-radius:var(--r-lg); }
        :global(.accent-link) { color:var(--accent); }
      `}</style>
    </>
  );
}
