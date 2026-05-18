import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

// Ratio fixe : 1€ = 5 crédits (donc 1 crédit = 0,20€)
const CREDITS_PER_EURO = 5;

const PACKS = [
  { id: '1',  euros: 1,  credits: 5,  desc: '5 photos' },
  { id: '5',  euros: 5,  credits: 25, desc: '25 photos' },
  { id: '10', euros: 10, credits: 50, desc: '50 photos · plus populaire' },
];

export default function Buy() {
  const router = useRouter();
  const [selected, setSelected] = useState('5');     // pack actif par défaut
  const [customAmount, setCustomAmount] = useState(20); // montant libre par défaut (20€ = 100 photos)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, []);

  // Calcul du montant + crédits selon ce qui est sélectionné
  const isCustom = selected === 'custom';
  const finalEuros   = isCustom ? customAmount : PACKS.find((p) => p.id === selected).euros;
  const finalCredits = isCustom ? customAmount * CREDITS_PER_EURO : PACKS.find((p) => p.id === selected).credits;

  const handleBuy = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    const body = isCustom
      ? { pack: 'custom', amount_eur: customAmount }
      : { pack: selected };

    const res = await fetch('/api/credits/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setLoading(false); alert(data.error || 'Erreur paiement'); }
  };

  // Valide qu'on peut payer : entier >= 1 et <= 100
  const validCustom = Number.isInteger(customAmount) && customAmount >= 1 && customAmount <= 100;
  const canPay = !loading && (!isCustom || validCustom);

  return (
    <>
      <Head><title>Acheter des crédits · Photo Studio</title></Head>
      <nav className="nav container">
        <Link href="/account" className="back-link">← Votre Studio</Link>
      </nav>

      <main className="container main">
        <div className="box">
          <span className="eyebrow">Recharger</span>
          <h1 className="title">Choisissez votre pack</h1>
          <p className="sub">1€ = 5 photos studio générées par IA</p>

          <div className="packs">
            {PACKS.map((pack) => (
              <button
                key={pack.id}
                className={`pack ${selected === pack.id ? 'pack-on' : ''}`}
                onClick={() => setSelected(pack.id)}
              >
                <div className="pack-left">
                  <span className="pack-label">{pack.euros}€</span>
                  <span className="pack-desc">{pack.desc}</span>
                </div>
                <div className="pack-right">
                  <span className="pack-credits">{pack.credits}</span>
                  <span className="pack-credits-lbl">crédits</span>
                </div>
              </button>
            ))}

            {/* Option montant personnalisé */}
            <div className={`pack pack-custom ${selected === 'custom' ? 'pack-on' : ''}`} onClick={() => setSelected('custom')}>
              <div className="pack-left">
                <span className="pack-label">Personnaliser</span>
                <span className="pack-desc">Choisis ton montant (1 à 100€)</span>
              </div>
              {selected === 'custom' && (
                <div className="custom-input-wrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(parseInt(e.target.value, 10) || 0)}
                    className="custom-input"
                  />
                  <span className="custom-eur">€</span>
                </div>
              )}
            </div>
          </div>

          {/* Récap */}
          <div className="recap">
            <span className="recap-label">Tu reçois</span>
            <span className="recap-value">{finalCredits} crédit{finalCredits > 1 ? 's' : ''}</span>
          </div>

          <button
            className={`btn btn-primary btn-block pay-btn ${!canPay ? 'btn-disabled' : ''}`}
            onClick={handleBuy}
            disabled={!canPay}
          >
            {loading ? 'Redirection…' : `→ Payer ${finalEuros}€`}
          </button>
          <p className="foot">Paiement sécurisé · Stripe · Aucun abonnement</p>
        </div>
      </main>

      <style jsx>{`
        .nav { display:flex; align-items:center; padding-top:20px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .back-link { font-size:14px; color:var(--ink-muted); transition:color .15s; }
        .back-link:hover { color:var(--ink); }

        .main { min-height:calc(100vh - 62px); display:flex; align-items:center; justify-content:center; padding:48px 0 80px; }
        .box { width:100%; max-width:440px; }

        .eyebrow { font-family:var(--font-mono); font-size:10px; color:var(--accent); letter-spacing:2px; text-transform:uppercase; display:block; margin-bottom:12px; }
        .title { font-size:28px; font-weight:700; letter-spacing:-0.03em; margin:0 0 8px; }
        .sub { font-size:14px; color:var(--ink-muted); margin:0 0 32px; }

        .packs { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
        .pack {
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 22px; background:var(--bg-card);
          border:1px solid var(--border); border-radius:var(--r-lg);
          cursor:pointer; font-family:inherit; transition:all .15s; position:relative;
          text-align:left; width:100%;
        }
        .pack:hover { border-color:var(--border-strong); background:var(--bg-card-hover); }
        .pack-on { border-color:var(--accent) !important; background:var(--bg-card-hover); box-shadow:0 0 0 1px var(--border-accent); }
        .pack-left { display:flex; flex-direction:column; gap:3px; }
        .pack-label { font-size:18px; font-weight:700; color:var(--ink); letter-spacing:-0.01em; }
        .pack-desc { font-size:12px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.3px; }
        .pack-right { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
        .pack-credits { font-size:22px; font-weight:700; color:var(--accent); letter-spacing:-0.02em; line-height:1; }
        .pack-credits-lbl { font-size:10px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.5px; text-transform:uppercase; }

        .pack-custom { flex-direction:column; align-items:stretch; gap:14px; }
        .pack-custom .pack-left { flex-direction:column; }
        .custom-input-wrap {
          display:flex; align-items:center; gap:8px;
          padding:10px 14px;
          background:var(--bg-soft);
          border:1px solid var(--border-strong);
          border-radius:var(--r-md);
        }
        .custom-input {
          flex:1; background:transparent; border:none; outline:none;
          color:var(--ink); font-size:18px; font-weight:600;
          font-family:inherit; padding:0;
        }
        .custom-input::-webkit-outer-spin-button,
        .custom-input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        .custom-eur { font-size:18px; color:var(--ink-muted); font-weight:500; }

        .recap {
          display:flex; align-items:baseline; justify-content:space-between;
          padding:16px 20px; margin-bottom:18px;
          background:var(--bg-soft);
          border:1px solid var(--border);
          border-radius:var(--r);
        }
        .recap-label {
          font-family:var(--font-mono); font-size:11px;
          color:var(--ink-faint); letter-spacing:1.6px; text-transform:uppercase;
        }
        .recap-value { font-size:20px; font-weight:600; color:var(--accent); letter-spacing:-0.02em; }

        .pay-btn { margin-bottom:14px; }
        .foot { text-align:center; font-size:11px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.4px; }
      `}</style>
    </>
  );
}
