import React from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newEducationEntry } from '../../utils/defaultData.js'

export default function EducationSection({ data, onChange }) {
  const addEntry = () => onChange([...data, newEducationEntry()])
  const removeEntry = (idx) => onChange(data.filter((_, i) => i !== idx))
  const updateEntry = (idx, key, val) => {
    onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))
  }

  return (
    <SectionWrapper title="Education" icon={<GradIcon />} defaultOpen={true}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => removeEntry(idx)} title="Remove">
            <CloseIcon />
          </button>
          <div className="field">
            <label>Degree</label>
            <input
              type="text"
              placeholder="B.S. Computer Science"
              value={entry.degree}
              onChange={e => updateEntry(idx, 'degree', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Institution</label>
            <input
              type="text"
              placeholder="State University"
              value={entry.institution}
              onChange={e => updateEntry(idx, 'institution', e.target.value)}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Start Year</label>
              <input
                type="text"
                placeholder="2018"
                value={entry.startDate}
                onChange={e => updateEntry(idx, 'startDate', e.target.value)}
              />
            </div>
            <div className="field">
              <label>End Year</label>
              <input
                type="text"
                placeholder="2022"
                value={entry.endDate}
                onChange={e => updateEntry(idx, 'endDate', e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>GPA / Honors (optional)</label>
            <input
              type="text"
              placeholder="3.8 GPA, Dean's List"
              value={entry.gpa}
              onChange={e => updateEntry(idx, 'gpa', e.target.value)}
            />
          </div>
        </div>
      ))}
      <button className="add-entry-btn" onClick={addEntry}>
        <PlusIcon /> Add education
      </button>
    </SectionWrapper>
  )
}

function GradIcon() {
  return (
    <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
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
