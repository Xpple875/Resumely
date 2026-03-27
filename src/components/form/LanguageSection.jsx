import React from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newLanguageEntry } from '../../utils/defaultData.js'

export default function LanguageSection({ data, onChange }) {
  const add = () => onChange([...data, newLanguageEntry()])
  const remove = (idx) => onChange(data.filter((_, i) => i !== idx))
  const update = (idx, key, val) => onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))

  return (
    <SectionWrapper title="Languages" icon={<GlobeIcon />} defaultOpen={false}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => remove(idx)} title="Remove"><CloseIcon /></button>
          <div className="field-row">
            <div className="field">
              <label>Language</label>
              <input type="text" value={entry.name} onChange={e => update(idx, 'name', e.target.value)} placeholder="English" />
            </div>
            <div className="field">
              <label>Level</label>
              <input type="text" value={entry.level} onChange={e => update(idx, 'level', e.target.value)} placeholder="Native / Fluent / A2" />
            </div>
          </div>
        </div>
      ))}
      <button className="add-entry-btn" onClick={add}><PlusIcon /> Add language</button>
    </SectionWrapper>
  )
}

function GlobeIcon() {
  return <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
}
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
