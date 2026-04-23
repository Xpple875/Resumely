import React from 'react'
import '../styles/payment.css'

export default function DonationModal({ onDismiss, onContinueFree, userId }) {
  const bmacUrl = `https://buymeacoffee.com/resumely?name=${userId || 'Anonymous'}`;

  return (
    <div className="paygate-overlay" onClick={onDismiss}>
      <div className="paygate-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px 30px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>☕</div>
        <div className="paygate-title">Support Resumely</div>
        <div className="paygate-sub" style={{ marginBottom: '25px', fontSize: '15px', color: 'var(--text-light)', lineHeight: '1.6' }}>
          Right now, Resumely is <strong>entirely free</strong> as a promotional offer.
          <br /><br />
          Server and AI costs are adding up fast though. 
          If you find this tool helpful for landing a job, please consider supporting with a coffee so we can keep it free for everyone!
        </div>
        
        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center', marginBottom: '30px' }}
          onClick={() => window.open(bmacUrl, '_blank')}
        >
          Support with a coffee
        </button>

        <button 
          className="paygate-dismiss" 
          onClick={onContinueFree}
          style={{ width: '100%', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '15px' }}
        >
          I'm broke right now, proceed to free download
        </button>
      </div>
    </div>
  )
}
