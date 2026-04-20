
import React, { useState, useRef, useEffect } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import { generatePDF } from '../utils/pdfExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { loadDraft, saveDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import { syncResumeToCloud } from '../services/supabaseClient'
import TemplateModal from '../components/TemplateModal.jsx'
import '../styles/builder.css'

export default function BuilderPage({ template, onChangeTemplate, unlocked, user, onSignOut, theme, setTheme }) {
   const [resumeData, setResumeData] = useState(() => {
      const draft = loadDraft();
      if (!draft) return defaultResumeData;
      // Merge with defaults to ensure new fields like sectionOrder exist for legacy drafts
      return {
         ...defaultResumeData,
         ...draft,
         personal: { ...defaultResumeData.personal, ...draft.personal },
         theme: { ...defaultResumeData.theme, ...draft.theme },
         sectionOrder: draft.sectionOrder || defaultResumeData.sectionOrder,
         sectionLabels: { ...defaultResumeData.sectionLabels, ...(draft.sectionLabels || {}) }
      }
   })
   const [syncStatus, setSyncStatus] = useState('idle')
   const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
   const [mobileView, setMobileView] = useState('form') // 'form' | 'preview'
   const { toasts, showToast } = useToast()

   const panelRef = useRef(null)
   const wrapperRef = useRef(null)

   // ── Auto-save logic ──
   const handleCloudSave = async () => {
      if (!user) {
         showToast('Create an account to save to the cloud.', 'info')
         return
      }
      setSyncStatus('syncing')
      try {
         await syncResumeToCloud(user.id, resumeData, unlocked)
         setSyncStatus('success')
         showToast('Saved to cloud.', 'success')
         setTimeout(() => setSyncStatus('idle'), 2000)
      } catch (err) {
         setSyncStatus('error')
         showToast(err.message, 'error')
      }
   }

   // Scale the 210mm paper to fit the available panel width
   useEffect(() => {
      function scaleToFit() {
         if (!panelRef.current || !wrapperRef.current) return
         const panelW = panelRef.current.clientWidth - (window.innerWidth <= 768 ? 16 : 32)
         const paperW = wrapperRef.current.offsetWidth     // 210mm in px
         const scale = Math.min(1, panelW / paperW)
         wrapperRef.current.style.transform = `scale(${scale})`
         wrapperRef.current.style.transformOrigin = 'top center'
         // Prevent ghost scrollbars by explicitly sizing the invisible wrapper div
         wrapperRef.current.parentElement.style.height = `${scale * wrapperRef.current.offsetHeight}px`
      }
      scaleToFit()
      const ro = new ResizeObserver(scaleToFit)
      if (panelRef.current) ro.observe(panelRef.current)
      return () => ro.disconnect()
   }, [mobileView])

   // Textarea auto-resize handler
   useEffect(() => {
      const handleInput = (e) => {
         if (e.target.tagName === 'TEXTAREA') {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
         }
      }
      // trigger resize on all existing textareas on mount
      document.querySelectorAll('textarea').forEach(t => {
         t.style.height = 'auto';
         t.style.height = t.scrollHeight + 'px';
      })
      
      document.addEventListener('input', handleInput);
      return () => document.removeEventListener('input', handleInput);
   }, [resumeData])

   const handleDataChange = (newData) => {
      const nextData = typeof newData === 'function' ? newData(resumeData) : newData
      setResumeData(nextData)
      saveDraft(nextData)
   }

   return (
      <div className="builder-layout">
         {/* Navigation Header */}
         <header className="builder-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div className="builder-header__logo">Resum<span>e</span>ly</div>
               <button 
                  className="theme-toggle" 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  title="Toggle Light/Dark Mode"
               >
                  {theme === 'light' ? (
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  ) : (
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  )}
               </button>
            </div>

            <div className="builder-header__actions">
               {user && (
                 <>
                   <button className="btn btn-ghost" style={{ color: '#ff4d4d' }} onClick={onSignOut}>
                      Sign Out
                   </button>
                   {syncStatus === 'success' && (
                     <button className="btn btn-ghost" onClick={() => {
                       navigator.clipboard.writeText(window.location.href);
                       showToast('Link copied to clipboard', 'success');
                     }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        Copy Link
                     </button>
                   )}
                 </>
               )}
               <button className="btn btn-ghost" onClick={() => setIsTemplateModalOpen(true)}>Template</button>

               <button
                  className="btn btn-ghost"
                  onClick={handleCloudSave}
                  disabled={syncStatus === 'syncing'}
                  style={syncStatus === 'success' ? { color: '#769C89', fontWeight: 'bold' } : {}}
               >
                  {syncStatus === 'syncing' ? 'Saving...' : (syncStatus === 'success' ? '✓ Saved' : 'Save to Cloud')}
               </button>

               <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', padding: '0 12px', height: '36px', borderRight: 'none' }}>
                 <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'capitalize' }}>
                   {template} <span style={{display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: resumeData.theme?.accentColor || '#C4622D', marginLeft: '6px'}}></span>
                 </span>
               </div>
               <button className="btn btn-secondary" style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', MozBorderRadiusLeftbottom: 0, MozBorderRadiusLefttop: 0 }} onClick={() => {
                 showToast('Generating PDF...', 'info');
                 // Create skeleton state
                 const wrapper = wrapperRef.current;
                 if (wrapper) wrapper.style.filter = 'blur(4px) grayscale(1)';
                 setTimeout(() => {
                    generatePDF(null, resumeData, template).finally(() => {
                       if (wrapper) wrapper.style.filter = 'none';
                    });
                 }, 400); // give UI time to blur before freezing thread
               }}>
                  Download
               </button>
            </div>
         </header>

         {/* Mobile Tab Switcher */}
         <div className="mobile-tabs">
            <button 
               className={`mobile-tab ${mobileView === 'form' ? 'active' : ''}`}
               onClick={() => setMobileView('form')}
            >
               Edit Form
            </button>
            <button 
               className={`mobile-tab ${mobileView === 'preview' ? 'active' : ''}`}
               onClick={() => setMobileView('preview')}
            >
               View Resume
            </button>
         </div>

         {/* Left Side: Form */}
         <aside className={`form-panel ${mobileView === 'form' ? 'mobile-visible' : 'mobile-hidden'}`}>
            {/* Non-scrolling blob layer — stays fixed over panel viewport */}
            <div className="form-blob-layer" aria-hidden="true">
               <div className="form-blob form-blob--1"></div>
               <div className="form-blob form-blob--2"></div>
               <div className="form-blob form-blob--3"></div>
               <div className="form-blob form-blob--4"></div>
               <div className="form-blob form-blob--5"></div>
               <div className="form-blob form-blob--6"></div>
            </div>
            {/* Scrollable content on top */}
            <div className="form-content">
               <ResumeForm data={resumeData} onChange={handleDataChange} onToast={showToast} />
            </div>
         </aside>

         {/* Right Side: Preview */}
         <main className={`preview-panel ${mobileView === 'preview' ? 'mobile-visible' : 'mobile-hidden'}`} ref={panelRef}>
            <div className="resume-scale-container" style={{ overflow: 'hidden' }}>
               <div className="resume-preview-wrapper" ref={wrapperRef} style={{ transition: 'filter 0.3s ease' }}>
                  <ResumePreview data={resumeData} template={template} />
               </div>
            </div>
         </main>

         <ToastContainer toasts={toasts} />
         <TemplateModal 
            isOpen={isTemplateModalOpen} 
            onClose={() => setIsTemplateModalOpen(false)} 
            currentTemplate={template} 
            onSelectTemplate={onChangeTemplate} 
         />
      </div>
   )
}

function MoonIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}

function SunIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
}
