import React from 'react'

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'var(--font-body)',
          fontWeight: '500',
          boxShadow: '0 4px 20px rgba(26,23,20,0.14)',
          animation: 'toastIn 0.2s ease',
          background: toast.type === 'error'   ? '#2d1410' :
                      toast.type === 'success' ? '#0f1f12' : 'var(--bg-dark)',
          color:      toast.type === 'error'   ? '#f87171' :
                      toast.type === 'success' ? '#6ee7b7' : 'var(--bg)',
          borderLeft: `3px solid ${
            toast.type === 'error'   ? '#f87171' :
            toast.type === 'success' ? '#6ee7b7' : 'var(--accent)'
          }`,
        }}>
          {toast.message}
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
