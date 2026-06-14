import Stripe from 'stripe';
import { supabaseAdmin } from '../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT : Stripe a besoin du body brut (non parsé) pour valider la
// signature du webhook. On désactive donc le bodyParser de Next.js.
export const config = {
  api: { bodyParser: false },
};

// Lit le body brut sans le parser
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// POST /api/credits/webhook
// Endpoint appelé par Stripe quand un paiement aboutit.
// À configurer : Stripe Dashboard → Developers → Webhooks → Add endpoint
//   URL: https://photo-studio-ai-black.vercel.app/api/credits/webhook
//   Événement: checkout.session.completed
//   Puis copier le signing secret (whsec_...) → variable STRIPE_WEBHOOK_SECRET
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('Missing stripe-signature header');

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // On ne traite que les paiements aboutis pour un achat de crédits
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const creditsToAdd = parseInt(session.metadata?.credits, 10);

    if (!userId || !creditsToAdd) {
      console.error('Missing metadata on checkout session:', session.id);
      return res.status(200).json({ received: true, warning: 'metadata absente' });
    }

    // 1. IDEMPOTENCE — Stripe ré-émet ses webhooks : on enregistre la session.
    //    Si elle existe déjà (clé primaire), c'est qu'on a DÉJÀ crédité → on sort.
    const { error: dupErr } = await supabaseAdmin
      .from('processed_payments')
      .insert({ session_id: session.id });

    if (dupErr) {
      if (dupErr.code === '23505') {
        // Doublon = déjà traité, tout va bien.
        return res.json({ received: true, duplicate: true });
      }
      console.error('Webhook idempotency insert failed:', dupErr);
      return res.status(500).json({ error: 'Erreur idempotence' });
    }

    // 2. Ajout ATOMIQUE des crédits
    const { error: addErr } = await supabaseAdmin
      .rpc('add_credits', { uid: userId, amount: creditsToAdd });

    if (addErr) {
      console.error('Webhook credit add failed:', addErr);
      // On retire la trace d'idempotence pour qu'un retry Stripe puisse réussir.
      await supabaseAdmin.from('processed_payments').delete().eq('session_id', session.id);
      return res.status(500).json({ error: 'Crédit non ajouté' });
    }

    console.log(`✓ +${creditsToAdd} crédits → user ${userId}`);
  }

  res.json({ received: true });
}
