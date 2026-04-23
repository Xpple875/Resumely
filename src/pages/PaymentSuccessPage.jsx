
import React, { useEffect, useState } from 'react'
import { verifyAndUnlock } from '../services/paymentService.js'
import { markUserAsPaid, supabase } from '../services/supabaseClient.js'
import '../styles/payment.css'

export default function PaymentSuccessPage({ sessionId, onUnlocked, user }) {
  const [status, setStatus] = useState('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let isMounted = true

    if (!sessionId) {
      setStatus('error')
      setErrorMsg('No session ID found. Please contact support.')
      return
    }

    const verifyAndUpdateUser = async () => {
      // 1. Verify payment with our backend (validates session with Stripe)
      await verifyAndUnlock(sessionId)
      
      // 2. Ensure we have the user to link payment to
      let currentUserId = user?.id
      if (!currentUserId) {
        const { data: { session } } = await supabase.auth.getSession()
        currentUserId = session?.user?.id
      }
      
      // 3. Mark the account as paid in Supabase
      if (currentUserId) {
        await markUserAsPaid(currentUserId)
      } else {
         console.warn("Payment verified, but no signed-in user found to upgrade. Status active in local storage only.")
      }
    }

    verifyAndUpdateUser()
      .then(() => {
        if (!isMounted) return
        setStatus('success')
        setTimeout(() => {
          onUnlocked() // Trigger the parent state update
          window.location.search = '' // Clear the URL params
        }, 2000)
      })
      .catch(err => {
        if (!isMounted) return
        setStatus('error')
        setErrorMsg(err.message || 'Verification failed — please try again.')
      })

    return () => { isMounted = false }
  }, [sessionId, onUnlocked, user])

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-logo">Resum<span>e</span>ly</div>

        {status === 'verifying' && (
          <>
            <div className="payment-spinner" />
            <h2 className="payment-title">Confirming your payment...</h2>
            <p className="payment-sub">Just a moment, we're verifying with Stripe.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="payment-check">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="payment-title">Payment confirmed!</h2>
            <p className="payment-sub">Taking you back to download your resume...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="payment-error-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="payment-title">Verification Delayed</h2>
            <p className="payment-sub">{errorMsg}</p>
            <p className="payment-sub" style={{fontSize: '0.8rem', marginTop: '10px'}}>
               If you just paid, click the button below to try one last time.
            </p>
            <button className="btn btn-primary" style={{marginTop:'20px'}} onClick={() => window.location.reload()}>
              Retry Verification
            </button>
            <button className="btn btn-ghost" style={{marginTop:'10px'}} onClick={() => onUnlocked()}>
              Back to Editor
            </button>
          </>
        )}
      </div>
    </div>
  )
}
