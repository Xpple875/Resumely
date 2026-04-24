import React, { useState, useRef } from 'react'
import SectionWrapper from './SectionWrapper.jsx'

export default function SectionManager({ order, labels, onOrderChange, onLabelChange, hideSummary, onToggleSummary }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const dragNode = useRef(null)

  const updateLabel = (key, val) => {
    onLabelChange({ ...labels, [key]: val })
  }

  const handleDragStart = (e, idx) => {
    setDragIndex(idx)
    dragNode.current = e.currentTarget
    setTimeout(() => {
      if (dragNode.current) dragNode.current.classList.add('dragging')
    }, 0)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnter = (e, idx) => {
    e.preventDefault()
    if (idx !== dragIndex) setOverIndex(idx)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, idx) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === idx) return
    const newOrder = [...order]
    const [removed] = newOrder.splice(dragIndex, 1)
    newOrder.splice(idx, 0, removed)
    onOrderChange(newOrder)
    setDragIndex(null)
    setOverIndex(null)
  }

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.classList.remove('dragging')
    dragNode.current = null
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <SectionWrapper title="Manage Sections" icon={<SettingsIcon />} defaultOpen={false}>
      <div className="section-manager">
        <p className="section-manager__hint">
          Drag to reorder sections or rename their headers. Only sections with content appear on the resume.
        </p>

        <div className="section-manager__list">
          {order.map((key, idx) => (
            <div
              key={key}
              className={`manager-row${overIndex === idx && dragIndex !== idx ? ' drag-over' : ''}${dragIndex === idx ? ' is-dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <div className="manager-row__handle" title="Drag to reorder">
                <DragIcon />
              </div>

              <div className="manager-row__label-field">
                <span className="manager-row__key">{key}</span>

                {key === 'summary' ? (
                  /* Summary row: show toggle instead of editable label */
                  <div className="manager-row__summary-controls">
                    <span className="manager-row__summary-hint">
                      {hideSummary ? 'Hidden from resume' : 'Visible on resume'}
                    </span>
                    <button
                      className={`manager-summary-toggle ${hideSummary ? 'is-hidden' : 'is-visible'}`}
                      onClick={(e) => { e.stopPropagation(); onToggleSummary(!hideSummary) }}
                      title={hideSummary ? 'Show summary' : 'Hide summary'}
                      type="button"
                    >
                      {hideSummary ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={labels[key] || ''}
                    onChange={e => updateLabel(key, e.target.value)}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    className="manager-row__input"
                    onClick={e => e.stopPropagation()}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}

function SettingsIcon() {
  return (
    <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

function DragIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5"/>
      <circle cx="15" cy="6" r="1.5"/>
      <circle cx="9" cy="12" r="1.5"/>
      <circle cx="15" cy="12" r="1.5"/>
      <circle cx="9" cy="18" r="1.5"/>
      <circle cx="15" cy="18" r="1.5"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
