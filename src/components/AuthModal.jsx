
import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import '../styles/payment.css'

export default function AuthModal({ onDismiss, onSuccess, context }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('signup')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        })
      } else if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else if (mode === 'forgot') {
        result = await supabase.auth.resetPasswordForEmail(email, {
           redirectTo: window.location.origin + '?type=recovery',
        })
      }

      if (result.error) throw result.error

      if (result.data?.user && mode !== 'forgot') {
        onSuccess(result.data.user)
      } else if (mode === 'signup') {
        setError("Check your email for a confirmation link!")
      } else if (mode === 'forgot') {
        setError("Password reset email sent. Check your inbox.")
      }
    } catch (err) {
      console.error("Supabase Error Details:", err)
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

        <h2 className="payment-title">
          {mode === 'signup' ? 'Create Account' : mode === 'login' ? 'Welcome Back' : 'Reset Password'}
        </h2>
        <p className="payment-sub">
          {mode === 'forgot'
           ? 'Enter your email to receive a password reset link.'
           : context === 'download' 
            ? 'Sign in or create an account to verify your premium status and download.'
            : context === 'signup_first'
            ? 'Create a free account to secure your data and save automatically to the cloud.'
            : 'Save your progress and access it anywhere.'}
        </p>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode !== 'forgot' && (
             <div className="form-group">
               <div className="form-label-row">
                  <label className="form-label">Password</label>
                  {mode === 'login' && (
                     <button type="button" onClick={() => { setMode('forgot'); setError(null); }} className="link-btn">
                        Forgot password?
                     </button>
                  )}
               </div>
               <input
                 type="password"
                 className="form-input"
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
          )}

          {error && (
            <div className={`auth-error ${mode === 'forgot' && !error.toLowerCase().includes('error') ? 'success' : 'error'}`}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : mode === 'login' ? 'Log In' : 'Send Reset Link')}
          </button>
        </form>

        <button
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: '15px', fontSize: '0.85rem' }}
          onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null); }}
        >
          {mode === 'signup' ? 'Already have an account? Log in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  )
}
