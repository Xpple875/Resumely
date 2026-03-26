
import React, { useState, useEffect } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import PayGateModal from '../components/PayGateModal.jsx'
import AuthModal from '../components/AuthModal.jsx'
import { generatePDF } from '../utils/pdfExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { useAutosave, loadDraft, clearDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import { supabase, syncResumeToCloud } from '../services/supabaseClient'
import '../styles/builder.css'

function getInitialData() {
  return loadDraft() || defaultResumeData
}

export default function BuilderPage({ template = 'classic', onChangeTemplate, unlocked = false }) {
  const [resumeData, setResumeData]   = useState(getInitialData)
  const [isExporting, setIsExporting] = useState(false)
  const [showPayGate, setShowPayGate] = useState(false)
  const [showAuth, setShowAuth]       = useState(false)
  const [user, setUser]               = useState(null)
  const [isSyncing, setIsSyncing]     = useState(false)
  const [mobileTab, setMobileTab]     = useState('form')
  const { toasts, showToast }         = useToast()

  useAutosave(resumeData)

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
      }).catch(err => console.error("Auth error:", err))
    }
  }, [])

  const handleDownloadClick = () => {
    if (!unlocked) {
      setShowPayGate(true)
      return
    }
    doExport()
  }

  const doExport = async () => {
    setIsExporting(true)
    try {
      await generatePDF(null, resumeData, resumeData.personal.name || 'resume')
      showToast('PDF downloaded!', 'success')
    } catch (err) {
      showToast('PDF export failed.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleAuthSuccess = async (newUser) => {
    setUser(newUser)
    setShowAuth(false)
    showToast('Account synced!', 'success')
    if (newUser) performSync(newUser.id)
  }

  const performSync = async (userId = user?.id) => {
    if (!userId || !supabase) return
    setIsSyncing(true)
    try {
      await syncResumeToCloud(userId, resumeData, unlocked)
      showToast('Saved to cloud', 'success')
    } catch (err) {
      showToast('Sync failed', 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="builder-layout">
      <header className="builder-header">
        <div className="builder-header__logo">Resum<span>e</span>ly</div>
        <div className="builder-header__actions">
          {/* Re-added Template Button */}
          <button className="btn btn-ghost" onClick={onChangeTemplate} title="Change template">
            <TemplateIcon /> <span className="hide-mobile">Template</span>
          </button>

          {/* Cloud Save Button */}
          <button className="btn btn-ghost" onClick={() => user ? performSync() : setShowAuth(true)} disabled={isSyncing}>
            {user ? (isSyncing ? 'Syncing...' : 'Saved') : 'Save to Cloud'}
          </button>

          {/* Download Button */}
          <button className="btn btn-secondary" onClick={handleDownloadClick} disabled={isExporting}>
            {isExporting ? 'Exporting...' : (unlocked ? 'Download' : 'Download — $8')}
          </button>
        </div>
      </header>

      <aside className={`form-panel ${mobileTab === 'preview' ? 'mobile-hidden' : ''}`}>
        <ResumeForm data={resumeData} onChange={setResumeData} onToast={showToast} />
      </aside>

      <main className={`preview-panel ${mobileTab === 'form' ? 'mobile-hidden' : ''}`}>
        <div className="resume-preview-wrapper">
          <ResumePreview data={resumeData} template={template} />
        </div>
      </main>

      {showPayGate && <PayGateModal onDismiss={() => setShowPayGate(false)} />}
      {showAuth && <AuthModal onDismiss={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

function TemplateIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}
