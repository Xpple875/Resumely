#!/usr/bin/env python3
"""
Resumely — Phase 4: Payments
Adds: payment gate on download, Stripe session verification,
unlock token stored in localStorage, success/pending/error screens.

Run from INSIDE the resumely/ folder in PowerShell:
    python phase4.py

You must have STRIPE_SECRET_KEY already added to Vercel env vars.
After running this script, also add STRIPE_PAYMENT_LINK to Vercel:
    vercel env add STRIPE_PAYMENT_LINK
"""

import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  OK  {path}")

# ─────────────────────────────────────────────────────────────────────────────
# api/verify-payment.js
# Verifies a Stripe checkout session ID and returns a signed unlock token.
# Called after Stripe redirects the user back to the app.
# ─────────────────────────────────────────────────────────────────────────────
write("api/verify-payment.js", r"""/**
 * Vercel Serverless Function — Stripe Session Verifier
 * Route: POST /api/verify-payment
 * Body:  { sessionId: string }
 * Returns: { token: string } on success
 *
 * Flow:
 * 1. Receive the Stripe checkout session ID from the client
 * 2. Call Stripe API to verify the session is paid
 * 3. Return a token the client stores in localStorage to unlock downloads
 *
 * No webhook needed — we verify on redirect instead.
 */

// Simple token: base64 of JSON payload. Not cryptographically signed
// because there's no user account to protect — just unlocks a download.
// Phase 5 (accounts) will replace this with a proper JWT.
function makeToken(sessionId) {
  const payload = {
    sessionId,
    paid: true,
    issuedAt: Date.now(),
    // Token valid for 30 days
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId } = req.body

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Missing session ID' })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  try {
    // Verify the session with Stripe — no SDK needed, just their REST API
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
        },
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Stripe verify error:', response.status, err)
      return res.status(502).json({ error: 'Could not verify payment' })
    }

    const session = await response.json()

    // Check payment is actually complete
    if (session.payment_status !== 'paid') {
      return res.status(402).json({
        error: 'Payment not completed',
        status: session.payment_status,
      })
    }

    const token = makeToken(sessionId)
    return res.status(200).json({ token })

  } catch (err) {
    console.error('verify-payment error:', err.message)
    return res.status(500).json({ error: 'Server error — try again' })
  }
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/services/paymentService.js
# Client-side payment logic: token storage, unlock check, verification call
# ─────────────────────────────────────────────────────────────────────────────
write("src/services/paymentService.js", """/**
 * Payment Service — client side
 * Manages the unlock token in localStorage.
 * Token is set after Stripe redirects back and we verify the session.
 */

const TOKEN_KEY = 'resumely_unlock_token'

// The Payment Link URL — Stripe redirects user here to pay
// Injected at build time via Vite env var, fallback to hardcoded for safety
const PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK ||
  'https://buy.stripe.com/test_3cIbJ20948VSgoR5vy8Vi00'

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

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function redirectToPayment() {
  // Append success redirect with session_id placeholder — Stripe fills it in
  const successUrl = encodeURIComponent(
    `${window.location.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`
  )
  window.location.href = `${PAYMENT_LINK}?success_url=${successUrl}`
}

export async function verifyAndUnlock(sessionId) {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Verification failed')
  }

  storeToken(data.token)
  return true
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/pages/PaymentSuccessPage.jsx
# Shown at /?payment=success&session_id=xxx while we verify
# ─────────────────────────────────────────────────────────────────────────────
write("src/pages/PaymentSuccessPage.jsx", """import React, { useEffect, useState } from 'react'
import { verifyAndUnlock } from '../services/paymentService.js'
import '../styles/payment.css'

export default function PaymentSuccessPage({ sessionId, onUnlocked }) {
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setErrorMsg('No session ID found. Please contact support.')
      return
    }

    verifyAndUnlock(sessionId)
      .then(() => {
        setStatus('success')
        // Give user 2 seconds to see success screen then go to builder
        setTimeout(() => onUnlocked(), 2000)
      })
      .catch(err => {
        setStatus('error')
        setErrorMsg(err.message || 'Verification failed — please try again.')
      })
  }, [sessionId])

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-logo">Resum<span>e</span>ly</div>

        {status === 'verifying' && (
          <>
            <div className="payment-spinner" />
            <h2 className="payment-title">Confirming your payment…</h2>
            <p className="payment-sub">Just a moment, this takes a second.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="payment-check">
              <CheckIcon />
            </div>
            <h2 className="payment-title">Payment confirmed!</h2>
            <p className="payment-sub">Taking you back to download your resume…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="payment-error-icon">
              <AlertIcon />
            </div>
            <h2 className="payment-title">Something went wrong</h2>
            <p className="payment-sub">{errorMsg}</p>
            <button className="btn btn-primary" style={{marginTop:'20px'}} onClick={() => onUnlocked()}>
              Back to resume
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/styles/payment.css
# ─────────────────────────────────────────────────────────────────────────────
write("src/styles/payment.css", """/* ── Payment / Success Screen ── */
.payment-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.payment-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 52px 48px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadeUp 0.3s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.payment-logo {
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--text);
  margin-bottom: 12px;
}
.payment-logo span { color: var(--accent); }

.payment-title {
  font-family: var(--font-heading);
  font-size: 26px;
  color: var(--text);
  font-weight: 400;
}

.payment-sub {
  font-size: 14px;
  color: var(--text-mid);
  line-height: 1.6;
}

/* Spinner */
.payment-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 8px 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Check */
.payment-check {
  width: 56px;
  height: 56px;
  background: #0f1f12;
  color: #6ee7b7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
}

/* Error */
.payment-error-icon {
  width: 56px;
  height: 56px;
  background: #2d1410;
  color: #f87171;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
}

/* ── Payment gate modal ── */
.paygate-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26,23,20,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.paygate-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 44px 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: fadeUp 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.paygate-price {
  font-family: var(--font-heading);
  font-size: 48px;
  color: var(--text);
  line-height: 1;
  margin: 8px 0;
}

.paygate-price sup {
  font-size: 24px;
  vertical-align: super;
  font-family: var(--font-body);
  font-weight: 400;
  color: var(--text-mid);
}

.paygate-title {
  font-family: var(--font-heading);
  font-size: 24px;
  color: var(--text);
  font-weight: 400;
}

.paygate-sub {
  font-size: 13px;
  color: var(--text-mid);
  line-height: 1.6;
  margin-bottom: 8px;
}

.paygate-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 4px 0 16px;
  width: 100%;
  text-align: left;
}

.paygate-features li {
  font-size: 13px;
  color: var(--text-mid);
  display: flex;
  align-items: center;
  gap: 8px;
}

.paygate-features li::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
  flex-shrink: 0;
}

.paygate-dismiss {
  font-size: 12px;
  color: var(--text-light);
  cursor: pointer;
  margin-top: 4px;
  background: none;
  border: none;
  font-family: var(--font-body);
  transition: color var(--transition);
}
.paygate-dismiss:hover { color: var(--text-mid); }
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/components/PayGateModal.jsx
# Modal shown when user clicks Download without having paid
# ─────────────────────────────────────────────────────────────────────────────
write("src/components/PayGateModal.jsx", """import React from 'react'
import { redirectToPayment } from '../services/paymentService.js'
import '../styles/payment.css'

export default function PayGateModal({ onDismiss }) {
  return (
    <div className="paygate-overlay" onClick={onDismiss}>
      <div className="paygate-card" onClick={e => e.stopPropagation()}>
        <div className="paygate-title">Download your resume</div>
        <div className="paygate-price"><sup>$</sup>8</div>
        <div className="paygate-sub">One-time payment. No subscription, ever.</div>
        <ul className="paygate-features">
          <li>ATS-optimised PDF download</li>
          <li>All three templates included</li>
          <li>Re-download anytime for 30 days</li>
          <li>AI bullet rewriter included</li>
        </ul>
        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={redirectToPayment}
        >
          Pay $8 and download
        </button>
        <button className="paygate-dismiss" onClick={onDismiss}>
          Continue editing
        </button>
      </div>
    </div>
  )
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/App.jsx — wire up payment flow and URL parsing
# ─────────────────────────────────────────────────────────────────────────────
write("src/App.jsx", """import React, { useState, useEffect } from 'react'
import TemplatePage from './pages/TemplatePage.jsx'
import BuilderPage from './pages/BuilderPage.jsx'
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx'
import { isUnlocked } from './services/paymentService.js'

function getInitialScreen() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('payment') === 'success') return 'payment-success'
  return 'template'
}

function getSessionId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('session_id') || ''
}

export default function App() {
  const [screen, setScreen]     = useState(getInitialScreen)
  const [template, setTemplate] = useState('classic')
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const sessionId               = getSessionId()

  // Clean URL after reading params
  useEffect(() => {
    if (screen === 'payment-success') {
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const goToBuilder = () => setScreen('builder')

  const handlePaymentUnlocked = () => {
    setUnlocked(true)
    setScreen('builder')
  }

  if (screen === 'payment-success') {
    return (
      <PaymentSuccessPage
        sessionId={sessionId}
        onUnlocked={handlePaymentUnlocked}
      />
    )
  }

  if (screen === 'builder') {
    return (
      <BuilderPage
        template={template}
        onChangeTemplate={() => setScreen('template')}
        unlocked={unlocked}
        onUnlocked={() => setUnlocked(true)}
      />
    )
  }

  return (
    <TemplatePage
      selected={template}
      onSelect={setTemplate}
      onContinue={goToBuilder}
    />
  )
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/pages/BuilderPage.jsx — add payment gate before PDF download
# ─────────────────────────────────────────────────────────────────────────────
write("src/pages/BuilderPage.jsx", """import React, { useState } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import PayGateModal from '../components/PayGateModal.jsx'
import { generatePDF } from '../utils/pdfExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { useAutosave, loadDraft, clearDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import '../styles/builder.css'

function getInitialData() {
  return loadDraft() || defaultResumeData
}

export default function BuilderPage({ template = 'classic', onChangeTemplate, unlocked, onUnlocked }) {
  const [resumeData, setResumeData]   = useState(getInitialData)
  const [isExporting, setIsExporting] = useState(false)
  const [showPayGate, setShowPayGate] = useState(false)
  const [mobileTab, setMobileTab]     = useState('form')
  const { toasts, showToast }         = useToast()

  useAutosave(resumeData)

  const handleDownloadClick = () => {
    if (!unlocked) {
      setShowPayGate(true)
      return
    }
    doExport()
  }

  const doExport = async () => {
    setIsExporting(true)
    try {
      await generatePDF(null, resumeData, resumeData.personal.name || 'resume')
      showToast('PDF downloaded!', 'success')
    } catch (err) {
      console.error('PDF export failed:', err)
      showToast('PDF export failed — try again.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearDraft = () => {
    clearDraft()
    setResumeData(defaultResumeData)
    showToast('Draft cleared.', 'info')
  }

  return (
    <div className="builder-layout">
      <header className="builder-header">
        <div className="builder-header__logo">
          Resum<span>e</span>ly
        </div>
        <div className="builder-header__actions">
          <div className="mobile-tabs">
            <button className={`mobile-tab ${mobileTab === 'form' ? 'active' : ''}`} onClick={() => setMobileTab('form')}>Edit</button>
            <button className={`mobile-tab ${mobileTab === 'preview' ? 'active' : ''}`} onClick={() => setMobileTab('preview')}>Preview</button>
          </div>
          <button className="btn btn-ghost" onClick={onChangeTemplate} title="Change template">
            <TemplateIcon /> <span className="hide-mobile">Template</span>
          </button>
          <button className="btn btn-ghost" onClick={handleClearDraft} title="Clear draft">
            <span className="hide-mobile">Clear</span>
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadClick} disabled={isExporting}>
            {isExporting
              ? <><SpinnerIcon /><span className="hide-mobile"> Exporting…</span></>
              : <><DownloadIcon /><span className="hide-mobile"> {unlocked ? 'Download PDF' : 'Download — $8'}</span></>
            }
          </button>
        </div>
      </header>

      <aside className={`form-panel ${mobileTab === 'preview' ? 'mobile-hidden' : ''}`}>
        <ResumeForm data={resumeData} onChange={setResumeData} onToast={showToast} />
      </aside>

      <main className={`preview-panel ${mobileTab === 'form' ? 'mobile-hidden' : ''}`}>
        <div className="resume-preview-wrapper">
          <ResumePreview data={resumeData} template={template} />
        </div>
      </main>

      <div className="download-bar">
        <button
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={handleDownloadClick}
          disabled={isExporting}
        >
          {unlocked ? (isExporting ? 'Generating PDF…' : 'Download PDF') : 'Download PDF — $8'}
        </button>
        <button className="btn btn-secondary" onClick={onChangeTemplate} title="Change template">
          <TemplateIcon />
        </button>
      </div>

      {showPayGate && (
        <PayGateModal onDismiss={() => setShowPayGate(false)} />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 0.8s linear infinite'}}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
function TemplateIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}
""")

print("""
Phase 4 files written.

NOW do this before deploying:

1. Add the Payment Link as a Vercel env var:
   vercel env add VITE_STRIPE_PAYMENT_LINK
   -> Select Production and Preview
   -> Paste: https://buy.stripe.com/test_3cIbJ20948VSgoR5vy8Vi00

2. Deploy:
   vercel --prod

3. Test the full flow:
   - Click Download PDF -> paygate modal appears
   - Click Pay $8 -> redirected to Stripe test checkout
   - Use test card: 4242 4242 4242 4242, any future date, any CVC
   - Stripe redirects back -> verifying screen -> success -> builder
   - Click Download PDF again -> PDF downloads directly (no modal)
   - Refresh -> still unlocked (token in localStorage)
""")
