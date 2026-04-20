import React, { useState } from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newCertificationEntry } from '../../utils/defaultData.js'
import { enhanceBullet, getAIUsesLeft } from '../../services/aiService.js'

export default function CertificationSection({ data, onChange, onToast }) {
  const [enhancing, setEnhancing] = useState({})

  const add = () => onChange([...data, newCertificationEntry()])
  const remove = (idx) => onChange(data.filter((_, i) => i !== idx))
  const update = (idx, key, val) => onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))

  const handleEnhance = async (idx) => {
    const entry = data[idx]
    if (!entry.description || !entry.description.trim()) {
      onToast('Write something in the description first.', 'error')
      return
    }

    setEnhancing(prev => ({ ...prev, [idx]: true }))
    try {
      const result = await enhanceBullet(entry.description, entry.name, entry.issuer, false, 'description')
      update(idx, 'description', result)
      const left = getAIUsesLeft()
      onToast(`Certification enhanced! ${left} AI use${left !== 1 ? 's' : ''} left this session.`, 'success')
    } catch (err) {
      onToast(err.message || 'Enhancement failed — try again.', 'error')
    } finally {
      setEnhancing(prev => ({ ...prev, [idx]: false }))
    }
  }

  return (
    <SectionWrapper title="Certifications" icon={<AwardIcon />} defaultOpen={false}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => remove(idx)} title="Remove"><CloseIcon /></button>
          <div className="field-row">
            <div className="field">
              <label>Certificate Name</label>
              <input type="text" value={entry.name} onChange={e => update(idx, 'name', e.target.value)} placeholder="AWS Solutions Architect" />
            </div>
            <div className="field">
              <label>Issuer</label>
              <input type="text" value={entry.issuer} onChange={e => update(idx, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
            </div>
          </div>
          <div className="field">
            <label>Date</label>
            <input type="text" value={entry.date} onChange={e => update(idx, 'date', e.target.value)} placeholder="Jan 2024" />
          </div>
          <div className="field">
            <label>Description (Optional)</label>
            <textarea value={entry.description || ''} onChange={e => update(idx, 'description', e.target.value)} placeholder="What did you learn? What skills did it validate?" />
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
      <button className="add-entry-btn" onClick={add}><PlusIcon /> Add certification</button>
    </SectionWrapper>
  )
}

function AwardIcon() {
  return <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15L15 12L12 9L9 12L12 15Z"/><path d="M12 6V9"/><path d="M12 15V18"/><path d="M18 12H15"/><path d="M9 12H6"/><circle cx="12" cy="12" r="10"/></svg>
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
