import React from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newInterestEntry } from '../../utils/defaultData.js'

export default function InterestSection({ data, onChange }) {
  const add = () => onChange([...data, newInterestEntry()])
  const remove = (idx) => onChange(data.filter((_, i) => i !== idx))
  const update = (idx, val) => onChange(data.map((e, i) => i === idx ? { ...e, name: val } : e))

  return (
    <SectionWrapper title="Interests" icon={<CoffeeIcon />} defaultOpen={false}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
         {data.map((entry, idx) => (
            <div key={entry.id} className="skill-tag" style={{ paddingLeft: '12px' }}>
               <input 
                  type="text" 
                  value={entry.name} 
                  onChange={e => update(idx, e.target.value)} 
                  placeholder="Hiking"
                  style={{ width: '80px', border: 'none', background: 'none', padding: 0, fontSize: '0.9em' }}
               />
               <button onClick={() => remove(idx)}><CloseIcon /></button>
            </div>
         ))}
      </div>
      <button className="add-entry-btn" onClick={add}><PlusIcon /> Add interest</button>
    </SectionWrapper>
  )
}

function CoffeeIcon() {
  return <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
}
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
