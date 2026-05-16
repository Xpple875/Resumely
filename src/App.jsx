import React, { useState, useEffect, Suspense, lazy } from 'react'
import UpdatePasswordModal from './components/UpdatePasswordModal'
import { isUnlocked, clearToken } from './services/paymentService'
import { loadDraft } from './hooks/useAutosave'
import { createDocument, supabase } from './services/supabaseClient'

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const BuilderPage = lazy(() => import('./pages/BuilderPage'))
const TemplatePage = lazy(() => import('./pages/TemplatePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))

// Shared loading state for Suspense
function PageLoader() {
   return (
      <div style={{
         height: '100vh',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         background: 'var(--bg)',
         color: 'var(--text)'
      }}>
         <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--accent-soft)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
         }}></div>
         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
   )
}

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function App() {
   const [delayedLoad, setDelayedLoad] = useState(false)
   
   useEffect(() => {
      // Delay non-critical analytics to reduce TBT
      const timer = setTimeout(() => setDelayedLoad(true), 2000)
      return () => clearTimeout(timer)
   }, [])

   const getInitialView = () => {
      const path = window.location.pathname
      if (path === '/dashboard') return 'dashboard'
      if (path === '/builder') return 'builder'
      if (path === '/templates') return 'template'
      if (path === '/privacy') return 'privacy'
      if (path === '/terms') return 'terms'
      return localStorage.getItem('resumely_view') || 'landing'
   }

   const [view, setView] = useState(getInitialView)
   const [template, setTemplate] = useState(() => {
      const draft = loadDraft()
      return draft?.template || 'classic'
   })
   const [unlocked, setUnlocked] = useState(isUnlocked())
   const [user, setUser] = useState(null)
   const [activeDocumentId, setActiveDocumentId] = useState(() => localStorage.getItem('resumely_active_doc'))
   const [showUpdatePassword, setShowUpdatePassword] = useState(false)
   const [isCreatingFromDashboard, setIsCreatingFromDashboard] = useState(false)
   const [isCreatingInCloud, setIsCreatingInCloud] = useState(false)
   const [importData, setImportData] = useState(null)
   const [importName, setImportName] = useState('')
   const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

   useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
   }, [theme])

   useEffect(() => {
      localStorage.setItem('resumely_view', view)
      if (activeDocumentId) {
         localStorage.setItem('resumely_active_doc', activeDocumentId)
      } else {
         localStorage.removeItem('resumely_active_doc')
      }

      const viewToPath = {
         'landing': '/',
         'dashboard': '/dashboard',
         'builder': '/builder',
         'template': '/templates',
         'privacy': '/privacy',
         'terms': '/terms'
      }

      const newPath = viewToPath[view] || '/'
      if (window.location.pathname !== newPath) {
         window.history.pushState({ view }, '', newPath)
      }

      if (view !== 'landing' && window.location.hash) {
         window.history.replaceState({ view }, '', window.location.pathname + window.location.search)
      }
   }, [view, activeDocumentId])

   useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
         setUser(session?.user ?? null)
      })

      const path = window.location.pathname
      if (path === '/privacy') setView('privacy')
      else if (path === '/terms') setView('terms')
      else if (path === '/dashboard') setView('dashboard')
      else if (path === '/builder') setView('builder')
      else if (path === '/templates') setView('template')

      const handlePopState = (event) => {
         if (event.state && event.state.view) {
            setView(event.state.view)
         } else {
            const p = window.location.pathname
            if (p === '/') setView('landing')
            else if (p === '/dashboard') setView('dashboard')
            else if (p === '/builder') setView('builder')
            else if (p === '/templates') setView('template')
            else if (p === '/privacy') setView('privacy')
            else if (p === '/terms') setView('terms')
         }
      }

      window.addEventListener('popstate', handlePopState)

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
         setUser(session?.user ?? null)
         if (event === 'SIGNED_IN' && session?.user) {
            setView(prev => (prev === 'landing' || !prev) ? 'dashboard' : prev)
         }
         if (event === 'PASSWORD_RECOVERY') {
            setShowUpdatePassword(true)
         }
      })

      if (window.location.hash.includes('type=recovery')) {
         setShowUpdatePassword(true)
      }

      return () => {
         window.removeEventListener('popstate', handlePopState)
         subscription.unsubscribe()
      }
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

   const handleSelectTemplate = (id, immediate = false) => {
      setTemplate(id)
      if (immediate) {
         handleTemplateContinue(id)
      }
   }

   const handleTemplateContinue = async (overrideId = null) => {
      // Ensure we don't accidentally use a React event object as a template ID
      const activeTemplate = (typeof overrideId === 'string') ? overrideId : template
      if (isCreatingFromDashboard && user) {
         setIsCreatingInCloud(true)
         try {
            const { defaultResumeData } = await import('./utils/defaultData')
            const dataToSave = importData || defaultResumeData
            const nameToSave = importName || "Untitled Resume"
            const newId = await createDocument(user.id, nameToSave, dataToSave, activeTemplate)
            setActiveDocumentId(newId)
            setIsCreatingFromDashboard(false)
            setImportData(null)
            setImportName('')
            setView('builder')
         } catch (err) {
            console.error("Failed to create doc:", err)
            alert("Error creating resume. Please try again.")
         } finally {
            setIsCreatingInCloud(false)
         }
      } else {
         setView('builder')
      }
   }

   const handleImportComplete = (data, name) => {
      setImportData(data)
      setImportName(name)
      setIsCreatingFromDashboard(true)
      setView('template')
   }

   const handleCreateNewFromDashboard = () => {
      setIsCreatingFromDashboard(true)
      setView('template')
   }

   const handleOpenDocument = (docId) => {
      setTemplate('classic')
      setActiveDocumentId(docId)
      setView('builder')
   }

   const handleSignOut = async () => {
      await supabase.auth.signOut()
      clearToken()
      localStorage.removeItem('resume_draft')
      setUnlocked(false)
      setUser(null)
      setActiveDocumentId(null)
      setView('landing')
   }

   const handleSignIn = (newUser) => {
      setUser(newUser)
   }

   const params = new URLSearchParams(window.location.search)
   const shareId = params.get('share')

   useEffect(() => {
      if (shareId && !activeDocumentId) {
         setActiveDocumentId(shareId)
         setView('builder')
      }
   }, [shareId, activeDocumentId])

   if (params.get('payment') === 'success' && !unlocked) {
      return (
         <Suspense fallback={<PageLoader />}>
            <PaymentSuccessPage
               sessionId={params.get('session_id')}
               user={user}
               onUnlocked={() => { setUnlocked(true); setView('builder'); }}
            />
         </Suspense>
      )
   }

   return (
      <div className="app-container">
         <Suspense fallback={<PageLoader />}>
            {view === 'landing' ? (
               <LandingPage
                  onStart={handleStart}
                  user={user}
                  onSignIn={handleSignIn}
                  onShowTerms={() => setView('terms')}
                  onShowPrivacy={() => setView('privacy')}
                  theme={theme}
                  setTheme={setTheme}
               />
            ) : view === 'template' ? (
               <TemplatePage
                  onSelect={handleSelectTemplate}
                  onContinue={handleTemplateContinue}
                  selected={template}
                  loading={isCreatingInCloud}
                  onGoToLanding={() => setView('landing')}
                  theme={theme}
                  setTheme={setTheme}
               />
            ) : view === 'dashboard' ? (
               <DashboardPage
                  user={user}
                  onOpenDocument={handleOpenDocument}
                  onSignOut={handleSignOut}
                  onCreateNew={handleCreateNewFromDashboard}
                  onImportComplete={handleImportComplete}
                  onGoToLanding={() => setView('landing')}
                  theme={theme}
                  setTheme={setTheme}
               />
            ) : view === 'terms' ? (
               <TermsPage onBack={() => setView('landing')} theme={theme} setTheme={setTheme} />
            ) : view === 'privacy' ? (
               <PrivacyPage onBack={() => setView('landing')} theme={theme} setTheme={setTheme} />
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
                  onGoToLanding={() => setView('landing')}
                  onSignOut={handleSignOut}
                  onSignIn={handleSignIn}
                  theme={theme}
                  setTheme={setTheme}
               />
            )}
         </Suspense>

         {showUpdatePassword && (
            <UpdatePasswordModal
               onDismiss={() => {
                  setShowUpdatePassword(false)
                  window.location.hash = ''
               }}
            />
         )}

         {delayedLoad && (
            <>
               <Analytics />
               <SpeedInsights />
            </>
         )}
      </div>
   )
}
