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
// 2. Vérifie que l'user a >= 1 crédit
// 3. Débit 1 crédit
// 4. Lance Replicate. Si erreur → rembourse.
// 5. Insère un row dans `generations`
// 6. Renvoie le prediction_id pour le polling client-side
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' });

  const { image, selections } = req.body || {};
  if (!image) return res.status(400).json({ error: 'Image requise' });

  // 2. Vérifier le solde de crédits
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (profileErr) return res.status(500).json({ error: profileErr.message });
  if (!profile || profile.credits < 1) {
    return res.status(402).json({ error: 'Crédits insuffisants', credits: profile?.credits || 0 });
  }

  // 3. Débit du crédit (note: pas atomique au sens transactionnel pur — à durcir
  //    plus tard via une fonction PostgreSQL si scale. Pour le MVP c'est OK.)
  const { error: debitErr } = await supabaseAdmin
    .from('profiles')
    .update({ credits: profile.credits - 1 })
    .eq('id', user.id);

  if (debitErr) return res.status(500).json({ error: 'Impossible de débiter le crédit' });

  // 4. Construire le prompt côté serveur (jamais depuis le client)
  const prompt = buildPrompt(selections || {});

  // 5. Lancer Replicate
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
    // Remboursement automatique si Replicate plante
    await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits })
      .eq('id', user.id);
    return res.status(500).json({ error: `Replicate: ${err.message}` });
  }

  // 6. Enregistrer la génération en DB (sans image_url pour l'instant,
  //    elle sera ajoutée plus tard via /api/generations/update)
  await supabaseAdmin.from('generations').insert({
    user_id: user.id,
    prediction_id: prediction.id,
    selections: selections || {},
  });

  res.json({
    prediction: { id: prediction.id, status: prediction.status },
    credits: profile.credits - 1,
  });
}
