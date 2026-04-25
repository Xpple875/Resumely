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
import { loadDraft } from './hooks/useAutosave'
import { createDocument, supabase } from './services/supabaseClient'
import { defaultResumeData } from './utils/defaultData'

export default function App() {
   const [view, setView] = useState(() => localStorage.getItem('resumely_view') || 'landing')
   const [template, setTemplate] = useState('classic')
   // Initial unlocked = local token check (for non-logged-in users who paid anonymously).
   // When a user logs in, BuilderPage logic or App logic can override this.
   const [unlocked, setUnlocked] = useState(isUnlocked())
   const [user, setUser] = useState(null)

   // Dashboard routing requires us to supply an active document ID to the builder
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
   }, [view, activeDocumentId])

   useEffect(() => {
      // Check for existing session on mount
      supabase.auth.getSession().then(({ data: { session } }) => {
         setUser(session?.user ?? null)
      })

      // Handle direct URL routing for Privacy/Terms
      const path = window.location.pathname
      if (path === '/privacy') setView('privacy')
      else if (path === '/terms') setView('terms')

      // Listen for login/logout events from Supabase
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
         setUser(session?.user ?? null)
         if (event === 'SIGNED_IN' && session?.user) {
            // Only redirect to dashboard if we're on landing page. 
            // This allows builder/template views to persist on refresh.
            setView(prev => (prev === 'landing' || !prev) ? 'dashboard' : prev)
         }

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
   }

   const handleTemplateContinue = async () => {
      if (isCreatingFromDashboard && user) {
         setIsCreatingInCloud(true)
         try {
            const dataToSave = importData || defaultResumeData
            const nameToSave = importName || "Untitled Resume"
            const newId = await createDocument(user.id, nameToSave, dataToSave, template)
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
      setTemplate('classic') // Reset to default while loading new doc
      setActiveDocumentId(docId)
      setView('builder') // Enter builder for this specific document
   }

   const handleSignOut = async () => {
      await supabase.auth.signOut()
      clearToken()
      localStorage.removeItem('resume_draft')
      setUnlocked(false)
      setUser(null)
      setActiveDocumentId(null)
      setView('landing')
      // Removed window.location.reload() to allow a smooth state-based transition
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
            <TemplatePage
               onSelect={handleSelectTemplate}
               onContinue={handleTemplateContinue}
               selected={template}
               loading={isCreatingInCloud}
               onGoToLanding={() => setView('landing')}
            />
         ) : view === 'dashboard' ? (
            <DashboardPage
               user={user}
               onOpenDocument={handleOpenDocument}
               onSignOut={handleSignOut}
               onCreateNew={handleCreateNewFromDashboard}
               onImportComplete={handleImportComplete}
               onGoToLanding={() => setView('landing')}
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
               onGoToLanding={() => setView('landing')}
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
