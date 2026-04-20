import React, { useState } from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newVolunteerEntry } from '../../utils/defaultData.js'
import { enhanceBullet, getAIUsesLeft } from '../../services/aiService.js'

export default function VolunteerSection({ data, onChange, onToast }) {
  const [enhancing, setEnhancing] = useState({})

  const add = () => onChange([...data, newVolunteerEntry()])
  const remove = (idx) => onChange(data.filter((_, i) => i !== idx))
  const update = (idx, key, val) => onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))

  const handleEnhance = async (idx) => {
    const entry = data[idx]
    if (!entry.description.trim()) {
      onToast('Write something in the description first.', 'error')
      return
    }

    setEnhancing(prev => ({ ...prev, [idx]: true }))
    try {
      const result = await enhanceBullet(entry.description, entry.role, entry.organization, false, 'description')
      update(idx, 'description', result)
      const left = getAIUsesLeft()
      onToast(`Volunteer role enhanced! ${left} AI use${left !== 1 ? 's' : ''} left this session.`, 'success')
    } catch (err) {
      onToast(err.message || 'Enhancement failed — try again.', 'error')
    } finally {
      setEnhancing(prev => ({ ...prev, [idx]: false }))
    }
  }

  return (
    <SectionWrapper title="Volunteering" icon={<HeartIcon />} defaultOpen={false}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => remove(idx)} title="Remove"><CloseIcon /></button>
          <div className="field-row">
            <div className="field">
              <label>Role</label>
              <input type="text" value={entry.role} onChange={e => update(idx, 'role', e.target.value)} placeholder="Volunteer Teacher" />
            </div>
            <div className="field">
              <label>Organization</label>
              <input type="text" value={entry.organization} onChange={e => update(idx, 'organization', e.target.value)} placeholder="Red Cross" />
            </div>
          </div>
          <div className="field">
            <label>Date</label>
            <input type="text" value={entry.date} onChange={e => update(idx, 'date', e.target.value)} placeholder="2023 - Present" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={entry.description} onChange={e => update(idx, 'description', e.target.value)} placeholder="What did you do there?" />
            <button
               className="enhance-btn"
               onClick={() => handleEnhance(idx)}
               disabled={enhancing[idx]}
               title="Rewrite with AI"
               style={{ marginTop: '8px' }}
            >
               {enhancing[idx] ? <><SpinnerIcon /> Enhancing…</> : <><SparkleIcon /> Enhance with AI</>}
            </button>
          </div>
        </div>
      ))}
      <button className="add-entry-btn" onClick={add}><PlusIcon /> Add volunteering</button>
    </SectionWrapper>
  )
}

function HeartIcon() {
  return <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
}
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }

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
