import os

def update_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Paper UI Aligned: {path}")

builder_paper_fix = """
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
        <aside style={{ width: '400px', minWidth: '350px', overflowY: 'auto', borderRight: '1px solid #eee' }}>
          <ResumeForm data={resumeData} onChange={setResumeData} onToast={showToast} />
        </aside>

        {/* Gray Preview Area */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#e0e0e0', display: 'flex', justifyContent: 'center', padding: '50px 20px' }}>
          {/* The Paper Component */}
          <div style={{
            width: '100%',
            maxWidth: '210mm', // Standard A4 width
            minHeight: '297mm', // Standard A4 height
            background: 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            transformOrigin: 'top center'
          }}>
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
"""

update_file('src/pages/BuilderPage.jsx', builder_paper_fix)
