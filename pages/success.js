import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [step, setStep] = useState('init'); // init | generating | polling | done | error
  const [images, setImages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!session_id) return;
    startGeneration();
  }, [session_id]);

  const startGeneration = async () => {
    const image = localStorage.getItem('pending_image');
    if (!image) {
      setErrorMsg("Image introuvable. Retourne a l'accueil et reessaie.");
      setStep('error');
      return;
    }

    setStep('generating');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session_id, image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur generation');

      const ids = data.predictions.map((p) => p.id);
      localStorage.removeItem('pending_image');
      setStep('polling');
      pollResults(ids);
    } catch (err) {
      setErrorMsg(err.message);
      setStep('error');
    }
  };

  const pollResults = async (ids) => {
    let attempts = 0;
    const maxAttempts = 40;

    const poll = async () => {
      attempts++;
      setProgress(Math.min(Math.round((attempts / maxAttempts) * 100), 95));

      try {
        const res = await fetch(`/api/status?ids=${ids.join(',')}`);
        const data = await res.json();
        const preds = data.predictions;

        const done = preds.filter((p) => p.status === 'succeeded');
        const failed = preds.filter((p) => p.status === 'failed');

        if (done.length === ids.length) {
          const urls = done.map((p) => (Array.isArray(p.output) ? p.output[0] : p.output));
          setImages(urls);
          setProgress(100);
          setStep('done');
          return;
        }

        if (failed.length > 0) {
          throw new Error('Une generation a echoue. Contacte le support.');
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          throw new Error('Timeout — les images prennent trop de temps.');
        }
      } catch (err) {
        setErrorMsg(err.message);
        setStep('error');
      }
    };

    setTimeout(poll, 3000);
  };

  const downloadImage = async (url, index) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `photo-studio-${index + 1}.jpg`;
    a.click();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {step === 'init' && (
          <p style={styles.info}>Chargement...</p>
        )}

        {(step === 'generating' || step === 'polling') && (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <h2 style={styles.title}>Generation en cours...</h2>
            <p style={styles.subtitle}>
              {step === 'generating'
                ? 'Paiement confirme ! Lancement des generations...'
                : `Generation des 3 photos studio... ${progress}%`}
            </p>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.hint}>Cela prend environ 30 a 60 secondes</p>
          </div>
        )}

        {step === 'done' && (
          <>
            <h2 style={{ ...styles.title, color: '#22c55e' }}>Tes 3 photos sont pretes !</h2>
            <p style={styles.subtitle}>Clique sur chaque photo pour la telecharger</p>
            <div style={styles.grid}>
              {images.map((url, i) => (
                <div key={i} style={styles.imgWrapper}>
                  <img src={url} alt={`photo ${i + 1}`} style={styles.img} />
                  <button style={styles.dlBtn} onClick={() => downloadImage(url, i)}>
                    Telecharger #{i + 1}
                  </button>
                </div>
              ))}
            </div>
            <button style={styles.backBtn} onClick={() => router.push('/')}>
              Generer une autre photo
            </button>
          </>
        )}

        {step === 'error' && (
          <div style={styles.center}>
            <p style={styles.errorIcon}>❌</p>
            <h2 style={styles.title}>Une erreur est survenue</h2>
            <p style={styles.errorMsg}>{errorMsg}</p>
            <button style={styles.backBtn} onClick={() => router.push('/')}>
              Retour a l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
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
  subtitle: { fontSize: '15px', color: '#666', margin: '0 0 20px', lineHeight: '1.6' },
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
  grid: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  imgWrapper: { borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee' },
  img: { width: '100%', display: 'block' },
  dlBtn: {
    width: '100%',
    padding: '10px',
    background: '#111',
    color: '#fff',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
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
  },
  errorIcon: { fontSize: '48px', margin: '0 0 12px' },
  errorMsg: { color: '#e53e3e', fontSize: '14px', margin: '0 0 20px' },
};
