/**
 * Vercel Serverless Function — Groq AI Proxy
 * Route: POST /api/enhance
 * Model: llama-3.3-70b-versatile (Groq free tier — 14,400 req/day)
 * API key: GROQ_API_KEY in Vercel environment variables
 */
const rateLimitMap = new Map()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simple in-memory rate limiting (per cold-start instance)
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxReqs = 30 // absolute hard cap per IP per hour per instance

  const record = rateLimitMap.get(ip) || { count: 0, firstSec: now }
  if (now - record.firstSec > windowMs) {
    record.count = 1
    record.firstSec = now
  } else {
    record.count += 1
  }
  rateLimitMap.set(ip, record)

  if (record.count > maxReqs) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  // mode can be 'summary', 'bullet', or 'description'
  const { bullet, jobTitle, company, isSummary, mode } = req.body

  if (!bullet || !bullet.trim()) {
    return res.status(400).json({ error: 'No text provided' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const context = [jobTitle, company].filter(Boolean).join(' at ')
  
  let prompt = ''
  const effectiveMode = mode || (isSummary ? 'summary' : 'bullet')

  if (effectiveMode === 'summary') {
    prompt = `You are an expert resume writer. Rewrite the following professional summary to be more impactful and professional.
Rules:
- Write it as a concise paragraph (2-3 sentences max).
- Focus on the years of experience, core skills, and primary value proposition.
- Maintain the original facts and skills but use better terminology.
- Do NOT use bullet points or lists.
- Output ONLY the rewritten paragraph. No explanation, no quotes.`
  } else if (effectiveMode === 'description') {
    prompt = `You are an expert resume writer. Rewrite the following project or volunteering description to be highly professional, impactful, and clear.
Rules:
- Write it as a short, cohesive paragraph (2-4 sentences).
- Emphasize the core technologies, impact, leadership, or skills used.
- Do NOT use bullet points or lists.
- Avoid buzzword overload but keep the tone polished and professional.
- Maintain original technical stack/facts without hallucinating metrics.
- Output ONLY the rewritten paragraph. No explanation, no quotes.`
  } else {
    prompt = `You are an expert resume writer. Rewrite the following job duty as a single, high-impact resume bullet point.
Rules:
- Start with a powerful action verb.
- Focus on accomplishments and results rather than just duties.
- Keep it to one concise sentence.
- Maintain the original facts; do NOT invent new metrics.
- Output ONLY the rewritten bullet. No explanation, no quotes.`
  }

  const finalPrompt = `${prompt}

${context ? `Context: ${context}` : ''}
Original text: ${bullet.trim()}

Rewritten version:`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: finalPrompt }],
        temperature: 0.7,
        max_tokens: 300,
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
