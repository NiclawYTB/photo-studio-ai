import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: 'ids requis' });

  const idList = ids.split(',');

  try {
    const results = await Promise.all(idList.map((id) => replicate.predictions.get(id)));
    res.json({
      predictions: results.map((p) => ({
        id: p.id,
        status: p.status,
        output: p.output,
        error: p.error,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
