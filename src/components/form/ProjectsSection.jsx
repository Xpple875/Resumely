import React, { useState } from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newProjectEntry } from '../../utils/defaultData.js'
import { enhanceBullet, getAIUsesLeft } from '../../services/aiService.js'

export default function ProjectsSection({ data, onChange, onToast }) {
  const [enhancing, setEnhancing] = useState({})

  const addEntry = () => onChange([...data, newProjectEntry()])
  const removeEntry = (idx) => onChange(data.filter((_, i) => i !== idx))
  const updateEntry = (idx, key, val) => {
    onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))
  }

  const handleEnhance = async (idx) => {
    const entry = data[idx]
    if (!entry.description.trim()) {
      onToast('Write something in the description first.', 'error')
      return
    }

    setEnhancing(prev => ({ ...prev, [idx]: true }))
    try {
      const result = await enhanceBullet(entry.description, entry.name, '', false, 'description')
      updateEntry(idx, 'description', result)
      const left = getAIUsesLeft()
      onToast(`Project enhanced! ${left} AI use${left !== 1 ? 's' : ''} left this session.`, 'success')
    } catch (err) {
      onToast(err.message || 'Enhancement failed — try again.', 'error')
    } finally {
      setEnhancing(prev => ({ ...prev, [idx]: false }))
    }
  }

  return (
    <SectionWrapper title="Projects (Optional)" icon={<ProjectIcon />} defaultOpen={false}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => removeEntry(idx)} title="Remove">
            <CloseIcon />
          </button>
          <div className="field">
            <label>Project Name</label>
            <input
              type="text"
              placeholder="My Awesome Project"
              value={entry.name}
              onChange={e => updateEntry(idx, 'name', e.target.value)}
            />
          </div>
          <div className="field">
            <label>URL (optional)</label>
            <input
              type="url"
              placeholder="github.com/you/project"
              value={entry.url}
              onChange={e => updateEntry(idx, 'url', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="What does it do? What tech did you use? What was the impact?"
              value={entry.description}
              onChange={e => updateEntry(idx, 'description', e.target.value)}
            />
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
      <button className="add-entry-btn" onClick={addEntry}>
        <PlusIcon /> Add project
      </button>
    </SectionWrapper>
  )
}

function ProjectIcon() {
  return (
    <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
