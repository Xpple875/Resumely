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
        '',
        true
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

  const hideSummary = data.hideSummary ?? false

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

      {/* Summary field with inline visibility toggle */}
      <div className="field">
        <div className="summary-label-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label>Summary</label>
            <span style={{ fontSize: '10px', color: 'var(--text-lighter)', fontWeight: 500, paddingTop: '1px' }}>
              {data.summary.length} / 600
            </span>
          </div>
          <button
            className={`summary-toggle-btn ${hideSummary ? 'hidden' : 'visible'}`}
            onClick={() => set('hideSummary', !hideSummary)}
            title={hideSummary ? 'Show summary on resume' : 'Hide summary from resume'}
            type="button"
          >
            {hideSummary ? <EyeOffIcon /> : <EyeIcon />}
            <span>{hideSummary ? 'Hidden' : 'Visible'}</span>
          </button>
        </div>
        <textarea
          rows={4}
          placeholder="Brief professional summary (2-3 sentences)..."
          value={data.summary}
          onChange={e => set('summary', e.target.value)}
          style={{ opacity: hideSummary ? 0.45 : 1, transition: 'opacity 0.2s ease' }}
        />
        <button
          className="enhance-btn"
          onClick={handleEnhanceSummary}
          disabled={enhancing || hideSummary}
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

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
