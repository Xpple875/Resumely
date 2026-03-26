
import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import '../styles/payment.css' // Re-using payment styles for consistency

export default function AuthModal({ onDismiss, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('signup')

  const handleAuth = async (e) => {
    e.preventDefault()
    if (!supabase || import.meta.env.VITE_SUPABASE_URL?.includes('placeholder')) {
      setError("Cloud services not configured. Check environment variables.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({ email, password })
      } else {
        result = await supabase.auth.signInWithPassword({ email, password })
      }

      if (result.error) throw result.error
      if (result.data?.user) onSuccess(result.data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onDismiss}>&times;</button>
        <div className="payment-logo">Resum<span>e</span>ly</div>
        <h2 className="payment-title" style={{marginTop: '10px'}}>
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="payment-sub">Save your progress and access your resume anywhere.</p>

        <form onSubmit={handleAuth} style={{ marginTop: '20px', textAlign: 'left' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              className="form-input"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              className="form-input"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '15px' }}>{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <button
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: '10px', fontSize: '0.8rem' }}
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Already have an account? Log in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  )
}
