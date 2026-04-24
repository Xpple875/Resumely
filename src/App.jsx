import React, { useState, useEffect } from 'react'
import BuilderPage from './pages/BuilderPage'
import TemplatePage from './pages/TemplatePage'
import LandingPage from './pages/LandingPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import DashboardPage from './pages/DashboardPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import UpdatePasswordModal from './components/UpdatePasswordModal'
import { isUnlocked, clearToken } from './services/paymentService'
import { supabase } from './services/supabaseClient'
import { loadDraft } from './hooks/useAutosave'

export default function App() {
  const [view, setView] = useState('landing')
  const [template, setTemplate] = useState('classic')
  // Initial unlocked = local token check (for non-logged-in users who paid anonymously).
  // When a user logs in, BuilderPage logic or App logic can override this.
  const [unlocked, setUnlocked] = useState(isUnlocked())
  const [user, setUser] = useState(null)
  
  // Dashboard routing requires us to supply an active document ID to the builder
  const [activeDocumentId, setActiveDocumentId] = useState(null)
  const [showUpdatePassword, setShowUpdatePassword] = useState(false)

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for login/logout events from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
         setShowUpdatePassword(true)
      }
    })

    // Also manually check hash for OAuth/Recovery flow
    if (window.location.hash.includes('type=recovery')) {
       setShowUpdatePassword(true)
    }

    return () => subscription.unsubscribe()
  }, [])

  const handleStart = (explicitUser = null) => {
    const activeUser = explicitUser && explicitUser.id ? explicitUser : user;
    if (activeUser) {
       setView('dashboard')
    } else {
       if (loadDraft()) setView('builder')
       else setView('template')
    }
  }

  const handleSelectTemplate = (id) => {
    setTemplate(id)
    setView('builder')
  }

  const handleOpenDocument = (docId) => {
    setActiveDocumentId(docId)
    setView('builder') // Enter builder for this specific document
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearToken()
    localStorage.removeItem('resume_draft')
    setUnlocked(false)
    setUser(null)
    window.location.reload()
  }

  const handleSignIn = (newUser) => {
    setUser(newUser)
  }

  const params = new URLSearchParams(window.location.search)
  const shareId = params.get('share')
  
  // If we have a share ID and no user, we force the builder view to show the public resume
  useEffect(() => {
     if (shareId && !activeDocumentId) {
        setActiveDocumentId(shareId)
        setView('builder')
     }
  }, [shareId, activeDocumentId])

  if (params.get('payment') === 'success' && !unlocked) {
    return (
      <PaymentSuccessPage
        sessionId={params.get('session_id')}
        user={user}
        onUnlocked={() => { setUnlocked(true); setView('builder'); }}
      />
    )
  }

  return (
    <div className="app-container">
      {view === 'landing' ? (
        <LandingPage 
          onStart={handleStart} 
          user={user} 
          onSignIn={handleSignIn} 
          onShowTerms={() => setView('terms')}
          onShowPrivacy={() => setView('privacy')}
        />
      ) : view === 'template' ? (
        <TemplatePage onSelect={handleSelectTemplate} onContinue={() => setView('builder')} selected={template} />
      ) : view === 'dashboard' ? (
        <DashboardPage 
           user={user} 
           onOpenDocument={handleOpenDocument} 
           onSignOut={handleSignOut} 
        />
      ) : view === 'terms' ? (
        <TermsPage onBack={() => setView('landing')} />
      ) : view === 'privacy' ? (
        <PrivacyPage onBack={() => setView('landing')} />
      ) : (
        <BuilderPage
          template={template}
          onChangeTemplate={(id) => id ? handleSelectTemplate(id) : setView('template')}
          unlocked={unlocked}
          setUnlocked={setUnlocked}
          user={user}
          activeDocumentId={activeDocumentId}
          isPublicView={!!shareId}
          onDocumentCreated={setActiveDocumentId}
          onReturnToDashboard={() => setView('dashboard')}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
          theme={theme}
          setTheme={setTheme}
        />
      )}

      {showUpdatePassword && (
        <UpdatePasswordModal 
          onDismiss={() => {
             setShowUpdatePassword(false)
             window.location.hash = '' 
          }} 
        />
      )}
    </div>
  )
}
