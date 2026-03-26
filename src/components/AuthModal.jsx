
import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import '../styles/payment.css'

export default function AuthModal({ onDismiss, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('signup')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Debug check: This will show in your browser console (F12)
    console.log("Attempting Auth with URL:", import.meta.env.VITE_SUPABASE_URL)

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        })
      } else {
        result = await supabase.auth.signInWithPassword({ email, password })
      }

      if (result.error) throw result.error

      if (result.data?.user) {
        onSuccess(result.data.user)
      } else if (mode === 'signup') {
        setError("Check your email for a confirmation link!")
      }
    } catch (err) {
      console.error("Supabase Error Details:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-page" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="payment-card" style={{ position: 'relative' }}>
        <button
          onClick={onDismiss}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
        >
          &times;
        </button>

        <div className="payment-logo">Resum<span>e</span>ly</div>

        <h2 className="payment-title">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="payment-sub">Save your progress and access it anywhere.</p>

        <form onSubmit={handleAuth} style={{ marginTop: '25px', textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '15px', padding: '10px', background: '#fff5f5', borderRadius: '6px', border: '1px solid #ffcdd2' }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <button
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: '15px', fontSize: '0.85rem' }}
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Already have an account? Log in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  )
}
