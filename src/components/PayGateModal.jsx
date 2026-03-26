import React from 'react'
import { redirectToPayment } from '../services/paymentService.js'
import '../styles/payment.css'

export default function PayGateModal({ onDismiss }) {
  return (
    <div className="paygate-overlay" onClick={onDismiss}>
      <div className="paygate-card" onClick={e => e.stopPropagation()}>
        <div className="paygate-title">Download your resume</div>
        <div className="paygate-price"><sup>$</sup>8</div>
        <div className="paygate-sub">One-time payment. No subscription, ever.</div>
        <ul className="paygate-features">
          <li>ATS-optimised PDF download</li>
          <li>All three templates included</li>
          <li>Re-download anytime for 30 days</li>
          <li>AI bullet rewriter included</li>
        </ul>
        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={redirectToPayment}
        >
          Pay $8 and download
        </button>
        <button className="paygate-dismiss" onClick={onDismiss}>
          Continue editing
        </button>
      </div>
    </div>
  )
}
