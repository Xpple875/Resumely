import React, { useState } from 'react'
import SectionWrapper from './SectionWrapper.jsx'
import { newPublicationEntry } from '../../utils/defaultData.js'
import { enhanceBullet, getAIUsesLeft } from '../../services/aiService.js'

export default function PublicationsSection({ data, onChange, onToast }) {
  const [enhancing, setEnhancing] = useState({})

  const add = () => onChange([...data, newPublicationEntry()])
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
      const result = await enhanceBullet(entry.description, entry.title, entry.publisher, false, 'description')
      update(idx, 'description', result)
      const left = getAIUsesLeft()
      onToast(`Publication description enhanced! ${left} AI use${left !== 1 ? 's' : ''} left this session.`, 'success')
    } catch (err) {
      onToast(err.message || 'Enhancement failed — try again.', 'error')
    } finally {
      setEnhancing(prev => ({ ...prev, [idx]: false }))
    }
  }

  return (
    <SectionWrapper title="Publications" icon={<BookIcon />} defaultOpen={false} badge={data.length}>
      {data.map((entry, idx) => (
        <div className="entry-card" key={entry.id}>
          <button className="entry-card__remove" onClick={() => remove(idx)} title="Remove"><CloseIcon /></button>
          <div className="field">
            <label>Title</label>
            <input type="text" value={entry.title} onChange={e => update(idx, 'title', e.target.value)} placeholder="Scalable Web Architectures" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Publisher / Journal</label>
              <input type="text" value={entry.publisher} onChange={e => update(idx, 'publisher', e.target.value)} placeholder="IEEE / Tech Blog" />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="text" value={entry.date} onChange={e => update(idx, 'date', e.target.value)} placeholder="Aug 2023" />
            </div>
          </div>
          <div className="field">
            <label>URL</label>
            <input type="url" value={entry.url} onChange={e => update(idx, 'url', e.target.value)} placeholder="https://example.com/paper" />
          </div>
          <div className="field">
            <label>Description (Optional)</label>
            <textarea value={entry.description || ''} onChange={e => update(idx, 'description', e.target.value)} placeholder="Brief summary of the publication..." />
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
      <button className="add-entry-btn" onClick={add}><PlusIcon /> Add publication</button>
    </SectionWrapper>
  )
}

function BookIcon() {
  return <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function SparkleIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/></svg> }
function SpinnerIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin 0.8s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> }
