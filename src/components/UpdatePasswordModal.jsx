import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import '../styles/payment.css'

export default function UpdatePasswordModal({ onDismiss }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        onDismiss()
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay">
      <div className="payment-card">
        <button onClick={onDismiss} className="auth-close-btn">&times;</button>

        <div className="payment-logo">Resum<span>e</span>ly</div>

        {!success ? (
           <>
             <h2 className="payment-title">Reset Password</h2>
             <p className="payment-sub">Enter your new secure password.</p>

             <form onSubmit={handleUpdate} className="auth-form">
               <div className="form-group">
                 <label className="form-label">New Password</label>
                 <input
                   type="password"
                   className="form-input"
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                 />
               </div>

               {error && (
                 <div className="auth-error error" style={{ textAlign: 'left' }}>
                   {error}
                 </div>
               )}

               <button className="btn btn-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }} disabled={loading}>
                 {loading ? 'Updating...' : 'Update Password'}
               </button>
             </form>
           </>
        ) : (
           <div style={{ padding: '20px 0' }}>
             <div className="payment-check" style={{ margin: '0 auto 15px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="20 6 9 17 4 12"/>
                </svg>
             </div>
             <h2 className="payment-title">Password Updated</h2>
             <p className="payment-sub">You can now use your new password.</p>
           </div>
        )}
      </div>
    </div>
  )
}
