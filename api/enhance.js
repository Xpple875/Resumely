/**
 * Vercel Serverless Function — Groq AI Proxy
 * Route: POST /api/enhance
 * Model: qwen/qwen3.6-27b with reasoning_effort 'none' (replaces llama-3.3-70b-versatile, retired by Groq on 2026-08-16)
 * API key: GROQ_API_KEY in Vercel environment variables
 */
import { createClient } from '@supabase/supabase-js'

const rateLimitMap = new Map();

export default async function handler(req, res) {
   if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
   }

   const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown-ip';
   const now = Date.now();
   if (rateLimitMap.has(ip)) {
      if (now - rateLimitMap.get(ip) < 1000) {
         return res.status(429).json({ error: 'Too many requests. Please wait a second.' });
      }
   }
   rateLimitMap.set(ip, now);
   if (rateLimitMap.size > 1000) rateLimitMap.clear();

   // mode can be 'summary', 'bullet', 'description', or 'get_usage'
   const { bullet, jobTitle, company, isSummary, mode, token } = req.body

   if (mode !== 'get_usage' && (!bullet || !bullet.trim())) {
      return res.status(400).json({ error: 'No text provided' })
   }

   const apiKey = process.env.GROQ_API_KEY
   if (!apiKey) {
      console.error('API key missing');
      return res.status(500).json({ error: 'System configuration error' })
   }

   const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

   if (!supabaseUrl || !supabaseServiceKey) {
      const missing = !supabaseUrl ? 'SUPABASE_URL' : 'SUPABASE_SERVICE_ROLE_KEY';
      console.error(`Supabase keys missing: ${missing}`);
      return res.status(500).json({ error: `System Configuration: ${missing} is missing in Vercel.` })
   }

   // Using Service Role Key to bypass RLS for usage tracking
   const supabase = createClient(supabaseUrl, supabaseServiceKey)

   // 1. Identify User (Token ID or IP Address)
   let identityId = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown-ip'

   if (token) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
      if (!authErr && user) {
         identityId = user.id
      }
   }

   // 2. Enforce 10 usage limit
   let count = 0
   try {
      const { data: usageData, error: fetchErr } = await supabase
         .from('ai_usage')
         .select('uses_count')
         .eq('id', identityId)
         .single()

      count = usageData?.uses_count || 0

      if (mode === 'get_usage') {
         return res.status(200).json({ 
            uses_left: Math.max(0, 10 - count) 
         })
      }

      if (count >= 10) {
         return res.status(429).json({ error: 'Free limit reached. You have used all 10 AI boosts.' })
      }

      // Increment Usage
      await supabase
         .from('ai_usage')
         .upsert({ id: identityId, uses_count: count + 1, last_reset: new Date().toISOString() })
   } catch (dbErr) {
      console.error('DB Usage limit check failed:', dbErr.message)
      // Fallback allow if DB crashes
   }

   const context = [jobTitle, company].filter(Boolean).join(' at ')

   let prompt = ''
   const effectiveMode = mode || (isSummary ? 'summary' : 'bullet')

   if (effectiveMode === 'summary') {
      prompt = `You are a world-class executive resume writer and career strategist. Rewrite the following professional summary to be exceptionally professional, impressive, and value-driven.
Rules:
- Prefix: Start with 'SUMMARY: '
- Style: Professional, executive-level tone. Use industry-leading terminology.
- Length: Concise paragraph (2-4 sentences max).
- Focus: Highlight years of experience, core expertise, and a unique value proposition that commands attention.
- Output ONLY the rewritten paragraph starting with 'SUMMARY: '. No explanation, no intro text, no conversational filler.`
   } else if (effectiveMode === 'description') {
      prompt = `You are an elite technical writer and resume consultant. Rewrite the following project or experience description to be results-oriented and technically sophisticated.
Rules:
- Prefix: Start with 'DESCRIPTION: '
- Style: Emphasize business value, challenges overcome, and technical proficiency.
- Length: Polished paragraph (2-4 sentences).
- Focus: Use sophisticated verbs and technical keywords. Highlight "the why" behind the actions.
- Output ONLY the rewritten paragraph starting with 'DESCRIPTION: '. No explanation, no intro text.`
   } else if (effectiveMode === 'generate_summary') {
      prompt = `You are a world-class career coach. Based on the following work experience, write a powerful, 3-sentence professional summary for a resume. 
Rules:
- Prefix: Start with 'SUMMARY: '
- Focus: Highlight key achievements, core skills, and professional value.
- Style: Professional, punchy, and achievement-oriented.
- Length: Exactly 3 sentences.
- Output ONLY the summary starting with 'SUMMARY: '. No explanation.`
   } else if (effectiveMode === 'parse_resume') {
      prompt = `You are an expert resume parser. Extract information from the provided raw text and return it EXACTLY in the following JSON format.
Rules:
1. Return ONLY the JSON object. No explanation, no intro.
2. If a field is missing, use "" for strings or [] for arrays.
3. Map experience, education, skills, projects, certifications, awards, publications, and courses.
4. For experience and education, generate a unique "id" (e.g., "id_123") for each entry.
5. CRITICAL: Preserve the original wording exactly. Do NOT paraphrase, summarize, improve, or change any of the text content. Your job is extraction, not enhancement. Keep every word exactly as it appears in the source.

Format:
{
  "personal": {
    "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "twitter": "", "portfolio": "", "website": "", "summary": ""
  },
  "experience": [
    { "id": "", "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "bullets": [""] }
  ],
  "education": [
    { "id": "", "degree": "", "institution": "", "startDate": "", "endDate": "", "gpa": "" }
  ],
  "skills": [""],
  "projects": [
    { "id": "", "name": "", "url": "", "description": "" }
  ],
  "certifications": [
    { "id": "", "name": "", "issuer": "", "date": "", "description": "" }
  ],
  "awards": [
    { "id": "", "name": "", "issuer": "", "date": "", "description": "" }
  ],
  "publications": [
    { "id": "", "title": "", "publisher": "", "date": "", "url": "", "description": "" }
  ],
  "courses": [
    { "id": "", "name": "", "institution": "", "date": "" }
  ],
  "languages": [
    { "id": "", "name": "", "level": "" }
  ],
  "volunteering": [
    { "id": "", "role": "", "organization": "", "date": "", "description": "" }
  ],
  "interests": [
    { "id": "", "name": "" }
  ],
  "references": [
    { "id": "", "name": "", "title": "", "company": "", "contact": "" }
  ]
}`
   } else if (effectiveMode === 'match_jd') {

      prompt = `You are a senior recruitment specialist. Analyze the provided resume (JSON format) against the job description (provided in 'Context').
Rules:
1. Identify 5-8 "Missing Keywords" that are in the JD but not prominent in the resume.
2. Suggest 3 "Suggested Highlights" — specific areas of the user's experience that they should emphasize or add to better match this JD.
Format the output EXACTLY like this:
MISSING KEYWORDS: keyword1, keyword2, keyword3, ...
SUGGESTED HIGHLIGHTS:
- suggestion 1
- suggestion 2
- suggestion 3
Output ONLY this analysis. No intro or outro.`
   } else {
      prompt = `You are a top-tier career recruitment specialist. Rewrite the following job duty or accomplishment into a high-impact, results-driven resume bullet point.
Rules:
- Prefix: Start with 'BULLET POINT: '
- Style: Use the 'Action + Context + Result' framework. Start with a powerful, specialized action verb.
- Content: Aim for quantifiable impact or qualitative improvements. Make it sound extremely professional and impressive.
- Length: One single, impactful sentence.
- Output ONLY the rewritten bullet starting with 'BULLET POINT: '. No explanation, no intro text.`
   }

   let finalPrompt = `${prompt}

${context ? `Context: ${context}` : ''}
Original text: ${bullet.trim()}`

   if (effectiveMode !== 'parse_resume') {
      finalPrompt += `\n\nRewritten version:`
   }


   try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
         },
         body: JSON.stringify({
            model: 'qwen/qwen3.6-27b',
            messages: [{ role: 'user', content: finalPrompt }],
            temperature: 0.1, // Lower temperature for more consistent JSON
            reasoning_effort: 'none',
            max_tokens: effectiveMode === 'parse_resume' ? 4000 : 1000,
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
      let result = data?.choices?.[0]?.message?.content?.trim()

      if (!result) {
         console.error('Empty Groq response:', responseText)
         return res.status(502).json({ error: 'Empty response from AI' })
      }

      // Clean up the result by removing common prefixes
      result = result.replace(/^(BULLET POINT|SUMMARY|DESCRIPTION|MISSING KEYWORDS|SUGGESTED HIGHLIGHTS):\s*/i, (match) => {
         // Keep the labels for JD matching since they are part of the structured output
         if (match.toUpperCase().includes('MISSING') || match.toUpperCase().includes('SUGGESTED')) return match;
         return '';
      })

      return res.status(200).json({
         result,
         uses_left: Math.max(0, 10 - (count + 1))
      })
   } catch (err) {
      console.error('enhance handler error:', err.message)
      return res.status(500).json({ error: 'Server error — try again' })
   }
}
