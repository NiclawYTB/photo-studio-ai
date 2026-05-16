import { useState, useRef } from 'react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

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

  const handlePay = async () => {
    if (!image) return;
    setLoading(true);
    setError('');

    try {
      // Sauvegarde l'image dans le localStorage pour la recuperer apres paiement
      localStorage.setItem('pending_image', image);

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
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Photo Studio AI</h1>
        <p style={styles.subtitle}>
          Transforme ta photo en photo produit studio professionnelle.<br />
          <strong>3 images generees pour 1€.</strong>
        </p>

        <div
          style={{ ...styles.dropzone, ...(preview ? styles.dropzoneWithImage : {}) }}
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {preview ? (
            <img src={preview} alt="preview" style={styles.preview} />
          ) : (
            <>
              <div style={styles.uploadIcon}>📷</div>
              <p style={styles.dropText}>Clique ou glisse ta photo ici</p>
              <p style={styles.dropSub}>JPG, PNG — max 10 Mo</p>
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
            style={styles.changeBtn}
            onClick={() => { setPreview(null); setImage(null); }}
          >
            Changer de photo
          </button>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{ ...styles.payBtn, ...((!image || loading) ? styles.payBtnDisabled : {}) }}
          onClick={handlePay}
          disabled={!image || loading}
        >
          {loading ? 'Redirection...' : '💳 Payer 1€ et generer 3 photos'}
        </button>

        <p style={styles.footer}>
          Paiement securise par Stripe • Fond blanc • Support noir • Eclairage pro
        </p>
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
    maxWidth: '480px',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px',
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '15px',
    color: '#666',
    textAlign: 'center',
    margin: '0 0 28px',
    lineHeight: '1.6',
  },
  dropzone: {
    border: '2px dashed #ddd',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    marginBottom: '16px',
  },
  dropzoneWithImage: {
    padding: '12px',
    border: '2px dashed #aaa',
  },
  preview: {
    maxWidth: '100%',
    maxHeight: '280px',
    borderRadius: '8px',
    objectFit: 'contain',
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  dropText: {
    fontSize: '16px',
    color: '#333',
    margin: '0 0 4px',
  },
  dropSub: {
    fontSize: '13px',
    color: '#999',
    margin: 0,
  },
  changeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '16px',
    textDecoration: 'underline',
    padding: 0,
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '12px',
  },
  payBtn: {
    width: '100%',
    padding: '16px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'opacity 0.2s',
  },
  payBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  footer: {
    fontSize: '12px',
    color: '#bbb',
    textAlign: 'center',
    margin: 0,
  },
};
