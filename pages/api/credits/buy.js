import Stripe from 'stripe';
import { supabaseAdmin } from '../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Ratio fixe : 1€ = 5 crédits.
const CREDITS_PER_EURO = 5;

// Packs préset (prix en CENTIMES — toujours côté serveur, jamais le client).
const PACKS = {
  '1':  { credits: 5,  amount: 100  },
  '5':  { credits: 25, amount: 500  },
  '10': { credits: 50, amount: 1000 },
};

// POST /api/credits/buy
// Header: Authorization: Bearer <supabase_access_token>
// Body: { pack: '1' | '5' | '10' }  ou  { pack: 'custom', amount_eur: 1-100 }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' });

  const { pack, amount_eur } = req.body || {};

  // Détermine le montant (en centimes) et les crédits à ajouter
  let amount, credits, label;

  if (pack === 'custom') {
    // Montant libre — on valide STRICTEMENT côté serveur.
    const eur = Number(amount_eur);
    if (!Number.isInteger(eur) || eur < 1 || eur > 100) {
      return res.status(400).json({ error: 'Montant invalide (1 à 100€, entier)' });
    }
    amount  = eur * 100;
    credits = eur * CREDITS_PER_EURO;
    label   = `Pack ${eur}€`;
  } else {
    const packDef = PACKS[pack];
    if (!packDef) return res.status(400).json({ error: 'Pack invalide' });
    amount  = packDef.amount;
    credits = packDef.credits;
    label   = `Pack ${amount / 100}€`;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Photo Studio · ${label}`,
            description: `${credits} génération${credits > 1 ? 's' : ''} IA`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: {
        user_id: user.id,
        pack: pack === 'custom' ? `custom_${amount_eur}` : pack,
        credits: String(credits),
      },
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_URL}/success-credits?credits=${credits}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_URL}/buy`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
