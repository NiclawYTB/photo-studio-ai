import { supabaseAdmin } from '../../lib/supabase';

// POST /api/profile
// Header: Authorization: Bearer <supabase_access_token>
// Body: { full_name }
// Met à jour UNIQUEMENT le nom d'affichage du user connecté.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' });

  const { full_name } = req.body || {};
  if (typeof full_name !== 'string') {
    return res.status(400).json({ error: 'Nom invalide' });
  }
  const clean = full_name.trim().slice(0, 60);

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: clean })
    .eq('id', user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, full_name: clean });
}
