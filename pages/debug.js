export default function Debug() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div style={{ padding: 40, fontFamily: 'monospace', color: '#fff', background: '#0B0A09', minHeight: '100vh' }}>
      <h1>Debug env</h1>
      <p>NEXT_PUBLIC_SUPABASE_URL :</p>
      <pre style={{ background: '#222', padding: 10, borderRadius: 4 }}>
        {url ? `défini (${url.length} caractères) → ${url}` : '❌ undefined / vide'}
      </pre>
      <p>NEXT_PUBLIC_SUPABASE_ANON_KEY :</p>
      <pre style={{ background: '#222', padding: 10, borderRadius: 4 }}>
        {key ? `défini (${key.length} caractères) → commence par ${key.slice(0, 20)}...` : '❌ undefined / vide'}
      </pre>
    </div>
  );
}
