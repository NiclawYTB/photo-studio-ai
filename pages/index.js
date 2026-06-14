import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  // Session + crédits (pour la nav de l'accueil)
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

  // Animation reveal au scroll
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Head>
        <title>Photo Studio — Photos produit studio par IA pour Vinted, eBay & Leboncoin</title>
        <meta name="description" content="Transforme une photo de smartphone en packshot studio professionnel en 30 secondes. Vêtements et électronique. 1€ = 5 photos, sans abonnement." />
        <meta name="keywords" content="photo produit IA, packshot studio, photo Vinted, photo Leboncoin, fond studio IA, vendre en ligne, photo vêtement IA, photo électronique" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://photo-studio-ai-black.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Photo Studio" />
        <meta property="og:title" content="Photo Studio — Tes photos. En studio." />
        <meta property="og:description" content="Transforme tes photos en packshots pros en 30 secondes. 1€ = 5 photos, sans abonnement." />
        <meta property="og:url" content="https://photo-studio-ai-black.vercel.app/" />
        <meta property="og:locale" content="fr_FR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#0B0A09" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Photo Studio',
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web',
            description: 'Transforme une photo de smartphone en packshot studio professionnel par IA, pour Vinted, eBay et Leboncoin.',
            offers: { '@type': 'Offer', price: '1.00', priceCurrency: 'EUR', description: '1 € = 5 photos générées' },
          }) }}
        />
      </Head>

      {/* HERO BLOCK */}
      <div className="hero-wrap">
        <div className="halo" aria-hidden="true" />

        <nav className="nav container">
          <Link href="/" className="logo">
            <span className="logo-mark" />
            <span className="logo-text">Photo Studio</span>
          </Link>
          <div className="nav-links">
            <a href="#how" className="nav-anchor">Comment ça marche</a>
            <a href="#pricing" className="nav-anchor">Tarifs</a>
            {session ? (
              <>
                <Link href="/account" className="nav-credits" title="Mes crédits">
                  <span className="nav-credits-num">{credits ?? '·'}</span>
                  <span className="nav-credits-lbl">crédits</span>
                </Link>
                <Link href="/account" className="nav-account">Mon Compte</Link>
                <Link href="/app" className="nav-cta">Créer →</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-account">Se connecter</Link>
                <Link href="/app" className="nav-cta">Commencer →</Link>
              </>
            )}
          </div>
        </nav>

        <header className="hero container">
          <div className="hero-pill reveal">
            <span className="dot" />
            <span>Maintenant en bêta · 1€/photo</span>
          </div>

          <h1 className="hero-title reveal">
            Tes photos.<br />
            <span className="muted">Sauf qu'on dirait</span><br />
            qu'elles sortent d'un studio.
          </h1>

          <p className="hero-sub reveal">
            Glisse une photo de smartphone. Choisis un fond, un éclairage, un support.
            Ton packshot est prêt en 30 secondes.
          </p>

          <div className="hero-ctas reveal">
            <Link href="/app" className="btn btn-primary">Commencer →</Link>
            <a href="#how" className="btn btn-ghost">Voir comment</a>
          </div>

          {/* Before / After */}
          <div className="ba-grid reveal">
            <div className="ba-card">
              <div className="ba-head">
                <span className="ba-label">01 — Source</span>
                <span className="ba-dot dim" />
              </div>
              {/* Remplace par <img src="/demo-before.jpg" /> quand tu as une vraie image */}
              <div className="ba-img ba-img-before">
                <span className="ba-img-label">photo perso</span>
              </div>
            </div>
            <div className="ba-card ba-card-after">
              <div className="ba-head">
                <span className="ba-label accent">02 — Studio</span>
                <span className="ba-dot" />
              </div>
              {/* Remplace par <img src="/demo-after.jpg" /> quand tu as une vraie image */}
              <div className="ba-img ba-img-after">
                <span className="ba-img-label">packshot pro</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Comment ça marche</span>
            <h2 className="section-title">Trois étapes. Trente secondes.</h2>
          </div>

          <div className="steps reveal">
            {[
              {
                n: '01',
                t: 'Upload',
                d: "Glisse n'importe quelle photo de ton produit. Smartphone, scan, capture d'écran — tout passe.",
              },
              {
                n: '02',
                t: 'Personnalise',
                d: "Choisis ton fond, ton éclairage, ton support. Plus de 1 000 combinaisons disponibles.",
              },
              {
                n: '03',
                t: 'Génère',
                d: "L'IA reconstruit ta photo dans un vrai studio. Téléchargement immédiat, en haute définition.",
              },
            ].map((s) => (
              <div key={s.n} className="step">
                <span className="step-n">{s.n}</span>
                <h3 className="step-t">{s.t}</h3>
                <p className="step-d">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className="section section-soft">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Pour qui</span>
            <h2 className="section-title">Pensé pour ceux qui vendent.</h2>
          </div>

          <ul className="who-list reveal">
            <li><span className="who-dot" />Tu vends sur Vinted, Leboncoin, eBay.</li>
            <li><span className="who-dot" />Tu débutes en e-commerce ou en dropshipping.</li>
            <li><span className="who-dot" />Tu n'as pas le matos photo, ni le temps de monter un studio.</li>
            <li><span className="who-dot" />Tu veux des photos qui se vendent — pas une appli compliquée.</li>
          </ul>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Tarif</span>
            <h2 className="section-title">Un prix. Une photo.</h2>
          </div>

          <div className="price-card reveal">
            <div className="price-head">
              <span className="price-mono">photo_studio.pricing</span>
              <span className="price-dot" />
            </div>
            <div className="price-amount">
              <span className="price-num">1</span>
              <span className="price-currency">€</span>
              <span className="price-per">/ photo générée</span>
            </div>
            <ul className="price-features">
              <li>1 photo studio HD par paiement</li>
              <li>Plus de 1 000 combinaisons de styles</li>
              <li>Téléchargement immédiat, sans filigrane</li>
              <li>Pas d'abonnement, pas d'inscription</li>
              <li>Paiement sécurisé Stripe</li>
            </ul>
            <Link href="/app" className="btn btn-primary btn-block">Commencer →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-soft">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title">Questions fréquentes</h2>
          </div>
          <div className="faq reveal">
            {[
              { q: "Ça marche avec n'importe quelle photo ?", a: 'Oui — smartphone, scan, capture d\'écran. Plus la photo est nette et bien éclairée, meilleur est le rendu.' },
              { q: 'Mon produit est-il bien préservé ?', a: 'Oui : l\'IA garde la matière, les couleurs, les motifs et les logos à l\'identique. Seuls le fond et l\'éclairage changent.' },
              { q: 'Combien ça coûte ?', a: '1 € = 5 crédits, soit 5 photos générées. Pas d\'abonnement : tu paies seulement ce que tu utilises.' },
              { q: 'Pour quels produits ?', a: 'Vêtements (t-shirt, pull, veste, chaussures…) et électronique (console, manette, smartphone, jeux vidéo…).' },
              { q: 'Les images ont-elles un filigrane ?', a: 'Non. Tu télécharges tes photos en HD, sans filigrane, prêtes à publier sur Vinted, eBay ou Leboncoin.' },
            ].map((item, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-q">{item.q}</summary>
                <p className="faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
        <style jsx>{`
          .faq { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
          .faq-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r-md); padding: 6px 20px; }
          .faq-q { cursor: pointer; padding: 14px 0; font-size: 15px; font-weight: 500; color: var(--ink); }
          .faq-q:hover { color: var(--accent); }
          .faq-a { font-size: 14px; color: var(--ink-muted); line-height: 1.65; padding: 0 0 16px; margin: 0; }
        `}</style>
      </section>

      {/* FINAL CTA */}
      <section className="section">
        <div className="container">
          <div className="final-cta reveal">
            <h2 className="final-title">Prêt à transformer tes photos ?</h2>
            <p className="final-sub">Tu peux upload, configurer et payer en moins d'une minute.</p>
            <Link href="/app" className="btn btn-primary btn-lg">Commencer maintenant →</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="logo">
            <span className="logo-mark" />
            <span className="logo-text">Photo Studio</span>
          </div>
          <div className="footer-links">
            <Link href="/mentions-legales" className="footer-link">Mentions légales</Link>
            <Link href="/cgv" className="footer-link">CGV</Link>
            <Link href="/confidentialite" className="footer-link">Confidentialité</Link>
          </div>
          <span className="footer-meta">© {new Date().getFullYear()} Photo Studio · Paiement sécurisé Stripe</span>
        </div>
      </footer>

      <style jsx>{`
        /* ==================== HERO ==================== */
        .hero-wrap {
          position: relative;
          overflow: hidden;
          background: var(--bg);
        }

        .halo {
          position: absolute;
          top: -180px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 380px;
          background: radial-gradient(ellipse at center, var(--accent-glow), transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        /* Nav */
        .nav {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 24px;
          padding-bottom: 24px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 13px;
          color: var(--ink-muted);
        }
        .nav-links a:hover { color: var(--ink); }
        .nav-links :global(.nav-account) {
          color: var(--ink-muted);
          transition: color 0.15s;
        }
        .nav-links :global(.nav-account:hover) { color: var(--ink); }
        .nav-links :global(.nav-credits) {
          display: inline-flex;
          align-items: baseline;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 999px;
          background: var(--bg-card);
          border: 1px solid var(--border-accent);
          transition: border-color 0.15s;
        }
        .nav-links :global(.nav-credits:hover) { border-color: var(--accent); }
        .nav-links :global(.nav-credits-num) { font-size: 13px; font-weight: 700; color: var(--accent); letter-spacing: -0.01em; }
        .nav-links :global(.nav-credits-lbl) { font-size: 10px; color: var(--ink-faint); font-family: var(--font-mono); letter-spacing: 0.4px; }
        .nav-links :global(.nav-cta) {
          background: var(--ink);
          color: var(--bg);
          padding: 8px 14px;
          border-radius: var(--r);
          font-weight: 500;
          transition: background 0.15s;
        }
        .nav-links :global(.nav-cta:hover) {
          background: var(--accent);
        }

        /* Hero content */
        .hero {
          position: relative;
          z-index: 2;
          padding-top: 80px;
          padding-bottom: 120px;
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink-muted);
          padding: 5px 12px;
          border: 1px solid var(--border-strong);
          border-radius: 999px;
          margin-bottom: 36px;
        }
        .dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2.5s ease-in-out infinite;
        }

        .hero-title {
          font-size: clamp(46px, 6.6vw, 74px);
          line-height: 1.04;
          font-weight: 500;
          letter-spacing: -0.02em;
          margin-bottom: 28px;
          max-width: 16ch;
        }
        .muted { color: var(--ink-muted); font-weight: 400; }

        .hero-sub {
          font-size: 18px;
          line-height: 1.6;
          color: var(--ink-muted);
          max-width: 48ch;
          margin-bottom: 40px;
        }

        .hero-ctas {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 72px;
        }

        /* Before/After teaser */
        .ba-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          max-width: 640px;
        }
        .ba-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 12px;
        }
        .ba-card-after { border-color: var(--border-accent); }

        .ba-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .ba-label {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-faint);
          text-transform: uppercase;
          letter-spacing: 1.6px;
        }
        .ba-label.accent { color: var(--accent); }
        .ba-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
        }
        .ba-dot.dim { background: var(--ink-faint); }

        .ba-img {
          aspect-ratio: 4 / 3;
          border-radius: var(--r-sm);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 16px;
        }
        .ba-img-before {
          background: linear-gradient(135deg, #2a2622 0%, #1a1714 100%);
        }
        .ba-img-after {
          background: #FAFAF7;
        }
        .ba-img-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .ba-img-before .ba-img-label { color: var(--ink-faint); }
        .ba-img-after .ba-img-label { color: #1C1A17; font-weight: 500; }

        @media (max-width: 720px) {
          .hero { padding-top: 48px; padding-bottom: 80px; }
          .nav-links { gap: 12px; }
          .nav-links .nav-anchor { display: none; }
          .ba-grid { grid-template-columns: 1fr; }
        }

        /* ==================== SECTIONS ==================== */
        :global(.section-soft) {
          background: var(--bg-soft);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .section-head {
          margin-bottom: 56px;
          max-width: 640px;
        }
        .eyebrow {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 1.8px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: clamp(32px, 4.5vw, 46px);
          line-height: 1.1;
          letter-spacing: -0.015em;
          font-weight: 500;
        }

        /* Steps */
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .step {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 24px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .step:hover {
          border-color: var(--border-strong);
          transform: translateY(-2px);
        }
        .step-n {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 1.6px;
          display: block;
          margin-bottom: 14px;
        }
        .step-t {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .step-d {
          font-size: 14px;
          color: var(--ink-muted);
          line-height: 1.6;
        }

        @media (max-width: 720px) {
          .steps { grid-template-columns: 1fr; }
        }

        /* For who */
        .who-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 600px;
        }
        .who-list li {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          font-size: 17px;
          color: var(--ink);
          line-height: 1.55;
        }
        .who-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          margin-top: 11px;
          flex-shrink: 0;
        }

        /* Pricing */
        .price-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 32px;
          max-width: 480px;
          margin: 0 auto;
        }
        .price-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        .price-mono {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink-faint);
          letter-spacing: 1.4px;
        }
        .price-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2.5s ease-in-out infinite;
        }
        .price-amount {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 28px;
        }
        .price-num {
          font-size: 64px;
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .price-currency {
          font-size: 28px;
          color: var(--ink-muted);
          font-weight: 500;
        }
        .price-per {
          font-size: 14px;
          color: var(--ink-muted);
          margin-left: 8px;
        }
        .price-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
          border-top: 1px solid var(--border);
          padding-top: 24px;
        }
        .price-features li {
          font-size: 14px;
          color: var(--ink-muted);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .price-features li::before {
          content: '✓';
          color: var(--accent);
          font-size: 13px;
        }

        /* Final CTA */
        .final-cta {
          text-align: center;
          padding: 80px 32px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          position: relative;
          overflow: hidden;
        }
        .final-cta::before {
          content: '';
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 200px;
          background: radial-gradient(ellipse, var(--accent-soft), transparent 70%);
          pointer-events: none;
        }
        .final-title {
          font-size: clamp(28px, 4vw, 40px);
          letter-spacing: -0.03em;
          margin-bottom: 16px;
          font-weight: 600;
          position: relative;
        }
        .final-sub {
          font-size: 16px;
          color: var(--ink-muted);
          margin-bottom: 32px;
          position: relative;
        }
        .final-cta :global(.btn) {
          position: relative;
        }

        /* Footer */
        :global(.footer) {
          border-top: 1px solid var(--border);
          padding: 28px 0;
        }
        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-links { display: flex; gap: 18px; flex-wrap: wrap; }
        .footer-links :global(.footer-link) { font-size: 13px; color: var(--ink-muted); transition: color 0.15s; }
        .footer-links :global(.footer-link:hover) { color: var(--accent); }
        .footer-meta {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink-faint);
          letter-spacing: 0.5px;
        }
      `}</style>
    </>
  );
}
