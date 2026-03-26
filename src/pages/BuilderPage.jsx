
import React, { useState, useEffect } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import PayGateModal from '../components/PayGateModal.jsx'
import AuthModal from '../components/AuthModal.jsx'
import { generatePDF } from '../utils/pdfExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { useAutosave, loadDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import { supabase, syncResumeToCloud } from '../services/supabaseClient'
import '../styles/builder.css'

export default function BuilderPage({ template, onChangeTemplate, unlocked, user, onSignOut }) {
  const [resumeData, setResumeData] = useState(() => loadDraft() || defaultResumeData)
  const [isExporting, setIsExporting] = useState(false)
  const [showPayGate, setShowPayGate] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toasts, showToast } = useToast()

  useAutosave(resumeData, user, unlocked)

  useEffect(() => {
    if (user) {
      const fetchCloudData = async () => {
        try {
          const { data, error } = await supabase
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
      console.error("Sync Error:", err)
      showToast('Sync failed', 'error')
    } finally { setIsSyncing(false) }
  }

  return (
    <div className="builder-layout" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="builder-header">
        <div className="builder-header__logo">Resum<span>e</span>ly</div>
        <div className="builder-header__actions">
          <button className="btn btn-ghost" onClick={onChangeTemplate}>Template</button>
          <button className="btn btn-ghost" onClick={handleCloudSave} disabled={isSyncing}>
            {user ? (isSyncing ? 'Syncing...' : 'Saved') : 'Save to Cloud'}
          </button>
          {user && <button className="btn btn-ghost" onClick={onSignOut} style={{color: '#ff4d4d'}}>Sign Out</button>}
          <button className="btn btn-secondary" onClick={() => unlocked ? generatePDF(null, resumeData) : setShowPayGate(true)}>
            {unlocked ? 'Download' : 'Download — $8'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: '40%', overflowY: 'auto', borderRight: '1px solid #eee', padding: '20px' }}>
          <ResumeForm data={resumeData} onChange={setResumeData} onToast={showToast} />
        </aside>

        <main style={{ width: '60%', overflowY: 'auto', background: '#f5f5f5', display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <ResumePreview data={resumeData} template={template} />
          </div>
        </main>
      </div>

      {showPayGate && <PayGateModal onDismiss={() => setShowPayGate(false)} />}
      {showAuth && <AuthModal onDismiss={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
