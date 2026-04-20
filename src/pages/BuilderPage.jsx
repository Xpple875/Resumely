
import React, { useState, useRef, useEffect } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import { generatePDF } from '../utils/pdfExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { loadDraft, saveDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import { syncResumeToCloud } from '../services/supabaseClient'
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
   const { toasts, showToast } = useToast()

   const panelRef = useRef(null)
   const wrapperRef = useRef(null)

   // Scale the 210mm paper to fit the available panel width
   useEffect(() => {
      function scaleToFit() {
         if (!panelRef.current || !wrapperRef.current) return
         const panelW = panelRef.current.clientWidth - 32 // minus padding (16px each side)
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
   }, [])

   const handleDataChange = (newData) => {
      const nextData = typeof newData === 'function' ? newData(resumeData) : newData
      setResumeData(nextData)
      saveDraft(nextData)
      if (syncStatus === 'success') setSyncStatus('idle')
   }

   const handleCloudSave = async () => {
      if (!user) { showToast('Sign in to save to cloud', 'info'); return; }
      setSyncStatus('syncing')
      try {
         await syncResumeToCloud(user.id, resumeData, unlocked)
         setSyncStatus('success')
         showToast('Cloud sync successful', 'success')
         setTimeout(() => setSyncStatus('idle'), 3000)
      } catch (err) {
         setSyncStatus('idle')
         showToast('Cloud save failed', 'error')
      }
   }

   return (
      <div className="builder-layout">
         <header className="builder-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div className="builder-header__logo">Resum<span>e</span>ly</div>
               <button 
                  className="theme-toggle" 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  title="Toggle Light/Dark Mode"
               >
                  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
               </button>
            </div>

            <div className="builder-header__actions">
               {user && (
                  <button className="btn btn-ghost" style={{ color: '#ff4d4d' }} onClick={onSignOut}>
                     Sign Out
                  </button>
               )}
               <button className="btn btn-ghost" onClick={onChangeTemplate}>Template</button>

               <button
                  className="btn btn-ghost"
                  onClick={handleCloudSave}
                  disabled={syncStatus === 'syncing'}
                  style={syncStatus === 'success' ? { color: '#769C89', fontWeight: 'bold' } : {}}
               >
                  {syncStatus === 'syncing' ? 'Saving...' : (syncStatus === 'success' ? '✓ Saved' : 'Save to Cloud')}
               </button>

               <button className="btn btn-secondary" onClick={() => generatePDF(null, resumeData, template)}>
                  Download
               </button>
            </div>
         </header>

         {/* Left Side: Form */}
         <aside className="form-panel">
            {/* Blobs spread across full scroll depth (up to ~5000px when all expanded) */}
            <div className="form-blob form-blob--1" aria-hidden="true"></div>
            <div className="form-blob form-blob--2" aria-hidden="true"></div>
            <div className="form-blob form-blob--3" aria-hidden="true"></div>
            <div className="form-blob form-blob--4" aria-hidden="true"></div>
            <div className="form-blob form-blob--5" aria-hidden="true"></div>
            <div className="form-blob form-blob--6" aria-hidden="true"></div>
            <div className="form-blob form-blob--7" aria-hidden="true"></div>
            <div className="form-blob form-blob--8" aria-hidden="true"></div>
            <div className="form-blob form-blob--9" aria-hidden="true"></div>
            <div className="form-blob form-blob--10" aria-hidden="true"></div>
            <div className="form-blob form-blob--11" aria-hidden="true"></div>
            <div className="form-blob form-blob--12" aria-hidden="true"></div>
            <div className="form-content">
               <ResumeForm data={resumeData} onChange={handleDataChange} onToast={showToast} />
            </div>
         </aside>

         {/* Right Side: Preview */}
         <main className="preview-panel" ref={panelRef}>
            <div className="resume-scale-container" style={{ overflow: 'hidden' }}>
               <div className="resume-preview-wrapper" ref={wrapperRef}>
                  <ResumePreview data={resumeData} template={template} />
               </div>
            </div>
         </main>

         <ToastContainer toasts={toasts} />
      </div>
   )
}

function MoonIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}

function SunIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
}
