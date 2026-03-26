import React, { useState } from 'react'

export default function SectionWrapper({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="form-section">
      <div className="form-section__header" onClick={() => setOpen(o => !o)}>
        <div className="form-section__title">
          {icon}
          {title}
        </div>
        <svg
          className={`form-section__chevron ${open ? 'open' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && (
        <div className="form-section__body">
          {children}
        </div>
      )}
    </div>
  )
}
