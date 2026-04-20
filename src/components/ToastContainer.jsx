import React, { useEffect, useState } from 'react'

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
}

const COLORS = {
  success: { accent: '#4ade80', bg: 'rgba(20, 40, 25, 0.88)', border: 'rgba(74, 222, 128, 0.25)' },
  error:   { accent: '#f87171', bg: 'rgba(40, 15, 15, 0.88)', border: 'rgba(248, 113, 113, 0.25)' },
  info:    { accent: 'var(--accent)', bg: 'rgba(30, 20, 12, 0.88)', border: 'rgba(196, 98, 45, 0.3)' },
}

function Toast({ toast, duration = 3500 }) {
  const [progress, setProgress] = useState(100)
  const [leaving, setLeaving] = useState(false)
  const c = COLORS[toast.type] || COLORS.info

  useEffect(() => {
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(pct)
      if (pct === 0) clearInterval(tick)
    }, 30)

    const leaveTimer = setTimeout(() => setLeaving(true), duration - 300)
    return () => { clearInterval(tick); clearTimeout(leaveTimer) }
  }, [duration])

  return (
    <div
      className={`toast-item ${leaving ? 'toast-item--leaving' : ''}`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <span className="toast-item__icon" style={{ color: c.accent }}>
        {ICONS[toast.type] || ICONS.info}
      </span>
      <span className="toast-item__message">{toast.message}</span>
      <div
        className="toast-item__progress"
        style={{ background: c.accent, width: `${progress}%` }}
      />
    </div>
  )
}

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
