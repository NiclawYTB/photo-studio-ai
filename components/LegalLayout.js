import Head from 'next/head';
import Link from 'next/link';

// Mise en page commune aux pages légales (CGV, mentions, confidentialité).
export default function LegalLayout({ title, updated, children }) {
  return (
    <>
      <Head>
        <title>{title} · Photo Studio</title>
        <meta name="robots" content="noindex, follow" />
      </Head>

      <nav className="legal-nav container">
        <Link href="/" className="logo">
          <span className="logo-mark" />
          <span className="logo-text">Photo Studio</span>
        </Link>
        <Link href="/" className="legal-back">← Accueil</Link>
      </nav>

      <main className="container legal-main">
        <h1 className="legal-title">{title}</h1>
        {updated && <p className="legal-updated">Dernière mise à jour : {updated}</p>}
        <div className="legal-body">{children}</div>

        <div className="legal-foot-links">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/cgv">CGV</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </div>
      </main>

      <style jsx global>{`
        .legal-nav { display: flex; align-items: center; justify-content: space-between; padding-top: 18px; padding-bottom: 18px; border-bottom: 1px solid var(--border); }
        .legal-back { font-size: 14px; color: var(--ink-muted); transition: color .15s; }
        .legal-back:hover { color: var(--ink); }

        .legal-main { max-width: 760px; padding-top: 48px; padding-bottom: 96px; }
        .legal-title { font-size: 32px; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 8px; }
        .legal-updated { font-size: 12px; color: var(--ink-faint); font-family: var(--font-mono); letter-spacing: 0.4px; margin: 0 0 36px; }

        .legal-body { color: var(--ink-muted); font-size: 15px; line-height: 1.75; }
        .legal-body h2 { color: var(--ink); font-size: 18px; font-weight: 600; letter-spacing: -0.01em; margin: 34px 0 10px; }
        .legal-body p { margin: 0 0 14px; }
        .legal-body ul { margin: 0 0 14px; padding-left: 20px; }
        .legal-body li { margin-bottom: 6px; }
        .legal-body strong { color: var(--ink); }
        .legal-body a { color: var(--accent); }
        .legal-body .todo { color: var(--accent); font-family: var(--font-mono); font-size: 13px; background: var(--accent-soft); padding: 1px 6px; border-radius: 4px; }

        .legal-foot-links { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 56px; padding-top: 24px; border-top: 1px solid var(--border); }
        .legal-foot-links a { font-size: 13px; color: var(--ink-faint); transition: color .15s; }
        .legal-foot-links a:hover { color: var(--accent); }
      `}</style>
    </>
  );
}
