import Replicate from 'replicate';
import { supabaseAdmin } from '../../lib/supabase';
import { buildPrompt } from '../../lib/promptOptions';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

// POST /api/generate
// Header: Authorization: Bearer <supabase_access_token>
// Body: { image: dataURL, selections: {...} }
// 1. Vérifie l'auth
// 2. Débit ATOMIQUE de 1 crédit (impossible de dépasser son solde, même en
//    cas de requêtes simultanées — voir supabase_atomic.sql / decrement_credit)
// 3. Lance Replicate. Si erreur → remboursement atomique.
// 4. Insère un row dans `generations`
// 5. Renvoie le prediction_id pour le polling client-side
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' });

  const { image, selections } = req.body || {};
  if (!image) return res.status(400).json({ error: 'Image requise' });

  // 2. Débit ATOMIQUE : -1 uniquement si credits >= 1, en une seule opération.
  //    Renvoie le nouveau solde, ou null si crédits insuffisants.
  const { data: newCredits, error: debitErr } = await supabaseAdmin
    .rpc('decrement_credit', { uid: user.id });

  if (debitErr) {
    return res.status(500).json({ error: 'Impossible de débiter le crédit' });
  }
  if (newCredits === null || newCredits === undefined || newCredits < 0) {
    return res.status(402).json({ error: 'Crédits insuffisants', credits: 0 });
  }

  // 3. Construire le prompt côté serveur (jamais depuis le client)
  const prompt = buildPrompt(selections || {});

  // 4. Lancer Replicate
  let prediction;
  try {
    prediction = await replicate.predictions.create({
      model: 'black-forest-labs/flux-kontext-pro',
      input: {
        prompt,
        input_image: image,
        output_format: 'jpg',
        output_quality: 90,
      },
    });
  } catch (err) {
    // Remboursement ATOMIQUE si Replicate plante
    await supabaseAdmin.rpc('add_credits', { uid: user.id, amount: 1 });
    return res.status(500).json({ error: `Replicate: ${err.message}` });
  }

  // 5. Enregistrer la génération (image_url ajoutée plus tard via /api/generations/update)
  await supabaseAdmin.from('generations').insert({
    user_id: user.id,
    prediction_id: prediction.id,
    selections: selections || {},
  });

  res.json({
    prediction: { id: prediction.id, status: prediction.status },
    credits: newCredits,
  });
}
