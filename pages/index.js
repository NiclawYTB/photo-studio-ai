import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { describeSelections } from '../lib/promptOptions';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [step, setStep] = useState('init');
  const [imageUrl, setImageUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (!session_id) return;
    startGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id]);

  const startGeneration = async () => {
    const image = localStorage.getItem('pending_image');
    const selectionsRaw = localStorage.getItem('pending_selections');
    const selections = selectionsRaw ? safeParse(selectionsRaw) : {};

    if (!image) {
      setErrorMsg("Image introuvable. Retourne à l'accueil et réessaie.");
      setStep('error');
      return;
    }

    setSummary(describeSelections(selections));
    setStep('generating');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session_id, image, selections }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération');

      localStorage.removeItem('pending_image');
      localStorage.removeItem('pending_selections');

      setStep('polling');
      pollResult(data.prediction.id);
    } catch (err) {
      setErrorMsg(err.message);
      setStep('error');
    }
  };

  const pollResult = async (id) => {
    let attempts = 0;
    const maxAttempts = 40;

    const poll = async () => {
      attempts++;
      setProgress(Math.min(Math.round((attempts / maxAttempts) * 100), 95));

      try {
        const res = await fetch(`/api/status?ids=${id}`);
        const data = await res.json();
        const pred = data.predictions[0];

        if (pred.status === 'succeeded') {
          const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
          setImageUrl(url);
          setProgress(100);
          setStep('done');
          return;
        }

        if (pred.status === 'failed') {
          throw new Error('La génération a échoué. Contacte le support.');
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          throw new Error("Timeout — l'image prend trop de temps.");
        }
      } catch (err) {
        setErrorMsg(err.message);
        setStep('error');
      }
    };

    setTimeout(poll, 3000);
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `photo-studio-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <>
      <Head>
        <title>Génération · Photo Studio</title>
        <meta name="theme-color" content="#0B0A09" />
      </Head>

      <nav className="nav container">
        <Link href="/" className="logo">
          <span className="logo-mark" />
          <span className="logo-text">Photo Studio</span>
        </Link>
        <span className="step-mono">
          {step === 'done' ? 'étape 3 — livraison' : 'étape 2 — génération'}
        </span>
      </nav>

      <main className="container success-main">
        {/* INIT / GENERATING / POLLING */}
        {(step === 'init' || step === 'generating' || step === 'polling') && (
          <div className="state-panel">
            <div className="spinner" />
            <span className="state-mono">
              {step === 'init' && 'initialisation…'}
              {step === 'generating' && 'paiement confirmé · lancement génération'}
              {step === 'polling' && `génération en cours · ${progress}%`}
            </span>
            <h1 className="state-title">L'IA travaille sur ta photo.</h1>
            {summary && <p className="state-summary">{summary}</p>}
            <div className="progress">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="state-hint">Environ 15 à 30 secondes</p>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && imageUrl && (
          <div className="result-panel">
            <div className="result-head">
              <span className="state-mono done">terminé · ta photo est prête</span>
              <h1 className="result-title">Voilà ton packshot.</h1>
              {summary && <p className="result-summary">{summary}</p>}
            </div>

            <div className="result-img-frame">
              <img src={imageUrl} alt="résultat" className="result-img" />
            </div>

            <div className="result-actions">
              <button className="btn btn-primary btn-lg" onClick={downloadImage}>
                ↓ Télécharger
              </button>
              <Link href="/app" className="btn btn-ghost btn-lg">
                Générer une autre photo
              </Link>
            </div>
          </div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <div className="state-panel">
            <span className="state-mono error">erreur</span>
            <h1 className="state-title">Quelque chose a mal tourné.</h1>
            <p className="error-msg">{errorMsg}</p>
            <Link href="/app" className="btn btn-ghost btn-lg">
              ← Retour à l'application
            </Link>
          </div>
        )}
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

        .success-main {
          padding-top: 80px;
          padding-bottom: 80px;
          min-height: calc(100vh - 80px);
        }

        /* ETAT (init/generating/polling/error) */
        .state-panel {
          max-width: 540px;
          margin: 0 auto;
          text-align: center;
          padding: 48px 32px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 2px solid var(--border-strong);
          border-top: 2px solid var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 28px;
        }
        :global(.state-mono) {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: var(--accent);
          display: block;
          margin-bottom: 16px;
        }
        :global(.state-mono.done) { color: var(--success); }
        :global(.state-mono.error) { color: var(--danger); }
        .state-title {
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .state-summary {
          font-size: 13px;
          color: var(--ink-muted);
          font-family: var(--font-mono);
          letter-spacing: 0.3px;
          margin-bottom: 28px;
        }
        .progress {
          background: var(--bg-soft);
          border-radius: 999px;
          height: 4px;
          overflow: hidden;
          margin: 0 0 12px;
          border: 1px solid var(--border);
        }
        .progress-fill {
          background: var(--accent);
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s ease;
        }
        .state-hint {
          font-size: 12px;
          color: var(--ink-faint);
          font-family: var(--font-mono);
          letter-spacing: 0.3px;
        }
        .error-msg {
          color: var(--danger);
          font-size: 14px;
          margin-bottom: 24px;
        }

        /* DONE */
        .result-panel {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }
        .result-head { margin-bottom: 36px; }
        .result-title {
          font-size: 36px;
          font-weight: 600;
          letter-spacing: -0.03em;
          margin: 12px 0 8px;
        }
        .result-summary {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--ink-muted);
          letter-spacing: 0.3px;
        }

        /* Le cadre clair fait ressortir la photo finale */
        .result-img-frame {
          background: #FAFAF7;
          border-radius: var(--r-lg);
          padding: 32px;
          margin-bottom: 32px;
          border: 1px solid var(--border-accent);
          box-shadow: 0 0 80px var(--accent-soft);
        }
        .result-img {
          width: 100%;
          height: auto;
          border-radius: var(--r-sm);
          display: block;
          margin: 0 auto;
          max-width: 600px;
        }

        .result-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 720px) {
          .result-img-frame { padding: 16px; }
          .result-title { font-size: 28px; }
          .state-panel { padding: 36px 20px; }
        }
      `}</style>
    </>
  );
}

function safeParse(str) {
  try { return JSON.parse(str); } catch { return {}; }
}
