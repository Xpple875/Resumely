
import React, { useState, useEffect } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import PayGateModal from '../components/PayGateModal.jsx'
import AuthModal from '../components/AuthModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx' // New
import { generatePDF } from '../utils/pdfExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { useAutosave, loadDraft, clearDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import { supabase, syncResumeToCloud } from '../services/supabaseClient'
import '../styles/builder.css'

export default function BuilderPage({ template, onChangeTemplate, unlocked, user, onSignOut }) {
  const [resumeData, setResumeData] = useState(() => loadDraft() || defaultResumeData)
  const [showPayGate, setShowPayGate] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false) // New
  const [isSyncing, setIsSyncing] = useState(false)
  const { toasts, showToast } = useToast()

  useAutosave(resumeData, user, unlocked)

  useEffect(() => {
    if (user) {
      const fetchCloudData = async () => {
        try {
          const { data } = await supabase
            .from('resumes')
            .select('resume_data')
            .eq('user_id', user.id)
            .maybeSingle()

          if (data?.resume_data) {
            setResumeData(data.resume_data)
          }
        } catch (e) { console.error(e) }
      }
      fetchCloudData()
    }
  }, [user])

  const handleCloudSave = async () => {
    if (!user) { setShowAuth(true); return; }
    setIsSyncing(true)
    try {
      await syncResumeToCloud(user.id, resumeData, unlocked)
      showToast('Saved to cloud', 'success')
    } catch (err) {
      showToast('Sync failed', 'error')
    } finally { setIsSyncing(false) }
  }

  const performClear = () => {
    clearDraft()
    setResumeData(defaultResumeData)
    showToast('Form cleared', 'info')
  }

  return (
    <div className="builder-layout" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="builder-header">
        <div className="builder-header__logo">Resum<span>e</span>ly</div>

        <div className="builder-header__actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && (
            <button className="btn btn-ghost" onClick={onSignOut} style={{color: '#ff4d4d', fontWeight: '500'}}>
              Sign Out
            </button>
          )}

          <button className="btn btn-ghost" onClick={onChangeTemplate}>Template</button>

          <button className="btn btn-ghost" onClick={handleCloudSave} disabled={isSyncing}>
            {user ? (isSyncing ? 'Syncing...' : 'Saved') : 'Save to Cloud'}
          </button>

          <button className="btn btn-ghost" onClick={() => setShowClearConfirm(true)}>
            Clear
          </button>

          <button className="btn btn-secondary" onClick={() => unlocked ? generatePDF(null, resumeData) : setShowPayGate(true)}>
            {unlocked ? 'Download' : 'Download — $8'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: '400px', minWidth: '350px', overflowY: 'auto', borderRight: '1px solid #eee' }}>
          <ResumeForm data={resumeData} onChange={setResumeData} onToast={showToast} />
        </aside>

        <main style={{ flex: 1, overflowY: 'auto', background: '#e0e0e0', display: 'flex', justifyContent: 'center', padding: '50px 20px' }}>
          <div style={{
            width: '100%',
            maxWidth: '210mm',
            minHeight: '297mm',
            background: 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            marginBottom: '50px'
          }}>
            <ResumePreview data={resumeData} template={template} />
          </div>
        </main>
      </div>

      {showPayGate && <PayGateModal onDismiss={() => setShowPayGate(false)} />}
      {showAuth && <AuthModal onDismiss={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}

      {showClearConfirm && (
        <ConfirmModal
          title="Reset Resume?"
          message="This will delete all information currently in the form. This cannot be undone."
          onConfirm={performClear}
          onDismiss={() => setShowClearConfirm(false)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}
