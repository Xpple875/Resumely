import React, { useState } from 'react'
import { matchJobDescription, getAIUsesLeft } from '../../services/aiService'

export default function JDMatcher({ resumeData, onToast }) {
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleMatch = async () => {
    if (!jd.trim()) {
      onToast('Please paste a job description first.', 'error')
      return
    }
    setLoading(true)
    try {
      const aiResponse = await matchJobDescription(resumeData, jd)
      
      // Parse the AI response
      const missingMatch = aiResponse.match(/MISSING KEYWORDS:\s*(.*)/i)
      const highlightsMatch = aiResponse.match(/SUGGESTED HIGHLIGHTS:\s*([\s\S]*)/i)

      setResult({
        keywords: missingMatch ? missingMatch[1].split(',').map(k => k.trim()) : [],
        highlights: highlightsMatch ? highlightsMatch[1].trim().split('\n').map(h => h.replace(/^[-•]\s*/, '').trim()) : []
      })
      
      const left = getAIUsesLeft()
      onToast(`Match complete! ${left} AI uses left.`, 'success')
    } catch (err) {
      onToast(err.message || 'Matching failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="jd-matcher-collapsed" onClick={() => setIsOpen(true)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="jd-matcher-icon">🎯</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Optimize for a Job</div>
            <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Paste a job description to see missing keywords.</div>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '12px' }}>Open Matcher</button>
      </div>
    )
  }

  return (
    <div className="jd-matcher-expanded">
      <div className="jd-matcher-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎯</span>
          <span style={{ fontWeight: 600 }}>Job Description Matcher</span>
        </div>
        <button className="btn-close-sm" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div className="jd-matcher-content">
        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px' }}>
          Paste the job description below. Our AI will analyze your resume against these requirements.
        </p>
        
        <textarea
          className="jd-textarea"
          placeholder="Paste the job description here..."
          value={jd}
          onChange={e => setJd(e.target.value)}
          rows={5}
        />

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '12px' }}
          onClick={handleMatch}
          disabled={loading || !jd.trim()}
        >
          {loading ? 'Analyzing...' : 'Match Resume to Job'}
        </button>

        {result && (
          <div className="jd-results">
            <div className="jd-result-section">
              <div className="jd-result-label">Missing Keywords</div>
              <div className="jd-keyword-tags">
                {result.keywords.length > 0 ? result.keywords.map((kw, i) => (
                  <span key={i} className="jd-keyword-tag">{kw}</span>
                )) : <span style={{fontSize: '12px', color: 'var(--text-lighter)'}}>No missing keywords found!</span>}
              </div>
            </div>

            <div className="jd-result-section">
              <div className="jd-result-label">Suggested Highlights</div>
              <ul className="jd-highlights-list">
                {result.highlights.length > 0 ? result.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                )) : <li style={{color: 'var(--text-lighter)'}}>Your resume is already a great match!</li>}
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .jd-matcher-collapsed {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 24px;
        }
        .jd-matcher-collapsed:hover {
          border-color: var(--accent);
          background: var(--glass-bg);
          transform: translateY(-2px);
        }
        .jd-matcher-icon {
          width: 36px;
          height: 36px;
          background: var(--accent-soft);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .jd-matcher-expanded {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          margin-bottom: 24px;
          overflow: hidden;
          animation: slideDown 0.3s ease;
        }
        .jd-matcher-header {
          padding: 12px 20px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .jd-matcher-content {
          padding: 20px;
        }
        .jd-textarea {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px;
          color: var(--text);
          font-size: 13px;
          resize: vertical;
        }
        .btn-close-sm {
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 20px;
          cursor: pointer;
          padding: 0 5px;
        }
        .jd-results {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--glass-border);
          animation: fadeIn 0.4s ease;
        }
        .jd-result-section {
          margin-bottom: 16px;
        }
        .jd-result-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--accent);
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .jd-keyword-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .jd-keyword-tag {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(196, 98, 45, 0.1);
        }
        .jd-highlights-list {
          padding-left: 18px;
          margin: 0;
        }
        .jd-highlights-list li {
          font-size: 13px;
          color: var(--text);
          margin-bottom: 6px;
          line-height: 1.4;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
