import { useState, useRef } from 'react';
import { OPTIONS } from '../lib/promptOptions';

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  // Sélections du user — par défaut, on prend le defaultId de chaque catégorie.
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
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Photo Studio AI</h1>
        <p style={styles.subtitle}>
          Transforme ta photo en photo produit studio professionnelle.<br />
          <strong>1 image générée pour 1€.</strong>
        </p>

        {/* Upload */}
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

        {/* Customisation */}
        <Section label={OPTIONS.productType.label}>
          <div style={styles.chipGrid}>
            {OPTIONS.productType.choices.map((c) => (
              <Chip
                key={c.id}
                selected={selections.productType === c.id}
                onClick={() => selectOption('productType', c.id)}
              >
                <span style={styles.chipIcon}>{c.icon}</span>
                {c.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section label={OPTIONS.background.label}>
          <div style={styles.swatchGrid}>
            {OPTIONS.background.choices.map((c) => {
              const selected = selections.background === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => selectOption('background', c.id)}
                  title={c.label}
                  style={{
                    ...styles.swatch,
                    ...(selected ? styles.swatchSelected : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.swatchColor,
                      background: c.swatch,
                    }}
                  />
                  <span style={styles.swatchLabel}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section label={OPTIONS.support.label}>
          <div style={styles.chipGrid}>
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
        </Section>

        <Section label={OPTIONS.lighting.label}>
          <div style={styles.chipGrid}>
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
        </Section>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{ ...styles.payBtn, ...((!image || loading) ? styles.payBtnDisabled : {}) }}
          onClick={handlePay}
          disabled={!image || loading}
        >
          {loading ? 'Redirection...' : '💳 Payer 1€ et générer'}
        </button>

        <p style={styles.footer}>
          Paiement sécurisé par Stripe • 1 image générée par paiement
        </p>
      </div>
    </div>
  );
}

// ----- Composants internes -----

function Section({ label, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionLabel}>{label}</h3>
      {children}
    </div>
  );
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.chip,
        ...(selected ? styles.chipSelected : {}),
      }}
    >
      {children}
    </button>
  );
}

// ----- Styles -----

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
    padding: '32px',
    maxWidth: '520px',
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
    margin: '0 0 24px',
    lineHeight: '1.6',
  },
  dropzone: {
    border: '2px dashed #ddd',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    marginBottom: '12px',
  },
  dropzoneWithImage: {
    padding: '12px',
    border: '2px dashed #aaa',
  },
  preview: {
    maxWidth: '100%',
    maxHeight: '240px',
    borderRadius: '8px',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto',
  },
  uploadIcon: {
    fontSize: '40px',
    marginBottom: '8px',
  },
  dropText: {
    fontSize: '15px',
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
    marginBottom: '8px',
    textDecoration: 'underline',
    padding: 0,
  },

  // Sections de customisation
  section: {
    marginTop: '22px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#666',
    margin: '0 0 10px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },

  // Chips (productType, support, lighting)
  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#f5f5f5',
    border: '1.5px solid transparent',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#333',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontWeight: '500',
    fontFamily: 'inherit',
  },
  chipSelected: {
    background: '#111',
    color: '#fff',
    borderColor: '#111',
  },
  chipIcon: {
    marginRight: '6px',
    fontSize: '14px',
  },

  // Swatches (fonds)
  swatchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
    gap: '4px',
  },
  swatch: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 4px',
    background: 'none',
    border: '1.5px solid transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  swatchSelected: {
    borderColor: '#111',
    background: '#f9f9f9',
  },
  swatchColor: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid rgba(0,0,0,0.1)',
    display: 'block',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
  },
  swatchLabel: {
    fontSize: '11px',
    color: '#555',
    textAlign: 'center',
    lineHeight: '1.2',
  },

  // Erreur + paiement
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    textAlign: 'center',
    margin: '20px 0 0',
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
    marginTop: '24px',
    marginBottom: '12px',
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
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
