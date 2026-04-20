import React from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newReferenceEntry } from '../../utils/defaultData.js'

export default function ReferenceSection({ data, onChange }) {
  const add = () => onChange([...data, newReferenceEntry()])
  const remove = (idx) => onChange(data.filter((_, i) => i !== idx))
  const update = (idx, key, val) => onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))

  return (
    <SectionWrapper title="References" icon={<UserCheckIcon />} defaultOpen={false} badge={data.length}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => remove(idx)} title="Remove"><CloseIcon /></button>
          <div className="field-row">
            <div className="field">
              <label>Full Name</label>
              <input type="text" value={entry.name} onChange={e => update(idx, 'name', e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="field">
              <label>Relation / Title</label>
              <input type="text" value={entry.title} onChange={e => update(idx, 'title', e.target.value)} placeholder="Marketing Manager" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Company</label>
              <input type="text" value={entry.company} onChange={e => update(idx, 'company', e.target.value)} placeholder="Acme Inc." />
            </div>
            <div className="field">
              <label>Contact Info</label>
              <input type="text" value={entry.contact} onChange={e => update(idx, 'contact', e.target.value)} placeholder="jane@example.com / +1 234..." />
            </div>
          </div>
        </div>
      ))}
      <button className="add-entry-btn" onClick={add}><PlusIcon /> Add reference</button>
    </SectionWrapper>
  )
}

function UserCheckIcon() {
  return <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
}
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
