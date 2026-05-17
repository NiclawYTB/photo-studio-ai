import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const PACKS = [
  { id: '1',  label: '1 crédit',   price: '1,00€',  priceRaw: 1.00, savings: null,  desc: '1 génération' },
  { id: '5',  label: '5 crédits',  price: '4,00€',  priceRaw: 4.00, savings: '-20%', desc: '5 générations' },
  { id: '15', label: '15 crédits', price: '10,00€', priceRaw: 10.00, savings: '-33%', desc: '15 générations — meilleure valeur' },
];

export default function Buy() {
  const router = useRouter();
  const [selected, setSelected] = useState('5');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, []);

  const handleBuy = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/credits/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ pack: selected }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  };

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
          <p className="sub">1 crédit = 1 photo studio générée par IA</p>

          <div className="packs">
            {PACKS.map((pack) => (
              <button
                key={pack.id}
                className={`pack ${selected === pack.id ? 'pack-on' : ''}`}
                onClick={() => setSelected(pack.id)}
              >
                <div className="pack-left">
                  <span className="pack-label">{pack.label}</span>
                  <span className="pack-desc">{pack.desc}</span>
                </div>
                <div className="pack-right">
                  <span className="pack-price">{pack.price}</span>
                  {pack.savings && <span className="pack-badge">{pack.savings}</span>}
                </div>
              </button>
            ))}
          </div>

          <button
            className={`btn btn-primary btn-block pay-btn ${loading ? 'btn-disabled' : ''}`}
            onClick={handleBuy}
            disabled={loading}
          >
            {loading ? 'Redirection…' : '→ Payer par carte'}
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

        .packs { display:flex; flex-direction:column; gap:10px; margin-bottom:28px; }
        .pack {
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 22px; background:var(--bg-card);
          border:1px solid var(--border); border-radius:var(--r-lg);
          cursor:pointer; font-family:inherit; transition:all .15s; position:relative;
          text-align:left;
        }
        .pack:hover { border-color:var(--border-strong); background:var(--bg-card-hover); }
        .pack-on { border-color:var(--accent) !important; background:var(--bg-card-hover); box-shadow:0 0 0 1px var(--border-accent); }
        .pack-left { display:flex; flex-direction:column; gap:3px; }
        .pack-label { font-size:15px; font-weight:600; color:var(--ink); }
        .pack-desc { font-size:12px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.3px; }
        .pack-right { display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
        .pack-price { font-size:20px; font-weight:700; color:var(--ink); letter-spacing:-0.02em; }
        .pack-badge { font-size:10px; font-weight:700; color:var(--bg); background:var(--success); padding:2px 7px; border-radius:3px; font-family:var(--font-mono); }

        .pay-btn { margin-bottom:14px; }
        .foot { text-align:center; font-size:11px; color:var(--ink-faint); font-family:var(--font-mono); letter-spacing:0.4px; }
      `}</style>
    </>
  );
}
