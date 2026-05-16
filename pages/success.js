import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { describeSelections } from '../lib/promptOptions';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [step, setStep] = useState('init'); // init | generating | polling | done | error
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

      // On nettoie le localStorage une fois la génération lancée pour
      // éviter qu'un refresh de la page success ne déclenche un appel inutile.
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
    <div style={styles.page}>
      <div style={styles.card}>
        {step === 'init' && <p style={styles.info}>Chargement...</p>}

        {(step === 'generating' || step === 'polling') && (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <h2 style={styles.title}>Génération en cours...</h2>
            <p style={styles.subtitle}>
              {step === 'generating'
                ? 'Paiement confirmé ! Lancement de la génération...'
                : `Création de ta photo studio... ${progress}%`}
            </p>
            {summary && <p style={styles.summary}>{summary}</p>}
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.hint}>Environ 15 à 30 secondes</p>
          </div>
        )}

        {step === 'done' && imageUrl && (
          <>
            <h2 style={{ ...styles.title, color: '#22c55e', textAlign: 'center' }}>
              Ta photo est prête !
            </h2>
            {summary && (
              <p style={{ ...styles.summary, textAlign: 'center', marginBottom: '20px' }}>
                {summary}
              </p>
            )}
            <div style={styles.imgWrapper}>
              <img src={imageUrl} alt="résultat" style={styles.img} />
            </div>
            <button style={styles.dlBtn} onClick={downloadImage}>
              ⬇ Télécharger
            </button>
            <button style={styles.backBtn} onClick={() => router.push('/')}>
              Générer une autre photo
            </button>
          </>
        )}

        {step === 'error' && (
          <div style={styles.center}>
            <p style={styles.errorIcon}>❌</p>
            <h2 style={styles.title}>Une erreur est survenue</h2>
            <p style={styles.errorMsg}>{errorMsg}</p>
            <button style={styles.backBtn} onClick={() => router.push('/')}>
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function safeParse(str) {
  try { return JSON.parse(str); } catch { return {}; }
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '560px',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  center: { textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: '700', margin: '0 0 8px', color: '#111' },
  subtitle: { fontSize: '15px', color: '#666', margin: '0 0 12px', lineHeight: '1.6' },
  summary: {
    fontSize: '13px',
    color: '#888',
    margin: '0 0 16px',
    fontStyle: 'italic',
  },
  info: { textAlign: 'center', color: '#888' },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #eee',
    borderTop: '4px solid #111',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 20px',
  },
  progressBar: {
    background: '#eee',
    borderRadius: '8px',
    height: '8px',
    overflow: 'hidden',
    margin: '0 0 12px',
  },
  progressFill: {
    background: '#111',
    height: '100%',
    borderRadius: '8px',
    transition: 'width 0.5s ease',
  },
  hint: { fontSize: '13px', color: '#aaa' },
  imgWrapper: {
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #eee',
    marginBottom: '16px',
  },
  img: { width: '100%', display: 'block' },
  dlBtn: {
    width: '100%',
    padding: '14px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '10px',
    fontFamily: 'inherit',
  },
  backBtn: {
    width: '100%',
    padding: '14px',
    background: 'none',
    border: '1.5px solid #ddd',
    borderRadius: '10px',
    fontSize: '15px',
    cursor: 'pointer',
    color: '#555',
    fontFamily: 'inherit',
  },
  errorIcon: { fontSize: '48px', margin: '0 0 12px' },
  errorMsg: { color: '#e53e3e', fontSize: '14px', margin: '0 0 20px' },
};
