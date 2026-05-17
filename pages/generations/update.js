import { supabaseAdmin } from '../../../lib/supabase';

// POST /api/generations/update
// Header: Authorization: Bearer <supabase_access_token>
// Body: { prediction_id, image_url }
// Appelé par /success.js quand le polling Replicate finit en succès.
// On met à jour le row existant en vérifiant que c'est bien le user qui possède
// cette génération (pas n'importe qui peut écraser n'importe quel row).
//
// ⚠️ NOTE : image_url est une URL Replicate qui EXPIRE au bout de quelques heures
// à quelques jours. Pour une vraie galerie persistante, il faudra plus tard
// re-uploader l'image vers Supabase Storage (ou S3/R2) et stocker ce lien-là.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' });

  const { prediction_id, image_url } = req.body || {};
  if (!prediction_id || !image_url) {
    return res.status(400).json({ error: 'prediction_id et image_url requis' });
  }

  // On contraint sur user_id pour éviter qu'un user écrase le row d'un autre.
  const { error } = await supabaseAdmin
    .from('generations')
    .update({ image_url })
    .eq('prediction_id', prediction_id)
    .eq('user_id', user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}
