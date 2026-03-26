/**
 * AI Service — calls our Vercel proxy, never Gemini directly.
 * Enforces the 15-uses-per-session cap client-side.
 */

const SESSION_KEY = 'resumely_ai_uses'
const MAX_USES = 15

export function getAIUsesLeft() {
   const used = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10)
   return Math.max(0, MAX_USES - used)
}

function incrementAIUses() {
   const used = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10)
   sessionStorage.setItem(SESSION_KEY, String(used + 1))
}

export async function enhanceBullet(bullet, jobTitle = '', company = '') {
   if (!bullet.trim()) {
      throw new Error('Please write something in the bullet first.')
   }

   if (getAIUsesLeft() <= 0) {
      throw new Error("You've used all 15 AI enhancements for this session. Refresh to reset.")
   }

   const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullet, jobTitle, company }),
   })

   const data = await response.json()

   if (!response.ok) {
      throw new Error(data.error || 'Enhancement failed — try again.')
   }

   incrementAIUses()
   return data.result
}
