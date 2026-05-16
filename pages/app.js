import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OPTIONS } from '../lib/promptOptions';

export default function AppPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const [selections, setSelections] = useState({
    productType: OPTIONS.productType.defaultId,
    background:  OPTIONS.background.defaultId,
    support:     OPTIONS.support.defaultId,
    lighting:    OPTIONS.lighting.defaultId,
  });

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

  const selectOption = (category, id) => {
    setSelections((prev) => ({ ...prev, [category]: id }));
  };

  const handlePay = async () => {
    if (!image) return;
    setLoading(true);
    setError('');

    try {
      localStorage.setItem('pending_image', image);
      localStorage.setItem('pending_selections', JSON.stringify(selections));

      const res = await fetch('/api/create-checkout', { method: 'POST' });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Crée ta photo studio · Photo Studio</title>
        <meta name="theme-color" content="#0B0A09" />
      </Head>

      <nav className="nav container">
        <Link href="/" className="logo">
          <span className="logo-mark" />
          <span className="logo-text">Photo Studio</span>
        </Link>
        <span className="step-mono">étape 1 — configuration</span>
      </nav>

      <main className="container app-main">
        <div className="app-grid">
          {/* LEFT — Upload */}
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

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {preview && (
              <button
                className="change-btn"
                onClick={() => { setPreview(null); setImage(null); }}
              >
                ← Changer de photo
              </button>
            )}
          </section>

          {/* RIGHT — Options + Pay */}
          <section className="panel">
            <header className="panel-head">
              <span className="panel-num">02</span>
              <h2 className="panel-title">Configure le studio</h2>
            </header>

            {/* Type de produit */}
            <OptionGroup label={OPTIONS.productType.label} category="productType">
              <div className="chips">
                {OPTIONS.productType.choices.map((c) => (
                  <Chip
                    key={c.id}
                    selected={selections.productType === c.id}
                    onClick={() => selectOption('productType', c.id)}
                  >
                    <span className="chip-icon">{c.icon}</span> {c.label}
                  </Chip>
                ))}
              </div>
            </OptionGroup>

            {/* Fond */}
            <OptionGroup label={OPTIONS.background.label} category="background">
              <div className="swatches">
                {OPTIONS.background.choices.map((c) => (
                  <button
                    key={c.id}
                    className={`swatch ${selections.background === c.id ? 'swatch-on' : ''}`}
                    onClick={() => selectOption('background', c.id)}
                    title={c.label}
                  >
                    <span className="swatch-color" style={{ background: c.swatch }} />
                    <span className="swatch-label">{c.label}</span>
                  </button>
                ))}
              </div>
            </OptionGroup>

            {/* Support */}
            <OptionGroup label={OPTIONS.support.label} category="support">
              <div className="chips">
                {OPTIONS.support.choices.map((c) => (
                  <Chip
                    key={c.id}
                    selected={selections.support === c.id}
                    onClick={() => selectOption('support', c.id)}
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
            </OptionGroup>

            {/* Éclairage */}
            <OptionGroup label={OPTIONS.lighting.label} category="lighting">
              <div className="chips">
                {OPTIONS.lighting.choices.map((c) => (
                  <Chip
                    key={c.id}
                    selected={selections.lighting === c.id}
                    onClick={() => selectOption('lighting', c.id)}
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
            </OptionGroup>

            {error && <p className="error">{error}</p>}

            <div className="pay-block">
              <div className="pay-row">
                <span className="pay-label">Total</span>
                <span className="pay-amount">1,00 €</span>
              </div>
              <button
                className={`btn btn-primary btn-block ${(!image || loading) ? 'btn-disabled' : ''}`}
                onClick={handlePay}
                disabled={!image || loading}
              >
                {loading ? 'Redirection…' : 'Payer & générer →'}
              </button>
              <p className="pay-foot">Paiement sécurisé Stripe · 1 image HD livrée</p>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }

        .app-main {
          padding-top: 48px;
          padding-bottom: 80px;
        }

        .app-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .app-grid { grid-template-columns: 1fr; }
        }

        .panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 28px;
        }

        .panel-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .panel-num {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 1.6px;
        }
        .panel-title {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        /* Dropzone */
        .drop {
          border: 1.5px dashed var(--border-strong);
          border-radius: var(--r-md);
          padding: 56px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
          background: var(--bg-soft);
        }
        .drop:hover {
          border-color: var(--accent);
          background: var(--bg-card-hover);
        }
        .drop-filled {
          padding: 12px;
          border-style: solid;
          border-color: var(--border);
        }
        .drop-img {
          width: 100%;
          max-height: 360px;
          object-fit: contain;
          border-radius: var(--r-sm);
        }
        .drop-icon {
          color: var(--ink-faint);
          margin-bottom: 14px;
          display: flex;
          justify-content: center;
        }
        .drop-text {
          font-size: 15px;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .drop-sub {
          font-size: 12px;
          color: var(--ink-faint);
          font-family: var(--font-mono);
          letter-spacing: 0.5px;
        }
        .change-btn {
          margin-top: 12px;
          font-size: 13px;
          color: var(--ink-muted);
          padding: 6px 0;
        }
        .change-btn:hover { color: var(--ink); }
      `}</style>

      <style jsx global>{`
        /* Styles globaux pour les sous-composants OptionGroup, Chip */
        .opt-group {
          margin-top: 24px;
        }
        .opt-label {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-faint);
          letter-spacing: 1.8px;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: var(--r);
          font-size: 13px;
          color: var(--ink-muted);
          transition: all 0.15s;
          font-family: inherit;
        }
        .chip:hover {
          background: var(--bg-card-hover);
          color: var(--ink);
          border-color: var(--border-strong);
        }
        .chip-on {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }
        .chip-on:hover {
          background: var(--accent);
          color: var(--bg);
          border-color: var(--accent);
        }
        .chip-icon {
          margin-right: 6px;
          font-size: 14px;
        }

        .swatches {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 6px;
        }
        .swatch {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 4px;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: var(--r);
          transition: all 0.15s;
          font-family: inherit;
        }
        .swatch:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-strong);
        }
        .swatch-on {
          border-color: var(--accent);
          background: var(--bg-card-hover);
        }
        .swatch-color {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.2);
          display: block;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
        }
        .swatch-label {
          font-size: 10px;
          color: var(--ink-muted);
          text-align: center;
          line-height: 1.2;
          font-family: var(--font-mono);
          letter-spacing: 0.3px;
        }
        .swatch-on .swatch-label { color: var(--accent); }

        .error {
          color: var(--danger);
          font-size: 13px;
          margin-top: 20px;
          padding: 10px 12px;
          background: rgba(225, 91, 91, 0.08);
          border-radius: var(--r);
          border: 1px solid rgba(225, 91, 91, 0.2);
        }

        .pay-block {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .pay-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .pay-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink-faint);
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }
        .pay-amount {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .pay-foot {
          margin-top: 12px;
          text-align: center;
          font-size: 11px;
          color: var(--ink-faint);
          font-family: var(--font-mono);
          letter-spacing: 0.4px;
        }
      `}</style>
    </>
  );
}

// ===== Sous-composants =====

function OptionGroup({ label, children }) {
  return (
    <div className="opt-group">
      <span className="opt-label">{label}</span>
      {children}
    </div>
  );
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`chip ${selected ? 'chip-on' : ''}`}
    >
      {children}
    </button>
  );
}
