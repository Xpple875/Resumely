
import React, { useState, useRef, useEffect } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import PayGateModal from '../components/PayGateModal.jsx'
import DownloadOptionsModal from '../components/DownloadOptionsModal.jsx'
import AuthModal from '../components/AuthModal.jsx'
import { generatePDF } from '../utils/pdfExport.js'
import { generateDOCX } from '../utils/docxExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { loadDraft, saveDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import { getDocumentById, createDocument, updateDocument, loadResumeFromCloud, markUserAsPaid, deleteUserAccount, incrementViewCount } from '../services/supabaseClient'
import TemplateModal from '../components/TemplateModal.jsx'
import '../styles/builder.css'

/** Merge cloud resume_data with defaults to handle new fields added since last save. */
function mergeWithDefaults(cloudData) {
   return {
      ...defaultResumeData,
      ...cloudData,
      personal: { ...defaultResumeData.personal, ...(cloudData?.personal || {}) },
      theme: { ...defaultResumeData.theme, ...(cloudData?.theme || {}) },
      sectionOrder: cloudData?.sectionOrder || defaultResumeData.sectionOrder,
      sectionLabels: { ...defaultResumeData.sectionLabels, ...(cloudData?.sectionLabels || {}) }
   }
}

export default function BuilderPage({ template, onChangeTemplate, unlocked, setUnlocked, user, onSignOut, onSignIn, theme, setTheme, activeDocumentId, isPublicView, onDocumentCreated, onReturnToDashboard }) {
   const [resumeData, setResumeData] = useState(() => {
      const draft = loadDraft()
      if (!draft) return defaultResumeData
      return mergeWithDefaults(draft)
   })

   const [syncStatus, setSyncStatus] = useState('idle')
   const [isCloudLoading, setIsCloudLoading] = useState(false)
   const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
   const [showPayGate, setShowPayGate] = useState(false)
   const [showDownloadOptions, setShowDownloadOptions] = useState(false)
   const [showAuthModal, setShowAuthModal] = useState(false)
   // What was the user trying to do when they weren't signed in?
   const [pendingAction, setPendingAction] = useState(null) // null | 'save' | 'download'
   const [mobileView, setMobileView] = useState('form')
   const [documentName, setDocumentName] = useState('Untitled Resume')
   const [showRenameModal, setShowRenameModal] = useState(false)
   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
   const [isProfileOpen, setIsProfileOpen] = useState(false)
   const [isPublicSharing, setIsPublicSharing] = useState(false)
   const { toasts, showToast } = useToast()

   const panelRef = useRef(null)
   const wrapperRef = useRef(null)
   // Prevents auto-load from firing when we intentionally skip it (e.g. during a save)
   const cloudLoadAttempted = useRef(false)

   // ── Auto-load resume from cloud when a session is detected on mount ──
   useEffect(() => {
      if ((!user?.id && !activeDocumentId) || cloudLoadAttempted.current) return
      cloudLoadAttempted.current = true
      setIsCloudLoading(true)

      if (user?.id) {
         loadResumeFromCloud(user.id).then(profile => {
            if (profile?.is_paid === true && setUnlocked) setUnlocked(true)
         }).catch(err => console.error("Profile load failed", err))
      }

      // Only attempt to hydrate specific document if we were routed one explicitly
      if (activeDocumentId) {
         getDocumentById(activeDocumentId).then(doc => {
            if (doc?.resume_data) {
               const merged = mergeWithDefaults(doc.resume_data)
               setResumeData(merged)
               setDocumentName(doc.name || 'Untitled Resume')
               setIsPublicSharing(!!doc.is_public)
               saveDraft(merged)
               showToast('Document loaded ✓', 'success')
            }
         }).catch(err => console.error("Doc load failed", err))
         .finally(() => setIsCloudLoading(false))
      } else {
         setIsCloudLoading(false)
      }

      // ── Analytics ──
      if (isPublicView && activeDocumentId) {
         incrementViewCount(activeDocumentId).catch(e => console.error("Analytics failed:", e))
      }
   }, [user?.id, activeDocumentId, isPublicView]) // eslint-disable-line react-hooks/exhaustive-deps

   // ── Actual PDF generation ──
   const doDownload = () => {
      setIsGeneratingPDF(true)
      const wrapper = wrapperRef.current
      if (wrapper) wrapper.style.filter = 'blur(10px) grayscale(1)'
      
      setTimeout(() => {
         generatePDF(null, resumeData, template).finally(() => {
            if (wrapper) wrapper.style.filter = 'none'
            setIsGeneratingPDF(false)
         })
      }, 800) // Slightly longer to feel deliberate and premium
   }

   const doDownloadDocx = () => {
      generateDOCX(resumeData)
   }

   const handleDownload = () => {
      if (!user) {
         setPendingAction('download')
         setShowAuthModal(true)
         return
      }
      setShowDownloadOptions(true)
   }

   const handleDownloadAction = (format) => {
      setShowDownloadOptions(false)
      if (format === 'pdf') {
         doDownload()
      } else {
         doDownloadDocx()
      }
   }



   // ── Cloud Save ──
   const doCloudSave = async (currentUser, silent = false) => {
      setSyncStatus('syncing')
      try {
         if (activeDocumentId) {
            await updateDocument(activeDocumentId, documentName, resumeData, isPublicSharing)
         } else {
            const newId = await createDocument(currentUser.id, documentName, resumeData)
            if (onDocumentCreated) onDocumentCreated(newId)
         }
         setSyncStatus('success')
         if (!silent) showToast('Saved to cloud.', 'success')
         setTimeout(() => setSyncStatus('idle'), 2000)
      } catch (err) {
         setSyncStatus('error')
         if (!silent) showToast(err.message, 'error')
      }
   }

   const handleCloudSave = async () => {
      if (!user) {
         setPendingAction('save')
         setShowAuthModal(true)
         return
      }
      await doCloudSave(user)
   }

   // ── Auth modal success — handles both pending actions ──
   const handleAuthSuccess = async (newUser) => {
      setShowAuthModal(false)
      cloudLoadAttempted.current = true
      if (onSignIn) onSignIn(newUser)

      const action = pendingAction
      setPendingAction(null)

      // 1. Universal Guest Sync: If no cloud doc ID, save local work to account
      if (!activeDocumentId && newUser) {
         try {
            const newId = await createDocument(newUser.id, documentName, resumeData)
            if (onDocumentCreated) onDocumentCreated(newId)
            localStorage.removeItem('resume_draft')
            showToast('Guest draft synced to account ✓', 'success')
         } catch(e) {
            console.error("Auto-sync failed:", e)
         }
      }

      // 2. Handle specific button action
      if (action === 'save') {
         await doCloudSave(newUser)
      } else if (action === 'download') {
         setIsCloudLoading(true)
         try {
            const profile = await loadResumeFromCloud(newUser.id)
            if (profile?.is_paid) {
               if (setUnlocked) setUnlocked(true)
               doDownload()
            } else {
               setShowDownloadOptions(true)
            }
         } catch (err) {
            console.error('Could not check paid status:', err)
            setShowDownloadOptions(true)
         } finally {
            setIsCloudLoading(false)
         }
      }
   }

   // Scale the 210mm paper to fit the available panel width
   useEffect(() => {
      function scaleToFit() {
         if (!panelRef.current || !wrapperRef.current) return
         const panelW = panelRef.current.clientWidth - (window.innerWidth <= 768 ? 16 : 32)
         const paperW = wrapperRef.current.offsetWidth
         if (paperW === 0) return // Avoid division by zero
         
         const scale = Math.min(1, panelW / paperW)
         wrapperRef.current.style.transform = `scale(${scale})`
         wrapperRef.current.style.transformOrigin = 'top center'
         wrapperRef.current.parentElement.style.height = `${scale * wrapperRef.current.offsetHeight}px`
      }

      // Initial scale
      setTimeout(scaleToFit, 100)
      
      const ro = new ResizeObserver(scaleToFit)
      if (panelRef.current) ro.observe(panelRef.current)
      window.addEventListener('resize', scaleToFit)
      
      return () => {
         ro.disconnect()
         window.removeEventListener('resize', scaleToFit)
      }
   }, [mobileView, user, resumeData])

   // Textarea auto-resize
   useEffect(() => {
      const handleInput = (e) => {
         if (e.target.tagName === 'TEXTAREA') {
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
         }
      }
      document.querySelectorAll('textarea').forEach(t => {
         t.style.height = 'auto'
         t.style.height = t.scrollHeight + 'px'
      })
      document.addEventListener('input', handleInput)
      return () => document.removeEventListener('input', handleInput)
   }, [resumeData])

   const handleDataChange = (newData) => {
      const nextData = typeof newData === 'function' ? newData(resumeData) : newData
      setResumeData(nextData)
      saveDraft(nextData)
   }

   // ── Auto-save Effect ──
   useEffect(() => {
      if (!user?.id || !activeDocumentId || syncStatus === 'syncing') return
      
      const timer = setTimeout(() => {
         doCloudSave(user, true) // Silent save
      }, 5000) // 5 second debounce

      return () => clearTimeout(timer)
   }, [resumeData, isPublicSharing, user?.id, activeDocumentId])

   return (
      <div className="builder-layout">
         <header className="builder-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <div className="builder-header__logo">Resum<span>ely</span></div>

               <button
                  className="theme-toggle"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  title="Toggle Light/Dark Mode"
               >
                  {theme === 'light' ? (
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  ) : (
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  )}
               </button>

               {user && (
                  <div style={{ position: 'relative' }}>
                     <button
                        className="theme-toggle"
                        style={{ borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 'bold', fontSize: '11px', width: '30px', height: '30px', padding: 0 }}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        title={`Account (${user.email})`}
                     >
                        {user.email?.[0].toUpperCase()}
                     </button>

                     {isProfileOpen && (
                        <div style={{
                           position: 'absolute',
                           top: '120%',
                           left: '0',
                           background: 'var(--glass-bg)',
                           backdropFilter: 'blur(16px)',
                           border: '1px solid var(--glass-border)',
                           borderRadius: 'var(--radius-md)',
                           boxShadow: 'var(--shadow-lg)',
                           padding: '12px',
                           minWidth: '220px',
                           zIndex: 1000,
                           animation: 'toastIn 0.2s ease'
                        }}>
                           <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '10px', padding: '0 8px' }}>{user.email}</div>
                           
                           <button 
                              className="btn btn-ghost" 
                              style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '8px' }}
                              onClick={() => { setIsProfileOpen(false); window.location.hash = 'type=recovery'; }}
                           >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"/></svg>
                              Change Password
                           </button>

                           <button 
                              className="btn btn-ghost" 
                              style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '8px', color: '#e74c3c' }}
                              onClick={async () => {
                                 if (window.confirm("CRITICAL: This will permanently delete your account and ALL your resumes. This cannot be undone. Are you absolutely sure?")) {
                                    setIsProfileOpen(false)
                                    showToast('Deleting account...', 'info')
                                    try {
                                       await deleteUserAccount(user.id)
                                       onSignOut() // Triggers navigation cleanup
                                    } catch (err) {
                                       console.error("Delete failed", err)
                                       showToast('Error deleting account.', 'error')
                                    }
                                 }
                              }}
                           >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              Delete Account
                           </button>

                           <div style={{ borderTop: '1px solid var(--glass-border)', margin: '8px 0' }}></div>

                           <button 
                              className="btn btn-ghost" 
                              style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '8px' }}
                              onClick={onSignOut}
                           >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                              Sign Out
                           </button>
                        </div>
                     )}
                  </div>
               )}

               {isCloudLoading && (
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                     Loading…
                  </span>
               )}

               {user && (
                 <div className="resume-name-badge" onClick={() => setShowRenameModal(true)} style={{ 
                    marginLeft: '15px', 
                    padding: '4px 12px', 
                    background: 'var(--glass-surface)', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-mid)',
                    transition: 'var(--transition)'
                 }}>
                    <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{documentName}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                 </div>
               )}
            </div>

            <div className="builder-header__actions">
               {activeDocumentId && user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px', paddingRight: '15px', borderRight: '1px solid var(--glass-border)' }}>
                     <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 500 }}>
                        {isPublicSharing ? 'Public Link ON' : 'Private'}
                     </span>
                     <button 
                        onClick={async () => {
                           const newVal = !isPublicSharing
                           setIsPublicSharing(newVal)
                           if (activeDocumentId) {
                              try {
                                 // We use undefined so the database knows NOT to touch those columns
                                 await updateDocument(activeDocumentId, undefined, undefined, newVal)
                                 showToast(newVal ? 'Resume is now public' : 'Resume is now private', 'info')
                              } catch(e) { 
                                 console.error("Toggle failed:", e) 
                                 setIsPublicSharing(!newVal)
                                 showToast(`Failed: ${e.message || 'Database error'}`, 'error')
                              }
                           }
                        }}
                        style={{
                           width: '32px',
                           height: '18px',
                           borderRadius: '10px',
                           background: isPublicSharing ? 'var(--accent)' : 'var(--border)',
                           border: '1px solid var(--glass-border)',
                           position: 'relative',
                           cursor: 'pointer',
                           transition: 'all 0.3s ease'
                        }}
                     >
                        <div style={{
                           width: '12px',
                           height: '12px',
                           borderRadius: '50%',
                           background: '#fff',
                           position: 'absolute',
                           top: '2px',
                           left: isPublicSharing ? '16px' : '2px',
                           transition: 'all 0.3s ease'
                        }} />
                     </button>
                  </div>
               )}

               {activeDocumentId && user && (
                  <button className="btn btn-ghost" onClick={() => {
                     const url = `${window.location.origin}${window.location.pathname}?share=${activeDocumentId}`
                     navigator.clipboard.writeText(url)
                     showToast('Public link copied!', 'success')
                  }}>
                     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                     Copy Link
                  </button>
               )}

               {user && (
                  <button className="btn btn-ghost" onClick={onReturnToDashboard}>
                     Dashboard
                  </button>
               )}

               <button className="btn btn-ghost" onClick={() => setIsTemplateModalOpen(true)}>Template</button>

               <button
                  className="btn btn-ghost"
                  onClick={handleCloudSave}
                  disabled={syncStatus === 'syncing'}
                  style={syncStatus === 'success' ? { color: 'var(--text-light)', opacity: 0.8, fontSize: '0.8rem' } : {}}
               >
                  {syncStatus === 'syncing' ? (
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1.5s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                       Saving…
                     </span>
                  ) : syncStatus === 'success' ? (
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Saved
                     </span>
                  ) : 'Save Changes'}
               </button>

               {user && (
                  <button
                     className="btn btn-secondary"
                     onClick={handleDownload}
                  >
                     {unlocked ? 'Download' : '🔒 Download'}
                  </button>
               )}

               {!user && activeDocumentId && (
                  <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
                     Create My Own
                  </button>
               )}
            </div>
         </header>

         {user && (
            <div className="mobile-tabs">
               <button className={`mobile-tab ${mobileView==='form'?'active':''}`} onClick={() => setMobileView('form')}>Edit Form</button>
               <button className={`mobile-tab ${mobileView==='preview'?'active':''}`} onClick={() => setMobileView('preview')}>View Resume</button>
            </div>
         )}

         <aside className={`form-panel ${mobileView==='form'?'mobile-visible':'mobile-hidden'} ${!user ? 'hidden-viewer' : ''}`}>
            <div className="form-blob-layer" aria-hidden="true">
               {[1,2,3,4,5,6].map(n => <div key={n} className={`form-blob form-blob--${n}`}/>)}
            </div>
            <div className="form-content">
               <ResumeForm data={resumeData} onChange={handleDataChange} onToast={showToast} />
            </div>
         </aside>

         <main className={`preview-panel ${mobileView==='preview'?'mobile-visible':'mobile-hidden'} ${!user ? 'full-width-viewer' : ''}`} ref={panelRef}>
            <div className="resume-scale-container" style={{ overflow: 'hidden' }}>
               <div className="resume-preview-wrapper" ref={wrapperRef} style={{ transition: 'filter 0.3s ease', position: 'relative' }}>
                  <ResumePreview data={resumeData} template={template} />
                  
                  {/* Watermark overlay to prevent screenshots - Infinite SVG Pattern */}
                  <div 
                     aria-hidden="true"
                     style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 1000,
                        userSelect: 'none',
                        opacity: 1,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' font-family='sans-serif' font-weight='900' font-size='32' fill='rgba(0,0,0,0.07)' transform='rotate(-35 150 100)'%3ERESUMELY RESUMELY RESUMELY%3C/text%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '300px 200px'
                     }}
                  />
               </div>
            </div>
         </main>

         <ToastContainer toasts={toasts} />
         <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} currentTemplate={template} onSelectTemplate={onChangeTemplate} />

         {showPayGate && <PayGateModal onDismiss={() => setShowPayGate(false)} />}
         {showDownloadOptions && (
            <DownloadOptionsModal 
               onDismiss={() => setShowDownloadOptions(false)} 
               onDownload={handleDownloadAction}
               unlocked={unlocked}
               userId={user?.id}
            />
         )}

         {showAuthModal && (
            <AuthModal
               onDismiss={() => { setShowAuthModal(false); setPendingAction(null) }}
               onSuccess={handleAuthSuccess}
               // Context message shown inside the modal depends on what triggered it
               context={pendingAction === 'download' ? 'download' : 'save'}
            />
         )}

         {/* PDF Generation Overlay */}
         {isGeneratingPDF && (
            <div style={{
               position: 'fixed',
               inset: 0,
               background: 'rgba(255,255,255,0.1)',
               backdropFilter: 'blur(4px)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 10000,
               color: 'var(--text)',
               animation: 'pFadeUp 0.3s ease'
            }}>
               <div style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)',
                  padding: '40px 60px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  textAlign: 'center'
               }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'floatMockup 2s ease-in-out infinite' }}>📄</div>
                  <h2 style={{ marginBottom: '10px' }}>Generating PDF</h2>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Tailoring your resume for perfection...</p>
               </div>
            </div>
         )}

         {/* Rename Modal */}
         {showRenameModal && (
            <div className="modal-overlay" style={{ zIndex: 2000 }}>
               <div className="modal-content" style={{ maxWidth: '360px', padding: '30px' }}>
                  <h3 style={{ marginBottom: '15px' }}>Rename Resume</h3>
                  <input 
                     type="text" 
                     value={documentName} 
                     onChange={e => setDocumentName(e.target.value)}
                     placeholder="Enter resume name..."
                     autoFocus
                     style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--text)',
                        marginBottom: '20px',
                        fontSize: '0.95rem'
                     }}
                     onKeyDown={e => {
                        if (e.key === 'Enter') setShowRenameModal(false)
                     }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                     <button className="btn btn-ghost" onClick={() => setShowRenameModal(false)}>Cancel</button>
                     <button className="btn btn-primary" onClick={() => setShowRenameModal(false)}>Done</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
