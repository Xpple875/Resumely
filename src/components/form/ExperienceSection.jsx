import React, { useState } from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newExperienceEntry } from '../../utils/defaultData.js'
import { enhanceBullet, getAIUsesLeft } from '../../services/aiService.js'

export default function ExperienceSection({ data, onChange, onToast }) {
  // Track which bullet is currently being enhanced: key = `${eIdx}-${bIdx}`
  const [enhancing, setEnhancing] = useState({})

  const addEntry    = () => onChange([...data, newExperienceEntry()])
  const removeEntry = (idx) => onChange(data.filter((_, i) => i !== idx))
  const updateEntry = (idx, key, val) =>
    onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))

  const updateBullet = (eIdx, bIdx, val) =>
    onChange(data.map((e, i) => {
      if (i !== eIdx) return e
      return { ...e, bullets: e.bullets.map((b, bi) => bi === bIdx ? val : b) }
    }))

  const addBullet    = (eIdx) =>
    onChange(data.map((e, i) => i === eIdx ? { ...e, bullets: [...e.bullets, ''] } : e))

  const removeBullet = (eIdx, bIdx) =>
    onChange(data.map((e, i) => {
      if (i !== eIdx) return e
      return { ...e, bullets: e.bullets.filter((_, bi) => bi !== bIdx) }
    }))

  const handleEnhance = async (eIdx, bIdx) => {
    const entry  = data[eIdx]
    const bullet = entry.bullets[bIdx]
    const key    = `${eIdx}-${bIdx}`

    if (!bullet.trim()) {
      onToast('Write something in the bullet first.', 'error')
      return
    }

    setEnhancing(prev => ({ ...prev, [key]: true }))

    try {
      const result = await enhanceBullet(bullet, entry.title, entry.company)
      updateBullet(eIdx, bIdx, result)
      const left = getAIUsesLeft()
      onToast(`Bullet enhanced! ${left} AI use${left !== 1 ? 's' : ''} left this session.`, 'success')
    } catch (err) {
      onToast(err.message || 'Enhancement failed — try again.', 'error')
    } finally {
      setEnhancing(prev => ({ ...prev, [key]: false }))
    }
  }

  return (
    <SectionWrapper title="Work Experience" icon={<BriefcaseIcon />} defaultOpen={true}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => removeEntry(idx)} title="Remove">
            <CloseIcon />
          </button>

          <div className="field-row">
            <div className="field">
              <label>Job Title</label>
              <input type="text" placeholder="Software Engineer"
                value={entry.title}
                onChange={e => updateEntry(idx, 'title', e.target.value)} />
            </div>
            <div className="field">
              <label>Company</label>
              <input type="text" placeholder="Acme Corp"
                value={entry.company}
                onChange={e => updateEntry(idx, 'company', e.target.value)} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Start Date</label>
              <input type="text" placeholder="Jan 2022"
                value={entry.startDate}
                onChange={e => updateEntry(idx, 'startDate', e.target.value)} />
            </div>
            <div className="field">
              <label>End Date</label>
              <input type="text" placeholder="Present"
                value={entry.endDate}
                onChange={e => updateEntry(idx, 'endDate', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Location</label>
            <input type="text" placeholder="New York, NY / Remote"
              value={entry.location}
              onChange={e => updateEntry(idx, 'location', e.target.value)} />
          </div>

          <div className="field">
            <label>Bullet Points</label>
            {entry.bullets.map((bullet, bIdx) => {
              const key = `${idx}-${bIdx}`
              const isLoading = !!enhancing[key]
              return (
                <div key={bIdx} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <textarea
                      rows={2}
                      style={{ flex: 1 }}
                      placeholder="Describe a key achievement or responsibility…"
                      value={bullet}
                      onChange={e => updateBullet(idx, bIdx, e.target.value)}
                    />
                    <button
                      style={{ color: 'var(--text-light)', flexShrink: 0, alignSelf: 'flex-start', paddingTop: '8px' }}
                      onClick={() => removeBullet(idx, bIdx)}
                      title="Remove bullet"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  {/* Enhance button — sits below the textarea */}
                  <button
                    className="enhance-btn"
                    onClick={() => handleEnhance(idx, bIdx)}
                    disabled={isLoading}
                    title="Rewrite with AI"
                  >
                    {isLoading ? (
                      <><SpinnerIcon /> Enhancing…</>
                    ) : (
                      <><SparkleIcon /> Enhance with AI</>
                    )}
                  </button>
                </div>
              )
            })}
            <button className="add-entry-btn" onClick={() => addBullet(idx)}>
              <PlusIcon /> Add bullet
            </button>
          </div>
        </div>
      ))}
      <button className="add-entry-btn" onClick={addEntry}>
        <PlusIcon /> Add experience
      </button>
    </SectionWrapper>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
