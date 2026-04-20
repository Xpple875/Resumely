import React, { useState, useEffect } from 'react'
import BuilderPage from './pages/BuilderPage'
import TemplatePage from './pages/TemplatePage'
import LandingPage from './pages/LandingPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import { isUnlocked } from './services/paymentService'
import { loadDraft } from './hooks/useAutosave'
import { supabase } from './services/supabaseClient'

export default function App() {
  const [view, setView] = useState('landing')
  const [template, setTemplate] = useState('classic')
  const [unlocked, setUnlocked] = useState(isUnlocked())
  const [user, setUser] = useState(null)
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleStart = () => {
     if (loadDraft()) setView('builder')
     else setView('template')
  }

  const handleSelectTemplate = (id) => {
    setTemplate(id)
    setView('builder')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.reload()
  }

  const params = new URLSearchParams(window.location.search)
  if (params.get('payment') === 'success' && !unlocked) {
    return (
      <PaymentSuccessPage
        sessionId={params.get('session_id')}
        onUnlocked={() => { setUnlocked(true); setView('builder'); }}
      />
    )
  }

  return (
    <div className="app-container">
      {view === 'landing' ? (
         <LandingPage onStart={handleStart} />
      ) : view === 'template' ? (
        <TemplatePage onSelect={handleSelectTemplate} onContinue={() => setView('builder')} selected={template} />
      ) : (
        <BuilderPage
          template={template}
          onChangeTemplate={(id) => id ? handleSelectTemplate(id) : setView('template')}
          unlocked={unlocked}
          user={user}
          onSignOut={handleSignOut}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  )
}
