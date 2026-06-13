import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { OPTIONS } from '../lib/promptOptions';

// Compresse + redimensionne l'image cote client avant l'envoi a /api/generate.
// Evite de depasser la limite 15mb et accelere Replicate : une photo de tel
// fait 4-11 Mo en base64 brut, ici on tombe a ~150-350 Ko.
function compressImage(file, maxSize = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image illisible'));
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AppPage() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  // Session + crédits
  const [session, setSession] = useState(null);
  const [credits, setCredits] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);

  // Sélections — category a toujours une valeur ; le reste null = défaut serveur
  const [selections, setSelections] = useState({
    category:    'vetement',
    productType: null,
    background:  null,
    support:     null,
    lighting:    null,
  });

  // Onglet de fond actif (dépend de la catégorie)
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

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setProcessing(true);
    try {
      const optimized = await compressImage(file);
      setPreview(optimized);
      setImage(optimized);
    } catch (err) {
      setError(err.message);
      setPreview(null);
      setImage(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  // Changer de catégorie : reset du type + du fond, et bascule sur le 1er onglet
  const selectCategory = (catId) => {
    if (catId === selections.category) return;
    const firstTab = OPTIONS.background.byCategory[catId].tabs[0].id;
    setSelections((prev) => ({ ...prev, category: catId, productType: null, background: null }));
    setBgTab(firstTab);
  };

  // TOGGLE : reclique sur le choix actif = désélection (revient au défaut)
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

  // ----- Dérivés depuis la catégorie active -----
  const cat = selections.category;
  const productChoices = OPTIONS.productType.choicesByCategory[cat];
  const bgTabs = OPTIONS.background.byCategory[cat].tabs;
  const bgChoices = OPTIONS.background.choices.filter((c) => c.category === cat && c.tab === bgTab);

  const productDefaultLabel = () => {
    const defId = OPTIONS.productType.defaultByCategory[cat];
    return productChoices.find((c) => c.id === defId)?.label || '';
  };
  const defaultLabel = (key) => {
    const def = OPTIONS[key].choices.find((c) => c.id === OPTIONS[key].defaultId);
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
          <Link href="/account" className="step-mono nav-link">galerie</Link>
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
              onClick={() => !processing && inputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {processing ? (
                <p className="drop-text">Optimisation de la photo…</p>
              ) : preview ? (
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

            {/* Catégorie */}
            <OptionGroup label={OPTIONS.category.label} hint={cat === 'vetement' ? 'Vêtement' : 'Électronique'} selectedExists>
              <div className="chips">
                {OPTIONS.category.choices.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCategory(c.id)}
                    className={`chip ${selections.category === c.id ? 'chip-on' : ''}`}
                  >
                    <span className="chip-icon">{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </OptionGroup>

            {/* Type de produit — menu déroulant dépendant de la catégorie */}
            <OptionGroup
              label={OPTIONS.productType.label}
              defaultLabel={productDefaultLabel()}
              selectedExists={!!selections.productType}
            >
              <div className="select-wrap">
                <select
                  className="select"
                  value={selections.productType || ''}
                  onChange={(e) => setSelections((p) => ({ ...p, productType: e.target.value || null }))}
                >
                  <option value="">
                    {cat === 'vetement' ? '— Choisis un vêtement —' : '— Choisis un appareil —'}
                  </option>
                  {productChoices.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
                <span className="select-arrow">▾</span>
              </div>
            </OptionGroup>

            {/* Fond — onglets dépendants de la catégorie */}
            <OptionGroup label={OPTIONS.background.label} defaultLabel={bgTabs[0].label} selectedExists={!!selections.background}>
              <div className="bg-tabs">
                {bgTabs.map((t) => (
                  <button
                    key={t.id}
                    className={`bg-tab ${bgTab === t.id ? 'bg-tab-on' : ''}`}
                    onClick={() => setBgTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="swatches">
                {bgChoices.map((c) => (
                  <button
                    key={c.id}
                    className={`swatch ${selections.background === c.id ? 'swatch-on' : ''} ${c.locked ? 'swatch-locked' : ''}`}
                    onClick={() => !c.locked && toggleOption('background', c.id)}
                    disabled={c.locked}
                    title={c.locked ? `${c.label} — bientôt disponible` : c.label}
                  >
                    <span className="swatch-color" style={{ background: c.swatch }} />
                    <span className="swatch-label">{c.label}</span>
                    {c.locked && <span className="swatch-badge">Bientôt</span>}
                  </button>
                ))}
              </div>
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
                className={`btn btn-primary btn-block ${(!image || loading || processing) ? 'btn-disabled' : ''}`}
                onClick={handleGenerate}
                disabled={!image || loading || processing}
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

        /* Menu déroulant (sous-type) */
        .select-wrap { position:relative; }
        .select {
          width:100%; appearance:none; -webkit-appearance:none; -moz-appearance:none;
          padding:12px 38px 12px 14px;
          background:var(--bg-soft); border:1px solid var(--border-strong);
          border-radius:var(--r-md); color:var(--ink);
          font-size:14px; font-family:inherit; cursor:pointer;
          transition:border-color .15s;
        }
        .select:hover { border-color:var(--ink-faint); }
        .select:focus { outline:none; border-color:var(--accent); }
        .select option { background:var(--bg-card); color:var(--ink); }
        .select-arrow {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          pointer-events:none; color:var(--ink-faint); font-size:12px;
        }

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
        .bg-tab:hover { color: var(--ink); }
        .bg-tab-on { background: var(--bg-card); color: var(--ink); box-shadow: 0 1px 2px rgba(0,0,0,0.2); }

        .swatches { display:grid; grid-template-columns:repeat(auto-fill, minmax(72px, 1fr)); gap:6px; }
        .swatch { display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px 4px; background:var(--bg-soft); border:1px solid var(--border); border-radius:var(--r); transition:all .15s; font-family:inherit; cursor:pointer; }
        .swatch:hover { background:var(--bg-card-hover); border-color:var(--border-strong); }
        .swatch-on { border-color:var(--accent); background:var(--bg-card-hover); box-shadow:0 0 0 1px var(--accent); }
        .swatch-color { width:32px; height:32px; border-radius:50%; border:1px solid rgba(0,0,0,0.2); display:block; box-shadow:inset 0 0 0 1px rgba(255,255,255,0.05); }
        .swatch-label { font-size:10px; color:var(--ink-muted); text-align:center; line-height:1.2; font-family:var(--font-mono); letter-spacing:0.3px; }
        .swatch-on .swatch-label { color:var(--accent); }
        .swatch { position:relative; }
        .swatch-locked { opacity:0.45; cursor:not-allowed; filter:grayscale(0.7); }
        .swatch-locked:hover { background:var(--bg-soft); border-color:var(--border); box-shadow:none; }
        .swatch-badge { position:absolute; top:4px; right:4px; font-size:8px; padding:1px 4px; background:var(--bg-card); color:var(--ink-faint); border:1px solid var(--border); border-radius:3px; font-family:var(--font-mono); letter-spacing:0.3px; }

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
function OptionGroup({ label, defaultLabel, hint, selectedExists, children }) {
  return (
    <div className="opt-group">
      <div className="opt-label-row">
        <span className="opt-label">{label}</span>
        <span className={`opt-default ${selectedExists ? 'opt-default-on' : ''}`}>
          {hint ? hint : selectedExists ? '✓ sélectionné' : `défaut : ${defaultLabel}`}
        </span>
      </div>
      {children}
    </div>
  );
}
