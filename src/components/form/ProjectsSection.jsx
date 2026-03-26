import React from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newProjectEntry } from '../../utils/defaultData.js'

export default function ProjectsSection({ data, onChange }) {
  const addEntry = () => onChange([...data, newProjectEntry()])
  const removeEntry = (idx) => onChange(data.filter((_, i) => i !== idx))
  const updateEntry = (idx, key, val) => {
    onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))
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
