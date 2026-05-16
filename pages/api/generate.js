import Replicate from 'replicate';
import Stripe from 'stripe';
import { buildPrompt } from '../../lib/promptOptions';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId, image, selections } = req.body;

  if (!sessionId || !image) {
    return res.status(400).json({ error: 'sessionId et image requis' });
  }

  // Vérifie que le paiement est bien effectué.
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Paiement non complété' });
    }
  } catch (err) {
    return res.status(403).json({ error: 'Session invalide' });
  }

  // Construit le prompt côté serveur à partir des IDs envoyés.
  const prompt = buildPrompt(selections || {});

  // 1 SEULE prédiction par paiement (règle absolue).
  try {
    const prediction = await replicate.predictions.create({
      model: 'black-forest-labs/flux-kontext-pro',
      input: {
        prompt,
        input_image: image,
        output_format: 'jpg',
        output_quality: 90,
      },
    });

    res.json({
      prediction: { id: prediction.id, status: prediction.status },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
