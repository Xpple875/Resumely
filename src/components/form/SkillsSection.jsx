import React, { useState } from 'react'
import SectionWrapper from './SectionWrapper.jsx'

export default function SkillsSection({ data, onChange }) {
  const [input, setInput] = useState('')

  const addSkill = () => {
    const trimmed = input.trim()
    if (!trimmed || data.includes(trimmed)) return
    onChange([...data, trimmed])
    setInput('')
  }

  const removeSkill = (skill) => onChange(data.filter(s => s !== skill))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <SectionWrapper title="Skills" icon={<SkillIcon />} defaultOpen={true}>
      <div className="field">
        <label>Add Skills (press Enter or comma to add)</label>
        <div className="skills-input-row">
          <input
            type="text"
            placeholder="e.g. React, Python, Figma…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />
          <button className="btn btn-secondary" onClick={addSkill} style={{ padding: '9px 14px' }}>
            Add
          </button>
        </div>
        {data.length > 0 && (
          <div className="skills-tags">
            {data.map(skill => (
              <span className="skill-tag" key={skill}>
                {skill}
                <span className="skill-tag__remove" onClick={() => removeSkill(skill)}>
                  <CloseIcon />
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}

function SkillIcon() {
  return (
    <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
