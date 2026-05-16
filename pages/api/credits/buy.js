import Stripe from 'stripe';
import { supabaseAdmin } from '../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT : les prix sont définis CÔTÉ SERVEUR uniquement.
// Le client envoie juste l'ID du pack, on lit le prix ici.
const PACKS = {
  '1':  { credits: 1,  amount: 100,  label: '1 crédit'   },
  '5':  { credits: 5,  amount: 400,  label: '5 crédits'  },
  '15': { credits: 15, amount: 1000, label: '15 crédits' },
};

// POST /api/credits/buy
// Header: Authorization: Bearer <supabase_access_token>
// Body: { pack: '1' | '5' | '15' }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' });

  const { pack } = req.body || {};
  const packDef = PACKS[pack];
  if (!packDef) return res.status(400).json({ error: 'Pack invalide' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Photo Studio · ${packDef.label}`,
            description: `${packDef.credits} génération${packDef.credits > 1 ? 's' : ''} IA`,
          },
          unit_amount: packDef.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      // Metadata utilisée par le webhook pour créditer le bon user
      metadata: {
        user_id: user.id,
        pack,
        credits: String(packDef.credits),
      },
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_URL}/success-credits?credits=${packDef.credits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/buy`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
