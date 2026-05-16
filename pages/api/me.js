import { supabaseAdmin } from '../../lib/supabase';

// GET /api/me
// Header: Authorization: Bearer <supabase_access_token>
// Renvoie le profil de l'user connecté + ses dernières générations.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // 1. Authentifier l'user via son JWT Supabase
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' });

  // 2. Récupérer le profil (créé automatiquement par le trigger SQL)
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileErr) return res.status(500).json({ error: profileErr.message });

  // 3. Récupérer les 24 dernières générations
  const { data: generations } = await supabaseAdmin
    .from('generations')
    .select('id, prediction_id, image_url, selections, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(24);

  res.json({ ...profile, generations: generations || [] });
}
