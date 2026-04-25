import React from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newCourseEntry } from '../../utils/defaultData.js'

export default function CoursesSection({ data, onChange }) {
  const add = () => onChange([...data, newCourseEntry()])
  const remove = (idx) => onChange(data.filter((_, i) => i !== idx))
  const update = (idx, key, val) => onChange(data.map((e, i) => i === idx ? { ...e, [key]: val } : e))

  return (
    <SectionWrapper title="Relevant Courses" icon={<CourseIcon />} defaultOpen={false} badge={data.length}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => remove(idx)} title="Remove"><CloseIcon /></button>
          <div className="field">
            <label>Course Name</label>
            <input type="text" value={entry.name} onChange={e => update(idx, 'name', e.target.value)} placeholder="CS50: Introduction to Computer Science" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Institution / Platform</label>
              <input type="text" value={entry.institution} onChange={e => update(idx, 'institution', e.target.value)} placeholder="Harvard University / edX" />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="text" value={entry.date} onChange={e => update(idx, 'date', e.target.value)} placeholder="2023" />
            </div>
          </div>
        </div>
      ))}
      <button className="add-entry-btn" onClick={add}><PlusIcon /> Add course</button>
    </SectionWrapper>
  )
}

function CourseIcon() {
  return <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
}
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
