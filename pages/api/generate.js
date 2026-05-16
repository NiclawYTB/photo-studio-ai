import Replicate from 'replicate';
import Stripe from 'stripe';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId, image } = req.body;

  if (!sessionId || !image) {
    return res.status(400).json({ error: 'sessionId et image requis' });
  }

  // Verifie que le paiement est bien effectue
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Paiement non complete' });
    }
  } catch (err) {
    return res.status(403).json({ error: 'Session invalide' });
  }

  const prompt =
    'Transform this photo into a studio product photo for resale listing, ' +
    'white background, black display stand, slightly distant framing, ' +
    'clean professional lighting, sharp details, commercial photography style';

  // Lance 3 predictions en parallele
  try {
    const predictions = await Promise.all(
      [0].map(() =>
        replicate.predictions.create({
          model: 'black-forest-labs/flux-kontext-pro',
          input: {
            prompt,
            input_image: image,
            output_format: 'jpg',
            output_quality: 90,
          },
        })
      )
    );

    res.json({
      predictions: predictions.map((p) => ({ id: p.id, status: p.status })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
