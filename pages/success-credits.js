import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function SuccessCredits() {
  const { query } = useRouter();
  const credits = parseInt(query.credits) || 1;

  return (
    <>
      <Head><title>Crédits ajoutés · Photo Studio</title></Head>
      <div className="page">
        <div className="box">
          <span className="check">✓</span>
          <span className="eyebrow">Paiement confirmé</span>
          <h1 className="title">{credits} crédit{credits > 1 ? 's' : ''} ajouté{credits > 1 ? 's' : ''}.</h1>
          <p className="sub">Ton solde a été mis à jour. Tu peux générer ta prochaine photo dès maintenant.</p>
          <Link href="/app"><button className="btn btn-primary btn-block">Générer une photo →</button></Link>
          <Link href="/account"><button className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>Voir mon studio</button></Link>
        </div>
      </div>
      <style jsx>{`
        .page { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; padding:20px; }
        .box { width:100%; max-width:400px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); padding:48px 40px; text-align:center; }
        .check { display:block; width:52px; height:52px; background:rgba(110,199,154,.12); border:1px solid rgba(110,199,154,.3); border-radius:50%; line-height:52px; font-size:22px; margin:0 auto 28px; color:var(--success); }
        .eyebrow { font-family:var(--font-mono); font-size:10px; color:var(--success); letter-spacing:2px; text-transform:uppercase; display:block; margin-bottom:10px; }
        .title { font-size:26px; font-weight:700; letter-spacing:-0.02em; margin:0 0 10px; }
        .sub { font-size:14px; color:var(--ink-muted); margin:0 0 32px; line-height:1.6; }
      `}</style>
    </>
  );
}
