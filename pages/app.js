import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { OPTIONS } from '../lib/promptOptions';

export default function AppPage() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  // Session + crédits
  const [session, setSession] = useState(null);
  const [credits, setCredits] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);

  // Sélections — null = pas sélectionné (le serveur prendra le défaut)
  const [selections, setSelections] = useState({
    productType: null,
    background:  null,
    support:     null,
    lighting:    null,
  });

  // Tab actif pour les fonds
  const [bgTab, setBgTab] = useState('rug');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setSession(session);
      const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const d = await res.json();
      setCredits(d.credits || 0);
      setAuthLoading(false);
    })();
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  // TOGGLE : si on reclique sur le choix actif, on le désélectionne (revient au défaut)
  const toggleOption = (category, id) => {
    setSelections((prev) => ({
      ...prev,
      [category]: prev[category] === id ? null : id,
    }));
  };

  const handleGenerate = async () => {
    if (!image) return;
    if (credits < 1) { router.push('/buy'); return; }
    setLoading(true); setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ image, selections }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération');
      setCredits(data.credits);
      router.push(`/success?id=${data.prediction.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="loading-page">
        <span className="loading-dot" />
        <style jsx>{`
          .loading-page { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; }
          .loading-dot { width:8px; height:8px; background:var(--accent); border-radius:50%; animation:pulse 1s ease infinite; }
        `}</style>
      </div>
    );
  }

  const activeCategories = OPTIONS.background.categories;
  const bgChoices = OPTIONS.background.choices.filter((c) => c.category === bgTab);
  const activeBgCat = activeCategories.find((c) => c.id === bgTab);

  // Pour afficher les "défauts" dans l'UI quand rien n'est sélectionné
  const defaultLabel = (cat) => {
    const def = OPTIONS[cat].choices.find((c) => c.id === OPTIONS[cat].defaultId);
    return def?.label || '';
  };

  return (
    <>
      <Head><title>Crée ta photo · Photo Studio</title></Head>

      <nav className="nav container">
        <Link href="/" className="logo">
          <span className="logo-mark" />
          <span className="logo-text">Photo Studio</span>
        </Link>
        <div className="nav-right">
          <Link href="/gallery" className="step-mono nav-link">galerie</Link>
          <Link href="/account" className="credits-pill">
            <span className="credits-num">{credits}</span>
            <span className="credits-lbl">crédit{credits > 1 ? 's' : ''}</span>
          </Link>
        </div>
      </nav>

      <main className="container app-main">
        <div className="app-grid">
          {/* GAUCHE — Upload */}
          <section className="panel">
            <header className="panel-head">
              <span className="panel-num">01</span>
              <h2 className="panel-title">Ta photo source</h2>
            </header>

            <div
              className={`drop ${preview ? 'drop-filled' : ''}`}
              onClick={() => inputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {preview ? (
                <img src={preview} alt="aperçu" className="drop-img" />
              ) : (
                <>
                  <div className="drop-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="12" cy="12" r="3.5" />
                      <path d="M8 5l1.5-2h5L16 5" />
                    </svg>
                  </div>
                  <p className="drop-text">Clique ou glisse une photo</p>
                  <p className="drop-sub">JPG, PNG — max 10 Mo</p>
                </>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />

            {preview && (
              <button className="change-btn" onClick={() => { setPreview(null); setImage(null); }}>
                ← Changer de photo
              </button>
            )}
          </section>

          {/* DROITE — Configuration */}
          <section className="panel">
            <header className="panel-head">
              <span className="panel-num">02</span>
              <h2 className="panel-title">Configure le studio</h2>
            </header>

            {/* Type de produit */}
            <OptionGroup label={OPTIONS.productType.label} defaultLabel={defaultLabel('productType')} selectedExists={!!selections.productType}>
              <div className="chips">
                {OPTIONS.productType.choices.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleOption('productType', c.id)}
                    className={`chip ${selections.productType === c.id ? 'chip-on' : ''}`}
                  >
                    <span className="chip-icon">{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </OptionGroup>

            {/* Fond — avec tabs de catégories */}
            <OptionGroup label={OPTIONS.background.label} defaultLabel={defaultLabel('background')} selectedExists={!!selections.background}>
              <div className="bg-tabs">
                {activeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`bg-tab ${bgTab === cat.id ? 'bg-tab-on' : ''} ${!cat.active ? 'bg-tab-locked' : ''}`}
                    onClick={() => cat.active && setBgTab(cat.id)}
                    disabled={!cat.active}
                  >
                    {cat.label}
                    {cat.badge && <span className="bg-tab-badge">{cat.badge}</span>}
                  </button>
                ))}
              </div>

              {activeBgCat?.active ? (
                <div className="swatches">
                  {bgChoices.map((c) => (
                    <button
                      key={c.id}
                      className={`swatch ${selections.background === c.id ? 'swatch-on' : ''}`}
                      onClick={() => toggleOption('background', c.id)}
                      title={c.label}
                    >
                      <span className="swatch-color" style={{ background: c.swatch }} />
                      <span className="swatch-label">{c.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-locked-msg">
                  Bientôt disponible — matières premium (marbre, bois, cuir, velours).
                </div>
              )}
            </OptionGroup>

            {/* Présentation */}
            <OptionGroup label={OPTIONS.support.label} defaultLabel={defaultLabel('support')} selectedExists={!!selections.support}>
              <div className="chips">
                {OPTIONS.support.choices.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleOption('support', c.id)}
                    className={`chip ${selections.support === c.id ? 'chip-on' : ''}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </OptionGroup>

            {/* Éclairage */}
            <OptionGroup label={OPTIONS.lighting.label} defaultLabel={defaultLabel('lighting')} selectedExists={!!selections.lighting}>
              <div className="chips">
                {OPTIONS.lighting.choices.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleOption('lighting', c.id)}
                    className={`chip ${selections.lighting === c.id ? 'chip-on' : ''}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </OptionGroup>

            {error && <p className="error">{error}</p>}

            <div className="pay-block">
              <div className="pay-row">
                <span className="pay-label">Coût</span>
                <span className="pay-amount">1 crédit</span>
              </div>
              <button
                className={`btn btn-primary btn-block ${(!image || loading) ? 'btn-disabled' : ''}`}
                onClick={handleGenerate}
                disabled={!image || loading}
              >
                {loading ? 'Génération…' : credits < 1 ? 'Acheter des crédits →' : 'Générer ma photo →'}
              </button>
              <p className="pay-foot">
                {credits >= 1 ? `${credits} crédit${credits > 1 ? 's' : ''} disponible${credits > 1 ? 's' : ''} · 1 image HD générée` : 'Tu n\'as plus de crédits'}
              </p>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .nav { display:flex; align-items:center; justify-content:space-between; padding-top:20px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .nav-right { display:flex; align-items:center; gap:18px; }
        .nav-link { color:var(--ink-muted); transition:color .15s; }
        .nav-link:hover { color:var(--ink); }

        .credits-pill {
          display:inline-flex; align-items:baseline; gap:6px;
          padding:6px 14px;
          background:var(--bg-card);
          border:1px solid var(--border-accent);
          border-radius:999px;
          transition: all .15s;
        }
        .credits-pill:hover { background:var(--bg-card-hover); border-color:var(--accent); }
        .credits-num { font-size:15px; font-weight:700; color:var(--accent); letter-spacing:-0.01em; }
        .credits-lbl { font-size:11px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.4px; }

        .app-main { padding-top:48px; padding-bottom:80px; }
        .app-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start; }
        @media (max-width:900px) { .app-grid { grid-template-columns:1fr; } }

        .panel { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); padding:28px; }
        .panel-head { display:flex; align-items:center; gap:14px; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .panel-num { font-family:var(--font-mono); font-size:11px; color:var(--accent); letter-spacing:1.6px; }
        .panel-title { font-size:16px; font-weight:600; letter-spacing:-0.01em; }

        .drop { border:1.5px dashed var(--border-strong); border-radius:var(--r-md); padding:56px 20px; text-align:center; cursor:pointer; transition:all .15s; background:var(--bg-soft); }
        .drop:hover { border-color:var(--accent); background:var(--bg-card-hover); }
        .drop-filled { padding:12px; border-style:solid; border-color:var(--border); }
        .drop-img { width:100%; max-height:360px; object-fit:contain; border-radius:var(--r-sm); }
        .drop-icon { color:var(--ink-faint); margin-bottom:14px; display:flex; justify-content:center; }
        .drop-text { font-size:15px; color:var(--ink); margin-bottom:4px; }
        .drop-sub { font-size:12px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.5px; }
        .change-btn { margin-top:12px; font-size:13px; color:var(--ink-muted); padding:6px 0; background:none; border:none; cursor:pointer; }
        .change-btn:hover { color:var(--ink); }
      `}</style>

      <style jsx global>{`
        .opt-group { margin-top:24px; }
        .opt-label-row {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 12px;
        }
        .opt-label { font-family:var(--font-mono); font-size:10px; color:var(--ink-faint); letter-spacing:1.8px; text-transform:uppercase; }
        .opt-default { font-family:var(--font-mono); font-size:10px; color:var(--ink-faint); letter-spacing:0.4px; }
        .opt-default-on { color:var(--accent); }

        .chips { display:flex; flex-wrap:wrap; gap:6px; }
        .chip { display:inline-flex; align-items:center; padding:8px 12px; background:var(--bg-soft); border:1px solid var(--border); border-radius:var(--r); font-size:13px; color:var(--ink-muted); transition:all .15s; font-family:inherit; cursor:pointer; }
        .chip:hover { background:var(--bg-card-hover); color:var(--ink); border-color:var(--border-strong); }
        .chip-on { background:var(--ink); color:var(--bg); border-color:var(--ink); }
        .chip-on:hover { background:var(--accent); color:var(--bg); border-color:var(--accent); }
        .chip-icon { margin-right:6px; font-size:14px; }

        /* Tabs pour les fonds */
        .bg-tabs {
          display: flex; gap: 4px; margin-bottom: 12px;
          padding: 3px; background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: var(--r);
        }
        .bg-tab {
          flex: 1; padding: 7px 10px;
          background: transparent; border: none;
          border-radius: 4px;
          font-size: 12px; font-weight: 500;
          color: var(--ink-muted); font-family: inherit;
          cursor: pointer; transition: all .15s;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .bg-tab:hover:not(:disabled) { color: var(--ink); }
        .bg-tab-on { background: var(--bg-card); color: var(--ink); box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .bg-tab-locked { opacity: 0.5; cursor: not-allowed; }
        .bg-tab-badge {
          font-size: 9px; padding: 1px 5px;
          background: var(--accent-soft); color: var(--accent);
          border-radius: 3px; font-family: var(--font-mono); letter-spacing: 0.3px;
        }
        .bg-locked-msg {
          padding: 20px;
          background: var(--bg-soft);
          border: 1px dashed var(--border);
          border-radius: var(--r);
          font-size: 13px; color: var(--ink-faint);
          text-align: center;
        }

        .swatches { display:grid; grid-template-columns:repeat(auto-fill, minmax(72px, 1fr)); gap:6px; }
        .swatch { display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px 4px; background:var(--bg-soft); border:1px solid var(--border); border-radius:var(--r); transition:all .15s; font-family:inherit; cursor:pointer; }
        .swatch:hover { background:var(--bg-card-hover); border-color:var(--border-strong); }
        .swatch-on { border-color:var(--accent); background:var(--bg-card-hover); box-shadow:0 0 0 1px var(--accent); }
        .swatch-color { width:32px; height:32px; border-radius:50%; border:1px solid rgba(0,0,0,0.2); display:block; box-shadow:inset 0 0 0 1px rgba(255,255,255,0.05); }
        .swatch-label { font-size:10px; color:var(--ink-muted); text-align:center; line-height:1.2; font-family:var(--font-mono); letter-spacing:0.3px; }
        .swatch-on .swatch-label { color:var(--accent); }

        .error { color:var(--danger); font-size:13px; margin-top:20px; padding:10px 12px; background:rgba(225,91,91,.08); border-radius:var(--r); border:1px solid rgba(225,91,91,.2); }

        .pay-block { margin-top:32px; padding-top:24px; border-top:1px solid var(--border); }
        .pay-row { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:16px; }
        .pay-label { font-family:var(--font-mono); font-size:11px; color:var(--ink-faint); letter-spacing:1.6px; text-transform:uppercase; }
        .pay-amount { font-size:24px; font-weight:600; letter-spacing:-0.02em; }
        .pay-foot { margin-top:12px; text-align:center; font-size:11px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.4px; }
        .btn-disabled { opacity:0.4; cursor:not-allowed; pointer-events:none; }
      `}</style>
    </>
  );
}

// ===== Sous-composant : groupe d'options avec affichage du défaut =====
function OptionGroup({ label, defaultLabel, selectedExists, children }) {
  return (
    <div className="opt-group">
      <div className="opt-label-row">
        <span className="opt-label">{label}</span>
        <span className={`opt-default ${selectedExists ? 'opt-default-on' : ''}`}>
          {selectedExists ? '✓ sélectionné' : `défaut : ${defaultLabel}`}
        </span>
      </div>
      {children}
    </div>
  );
}
