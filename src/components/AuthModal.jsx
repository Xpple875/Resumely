
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

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
       setError(error.message)
       setLoading(false)
    }
    // No finally/setLoading(false) here because OAuth redirects away
  }

  return (
    <div className="auth-overlay">
      <div className="payment-card">
        <button onClick={onDismiss} className="auth-close-btn">&times;</button>

        <div className="payment-logo">Resum<span>ely</span></div>

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

        {mode !== 'forgot' && (
           <>
              <button 
                 onClick={handleGoogleLogin} 
                 className="btn btn-ghost" 
                 style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    marginBottom: '20px',
                    border: '1px solid var(--glass-border)',
                    padding: '12px'
                 }}
                 disabled={loading}
              >
                 <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
                 Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', opacity: 0.5 }}>
                 <div style={{ flex: 1, height: '1px', background: 'var(--text-light)' }}></div>
                 <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
                 <div style={{ flex: 1, height: '1px', background: 'var(--text-light)' }}></div>
              </div>
           </>
        )}

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
