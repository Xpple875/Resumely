import React, { useState } from 'react'
import '../styles/payment.css'

export default function DownloadOptionsModal({ onDismiss, onDownload, unlocked, userId }) {
  const bmacUrl = `https://buymeacoffee.com/resumely?name=${userId || 'Anonymous'}`;

  return (
    <div className="paygate-overlay" onClick={onDismiss}>
      <div className="paygate-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px 30px', maxWidth: '450px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>{unlocked ? '📥' : '☕'}</div>
        <div className="paygate-title">{unlocked ? 'Download Resume' : 'Support Resumely'}</div>
        
        {!unlocked && (
          <div className="paygate-sub" style={{ marginBottom: '25px', fontSize: '15px', color: 'var(--text-mid)', lineHeight: '1.6' }}>
            Right now, Resumely is <strong>entirely free</strong> as a promotional offer.
            <br /><br />
            Server and AI costs are adding up fast though. 
            If you find this tool helpful, please consider supporting with a coffee!
          </div>
        )}

        {!unlocked && (
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '20px' }}
            onClick={() => window.open(bmacUrl, '_blank')}
          >
            Support with a coffee
          </button>
        )}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          marginTop: unlocked ? '20px' : '0',
          borderTop: unlocked ? 'none' : '1px solid var(--border)',
          paddingTop: unlocked ? '0' : '20px'
        }}>
          {!unlocked && <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>Or proceed with free download:</p>}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, justifyContent: 'center', padding: '14px 0', fontSize: '14px' }}
              onClick={() => onDownload('pdf')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span style={{ fontWeight: '600' }}>PDF Format</span>
              </div>
            </button>
            <button 
              className="btn btn-primary" 
              style={{ 
                flex: 1, 
                justifyContent: 'center', 
                padding: '14px 0', 
                fontSize: '14px', 
                background: 'var(--text)', 
                color: 'var(--bg)',
                boxShadow: 'var(--shadow-md)'
              }}
              onClick={() => onDownload('docx')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span style={{ fontWeight: '600' }}>DOCX Format</span>
              </div>
            </button>
          </div>

        </div>

        <button 
          className="btn btn-ghost" 
          onClick={onDismiss}
          style={{ marginTop: '20px', width: '100%', opacity: 0.6 }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
