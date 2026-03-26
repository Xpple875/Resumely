/**
 * Vercel Serverless Function — Groq AI Proxy
 * Route: POST /api/enhance
 * Model: llama-3.3-70b-versatile (Groq free tier — 14,400 req/day)
 * API key: GROQ_API_KEY in Vercel environment variables
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bullet, jobTitle, company } = req.body

  if (!bullet || !bullet.trim()) {
    return res.status(400).json({ error: 'No bullet text provided' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const context = [jobTitle, company].filter(Boolean).join(' at ')
  const prompt = `You are an expert resume writer. Rewrite the following job duty as a single, strong resume bullet point.

Rules:
- Start with a powerful action verb (past tense for past roles, present tense for current)
- Include a measurable result or impact where possible
- Keep it to one sentence, under 20 words
- Do NOT add fictional numbers or metrics that were not implied in the original
- Output ONLY the rewritten bullet. No explanation, no formatting, no quotes.

${context ? `Role context: ${context}` : ''}

Original: ${bullet.trim()}

Rewritten bullet:`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 100,
        stop: ['\n'],
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Groq status:', response.status)
      console.error('Groq error:', responseText)
      return res.status(502).json({
        error: 'AI service error',
        debug_status: response.status,
        debug_body: responseText,
      })
    }

    const data = JSON.parse(responseText)
    const result = data?.choices?.[0]?.message?.content?.trim()

    if (!result) {
      console.error('Empty Groq response:', responseText)
      return res.status(502).json({ error: 'Empty response from AI' })
    }

    return res.status(200).json({ result })
  } catch (err) {
    console.error('enhance handler error:', err.message)
    return res.status(500).json({ error: 'Server error — try again' })
  }
}
