import React, { useState } from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { enhanceBullet, getAIUsesLeft } from '../../services/aiService.js'

export default function PersonalSection({ data, onChange, onToast }) {
  const [enhancing, setEnhancing] = useState(false)
  const set = (key, val) => onChange({ ...data, [key]: val })

  const handleEnhanceSummary = async () => {
    if (!data.summary.trim()) {
      onToast('Write something in the summary first.', 'error')
      return
    }
    setEnhancing(true)
    try {
      const result = await enhanceBullet(
        data.summary,
        data.title,
        'professional summary'
      )
      set('summary', result)
      const left = getAIUsesLeft()
      onToast(`Summary enhanced! ${left} AI use${left !== 1 ? 's' : ''} left this session.`, 'success')
    } catch (err) {
      onToast(err.message || 'Enhancement failed — try again.', 'error')
    } finally {
      setEnhancing(false)
    }
  }

  return (
    <SectionWrapper title="Personal Information" icon={<PersonIcon />} defaultOpen={true}>
      <div className="field">
        <label>Full Name</label>
        <input type="text" placeholder="Alex Johnson"
          value={data.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div className="field">
        <label>Job Title / Target Role</label>
        <input type="text" placeholder="Software Engineer"
          value={data.title} onChange={e => set('title', e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="alex@email.com"
            value={data.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="field">
          <label>Phone</label>
          <input type="tel" placeholder="+1 555 000 0000"
            value={data.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Location</label>
          <input type="text" placeholder="New York, NY"
            value={data.location} onChange={e => set('location', e.target.value)} />
        </div>
        <div className="field">
          <label>LinkedIn</label>
          <input type="url" placeholder="linkedin.com/in/alex"
            value={data.linkedin} onChange={e => set('linkedin', e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Website / Portfolio</label>
        <input type="url" placeholder="alexjohnson.dev"
          value={data.website} onChange={e => set('website', e.target.value)} />
      </div>
      <div className="field">
        <label>Summary</label>
        <textarea
          rows={4}
          placeholder="Brief professional summary (2-3 sentences)..."
          value={data.summary}
          onChange={e => set('summary', e.target.value)}
        />
        <button
          className="enhance-btn"
          onClick={handleEnhanceSummary}
          disabled={enhancing}
          title="Rewrite summary with AI"
        >
          {enhancing ? <><SpinnerIcon /> Enhancing...</> : <><SparkleIcon /> Enhance with AI</>}
        </button>
      </div>
    </SectionWrapper>
  )
}

function PersonIcon() {
  return (
    <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
    </svg>
  )
}
function SpinnerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin 0.8s linear infinite'}}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
