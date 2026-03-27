
import React, { useState } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import { generatePDF } from '../utils/pdfExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { loadDraft, saveDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import { syncResumeToCloud } from '../services/supabaseClient'
import '../styles/builder.css'

export default function BuilderPage({ template, onChangeTemplate, unlocked, user, onSignOut }) {
  const [resumeData, setResumeData] = useState(() => loadDraft() || defaultResumeData)
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'success'
  const { toasts, showToast } = useToast()

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
        <div className="builder-header__logo">Resum<span>e</span>ly</div>
        <div className="builder-header__actions">
          {user && (
            <button className="btn btn-ghost" style={{color:'#ff4d4d'}} onClick={onSignOut}>
              Sign Out
            </button>
          )}
          <button className="btn btn-ghost" onClick={onChangeTemplate}>Template</button>

          <button
            className="btn btn-ghost"
            onClick={handleCloudSave}
            disabled={syncStatus === 'syncing'}
            style={syncStatus === 'success' ? {color: '#769C89', fontWeight: 'bold'} : {}}
          >
            {syncStatus === 'syncing' ? 'Saving...' : (syncStatus === 'success' ? '✓ Saved' : 'Save to Cloud')}
          </button>

          <button className="btn btn-secondary" onClick={() => generatePDF(null, resumeData)}>
            Download
          </button>
        </div>
      </header>

      {/* Left Side: Form */}
      <aside className="form-panel">
        <ResumeForm data={resumeData} onChange={handleDataChange} onToast={showToast} />
      </aside>

      {/* Right Side: Preview */}
      <main className="preview-panel">
        <div className="resume-preview-wrapper">
          <ResumePreview data={resumeData} template={template} />
        </div>
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
