
import React from 'react'
import '../styles/payment.css'

export default function ConfirmModal({ title, message, onConfirm, onDismiss }) {
  return (
    <div className="payment-page" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="payment-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div className="payment-logo" style={{ marginBottom: '10px' }}>Resum<span>e</span>ly</div>
        <h2 className="payment-title">{title}</h2>
        <p className="payment-sub" style={{ margin: '15px 0 25px' }}>{message}</p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, border: '1px solid #ddd' }}
            onClick={onDismiss}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, background: '#ff4d4d', borderColor: '#ff4d4d' }}
            onClick={() => { onConfirm(); onDismiss(); }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}
