
const TOKEN_KEY = 'resumely_unlock_token'
const PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/test_3cIbJ20948VSgoR5vy8Vi00'

export function isUnlocked() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return false
    const payload = JSON.parse(atob(raw))
    if (!payload.paid) return false
    if (Date.now() > payload.expiresAt) {
      localStorage.removeItem(TOKEN_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export async function verifyAndUnlock(sessionId, retries = 2) {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })

    const data = await response.json()

    if (!response.ok) {
      // If Stripe isn't ready yet (502) and we have retries left, wait and try again
      if (response.status === 502 && retries > 0) {
        await new Promise(res => setTimeout(res, 1500))
        return verifyAndUnlock(sessionId, retries - 1)
      }
      throw new Error(data.error || 'Verification failed')
    }

    storeToken(data.token)
    return true
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 1500))
      return verifyAndUnlock(sessionId, retries - 1)
    }
    throw err
  }
}

export function redirectToPayment() {
  const successUrl = encodeURIComponent(
    `${window.location.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`
  )
  window.location.href = `${PAYMENT_LINK}?success_url=${successUrl}`
}
