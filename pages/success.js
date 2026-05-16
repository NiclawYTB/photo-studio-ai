import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Success() {
  const router = useRouter();
  const { id } = router.query; // prediction_id (plus de session_id Stripe ici)

  const [step, setStep] = useState('polling');
  const [imageUrl, setImageUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      setErrorMsg("ID de génération manquant. Retourne sur l'application.");
      setStep('error');
      return;
    }
    pollResult(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, id]);

  const pollResult = async (predId) => {
    let attempts = 0;
    const poll = async () => {
      attempts++;
      setProgress(Math.min(Math.round((attempts / 40) * 100), 95));
      try {
        const res = await fetch(`/api/status?ids=${predId}`);
        const data = await res.json();
        const pred = data.predictions[0];

        if (pred.status === 'succeeded') {
          const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
          setImageUrl(url);
          setProgress(100);
          setStep('done');

          // Sauvegarde l'URL en DB pour la galerie (non bloquant).
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              await fetch('/api/generations/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ prediction_id: predId, image_url: url }),
              });
            }
          } catch (_) { /* ignore */ }
          return;
        }
        if (pred.status === 'failed') throw new Error('La génération a échoué.');
        if (attempts < 40) setTimeout(poll, 3000);
        else throw new Error("Timeout — l'image prend trop de temps.");
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
          {step === 'done' ? 'étape 2 — livraison' : 'étape 2 — génération'}
        </span>
      </nav>

      <main className="container success-main">
        {(step === 'polling') && (
          <div className="state-panel">
            <div className="spinner" />
            <span className="state-mono">génération en cours · {progress}%</span>
            <h1 className="state-title">L'IA travaille sur ta photo.</h1>
            <div className="progress">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="state-hint">Environ 15 à 30 secondes</p>
          </div>
        )}

        {step === 'done' && imageUrl && (
          <div className="result-panel">
            <div className="result-head">
              <span className="state-mono done">terminé · ta photo est prête</span>
              <h1 className="result-title">Voilà ton packshot.</h1>
            </div>
            <div className="result-img-frame">
              <img src={imageUrl} alt="résultat" className="result-img" />
            </div>
            <div className="result-actions">
              <button className="btn btn-primary btn-lg" onClick={downloadImage}>↓ Télécharger</button>
              <Link href="/app" className="btn btn-ghost btn-lg">Générer une autre photo</Link>
              <Link href="/account" className="btn btn-ghost btn-lg">Mon Studio</Link>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="state-panel">
            <span className="state-mono error">erreur</span>
            <h1 className="state-title">Quelque chose a mal tourné.</h1>
            <p className="error-msg">{errorMsg}</p>
            <Link href="/app" className="btn btn-ghost btn-lg">← Retour à l'application</Link>
          </div>
        )}
      </main>

      <style jsx>{`
        .nav { display:flex; align-items:center; justify-content:space-between; padding-top:20px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .success-main { padding-top:80px; padding-bottom:80px; min-height:calc(100vh - 80px); }
        .state-panel { max-width:540px; margin:0 auto; text-align:center; padding:48px 32px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); }
        .spinner { width:36px; height:36px; border:2px solid var(--border-strong); border-top:2px solid var(--accent); border-radius:50%; animation:spin .8s linear infinite; margin:0 auto 28px; }
        :global(.state-mono) { font-family:var(--font-mono); font-size:11px; letter-spacing:1.6px; text-transform:uppercase; color:var(--accent); display:block; margin-bottom:16px; }
        :global(.state-mono.done) { color:var(--success); }
        :global(.state-mono.error) { color:var(--danger); }
        .state-title { font-size:26px; font-weight:600; letter-spacing:-0.02em; margin-bottom:24px; }
        .progress { background:var(--bg-soft); border-radius:999px; height:4px; overflow:hidden; margin:0 0 12px; border:1px solid var(--border); }
        .progress-fill { background:var(--accent); height:100%; border-radius:999px; transition:width .6s ease; }
        .state-hint { font-size:12px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.3px; }
        .error-msg { color:var(--danger); font-size:14px; margin-bottom:24px; }
        .result-panel { max-width:720px; margin:0 auto; text-align:center; }
        .result-head { margin-bottom:36px; }
        .result-title { font-size:36px; font-weight:600; letter-spacing:-0.03em; margin:12px 0; }
        .result-img-frame { background:#FAFAF7; border-radius:var(--r-lg); padding:32px; margin-bottom:32px; border:1px solid var(--border-accent); box-shadow:0 0 80px var(--accent-soft); }
        .result-img { width:100%; height:auto; border-radius:var(--r-sm); display:block; margin:0 auto; max-width:600px; }
        .result-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        @media (max-width:720px) { .result-img-frame { padding:16px; } .result-title { font-size:28px; } .state-panel { padding:36px 20px; } }
      `}</style>
    </>
  );
}
