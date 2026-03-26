
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId } = req.body;
  // Vercel uses process.env for secrets
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId) return res.status(400).json({ error: 'Missing session ID' });

  if (!stripeKey) {
    return res.status(500).json({
      error: 'STRIPE_SECRET_KEY is missing in Vercel Settings. Please add it and redeploy.'
    });
  }

  try {
    // 1.5s delay to ensure Stripe's database is synced
    await new Promise(r => setTimeout(r, 1500));

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: `Stripe API error: ${errorData.error?.message || 'Unknown Stripe error'}`
      });
    }

    const session = await response.json();

    if (session && session.payment_status === 'paid') {
      const payload = {
        sessionId,
        paid: true,
        issuedAt: Date.now(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
      };
      const token = Buffer.from(JSON.stringify(payload)).toString('base64');
      return res.status(200).json({ token });
    }

    return res.status(402).json({
      error: `Payment not confirmed. Current status: ${session?.payment_status || 'unknown'}`
    });

  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
