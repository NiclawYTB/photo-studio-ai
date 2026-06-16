import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// NOTE : styles via une balise STYLE classique (toutes les regles prefixees
// par .home pour rester isolees). Rien ici ne fait planter le build Vercel.

export default function Home() {
  const [session, setSession] = useState(null);
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      if (session) {
        try {
          const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${session.access_token}` } });
          const d = await res.json();
          if (active) setCredits(d.credits ?? 0);
        } catch (_) { /* ignore */ }
      }
    });
    return () => { active = false; };
  }, []);

  const steps = [
    { n: '01', t: 'Upload', d: "Glisse n'importe quelle photo de ton produit. Smartphone, scan, capture — tout passe." },
    { n: '02', t: 'Personnalise', d: 'Choisis ta catégorie, ton fond, ton éclairage. Vêtements et électronique.' },
    { n: '03', t: 'Génère', d: "L'IA reconstruit ta photo en studio. Téléchargement immédiat, en HD." },
  ];

  const faqs = [
    { q: "Ça marche avec n'importe quelle photo ?", a: 'Oui — smartphone, scan, capture. Plus la photo est nette, meilleur est le rendu.' },
    { q: 'Mon produit est-il bien préservé ?', a: "Oui : l'IA garde la matière, les couleurs et les logos à l'identique. Seuls le fond et l'éclairage changent." },
    { q: 'Combien ça coûte ?', a: '1 € = 5 crédits, soit 5 photos. Pas d\'abonnement : tu paies seulement ce que tu utilises.' },
    { q: 'Pour quels produits ?', a: 'Vêtements (t-shirt, pull, veste…) et électronique (console, manette, jeux vidéo…).' },
    { q: 'Les images ont-elles un filigrane ?', a: 'Non. Tu télécharges tes photos en HD, sans filigrane, prêtes à publier.' },
  ];

  return (
    <div className="home">
      <Head>
        <title>Photo Studio — Photos produit studio par IA pour Vinted, eBay & Leboncoin</title>
        <meta name="description" content="Transforme une photo de smartphone en packshot studio pro en 30 secondes. Vêtements et électronique. 1€ = 5 photos, sans abonnement." />
        <meta name="keywords" content="photo produit IA, packshot studio, photo Vinted, photo Leboncoin, fond studio IA, vendre en ligne" />
        <meta property="og:title" content="Photo Studio — Tes photos. En studio." />
        <meta property="og:description" content="Transforme tes photos en packshots pros en 30 secondes. 1€ = 5 photos, sans abonnement." />
        <meta name="theme-color" content="#1E5C3A" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="hnav container">
        <Link href="/" className="logo">
          <span className="logo-mark" />
          <span className="logo-text">Photo Studio</span>
        </Link>
        <div className="hnav-right">
          <a href="#pricing" className="hnav-link">Tarifs</a>
          {session ? (
            <>
              <Link href="/account" className="hnav-credits"><b>{credits ?? '·'}</b> crédits</Link>
              <Link href="/account" className="hnav-link">Mon Compte</Link>
              <Link href="/app" className="btn btn-primary">Créer →</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hnav-link">Se connecter</Link>
              <Link href="/app" className="btn btn-primary">Commencer →</Link>
            </>
          )}
        </div>
      </nav>

      <header className="container hero">
        <span className="pill"><span className="pill-dot" /> Maintenant en bêta · 1€/photo</span>
        <h1 className="hero-title">Tes photos.<br /><span className="muted">Sauf qu'on dirait</span><br />qu'elles sortent d'un studio.</h1>
        <p className="lead">Glisse une photo de smartphone. Choisis un fond, un éclairage, un support. Ton packshot est prêt en 30 secondes.</p>
        <div className="cta-row">
          <Link href="/app" className="btn btn-primary btn-lg">Commencer →</Link>
          <a href="#how" className="btn btn-ghost btn-lg">Voir comment</a>
        </div>
      </header>

      <section id="how" className="container sec">
        <span className="eyebrow">Comment ça marche</span>
        <h2 className="sec-title">Trois étapes. Trente secondes.</h2>
        <div className="grid3">
          {steps.map((s) => (
            <div key={s.n} className="card">
              <span className="card-n">{s.n}</span>
              <h3 className="card-t">{s.t}</h3>
              <p className="card-d">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="container sec">
        <span className="eyebrow">Tarif</span>
        <h2 className="sec-title">Un prix. Une photo.</h2>
        <div className="price">
          <div className="price-amt"><span className="price-num">1</span><span className="price-eur">€</span><span className="price-per">/ photo générée</span></div>
          <ul className="price-list">
            <li>5 photos studio HD pour 1 € (1 € = 5 crédits)</li>
            <li>Vêtements et électronique</li>
            <li>Téléchargement immédiat, sans filigrane</li>
            <li>Pas d'abonnement · Paiement sécurisé Stripe</li>
          </ul>
          <Link href="/app" className="btn btn-primary btn-block">Commencer →</Link>
        </div>
      </section>

      <section className="container sec">
        <span className="eyebrow">FAQ</span>
        <h2 className="sec-title">Questions fréquentes</h2>
        <div className="faq">
          {faqs.map((f, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-q">{f.q}</summary>
              <p className="faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="container foot">
        <div className="logo">
          <span className="logo-mark" />
          <span className="logo-text">Photo Studio</span>
        </div>
        <div className="foot-links">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/cgv">CGV</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </div>
        <span className="foot-meta">© {new Date().getFullYear()} Photo Studio</span>
      </footer>

      <style>{`
        .home { background: var(--bg); color: var(--ink); }
        .home .hnav { display: flex; align-items: center; justify-content: space-between; padding-top: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
        .home .hnav-right { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .home .hnav-link { font-size: 14px; color: var(--ink-muted); }
        .home .hnav-link:hover { color: var(--ink); }
        .home .hnav-credits { display: inline-flex; align-items: baseline; gap: 5px; padding: 6px 13px; border-radius: 999px; border: 1px solid var(--border-accent); font-size: 13px; color: var(--ink-muted); }
        .home .hnav-credits b { color: var(--accent); font-weight: 700; }
        .home .hnav-credits:hover { border-color: var(--accent); }

        .home .hero { padding-top: 72px; padding-bottom: 80px; }
        .home .pill { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-muted); padding: 6px 14px; border: 1px solid var(--border-strong); border-radius: 999px; margin-bottom: 32px; }
        .home .pill-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); display: inline-block; }
        .home .hero-title { font-family: var(--font-serif); font-size: clamp(44px, 6.5vw, 76px); line-height: 1.05; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 24px; max-width: 16ch; }
        .home .muted { color: var(--ink-muted); }
        .home .lead { font-size: 19px; line-height: 1.6; color: var(--ink-muted); max-width: 46ch; margin: 0 0 36px; }
        .home .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }

        .home .sec { padding-top: 64px; padding-bottom: 64px; border-top: 1px solid var(--border); }
        .home .eyebrow { display: inline-block; font-family: var(--font-mono); font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 14px; }
        .home .sec-title { font-family: var(--font-serif); font-size: clamp(30px, 4.2vw, 44px); line-height: 1.1; font-weight: 500; letter-spacing: -0.015em; margin: 0 0 40px; }

        .home .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .home .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 26px; }
        .home .card-n { font-family: var(--font-mono); font-size: 11px; color: var(--accent); letter-spacing: 1.6px; display: block; margin-bottom: 14px; }
        .home .card-t { font-size: 19px; font-weight: 600; margin: 0 0 8px; }
        .home .card-d { font-size: 15px; color: var(--ink-muted); line-height: 1.6; margin: 0; }

        .home .price { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 32px; max-width: 460px; }
        .home .price-amt { display: flex; align-items: baseline; gap: 6px; margin-bottom: 22px; }
        .home .price-num { font-family: var(--font-serif); font-size: 64px; font-weight: 500; line-height: 1; }
        .home .price-eur { font-size: 28px; color: var(--ink-muted); }
        .home .price-per { font-size: 14px; color: var(--ink-muted); margin-left: 8px; }
        .home .price-list { list-style: none; padding: 0; margin: 0 0 26px; border-top: 1px solid var(--border); padding-top: 22px; }
        .home .price-list li { font-size: 14px; color: var(--ink-muted); margin-bottom: 10px; padding-left: 22px; position: relative; }
        .home .price-list li:before { content: '✓'; position: absolute; left: 0; color: var(--accent); }

        .home .faq { max-width: 720px; display: flex; flex-direction: column; gap: 10px; }
        .home .faq-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r-md); padding: 4px 20px; }
        .home .faq-q { cursor: pointer; padding: 14px 0; font-size: 15px; font-weight: 500; color: var(--ink); }
        .home .faq-q:hover { color: var(--accent); }
        .home .faq-a { font-size: 14px; color: var(--ink-muted); line-height: 1.65; padding: 0 0 16px; margin: 0; }

        .home .foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; padding-top: 28px; padding-bottom: 28px; border-top: 1px solid var(--border); }
        .home .foot-links { display: flex; gap: 18px; flex-wrap: wrap; }
        .home .foot-links a { font-size: 13px; color: var(--ink-muted); }
        .home .foot-links a:hover { color: var(--accent); }
        .home .foot-meta { font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint); }

        @media (max-width: 760px) {
          .home .grid3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
