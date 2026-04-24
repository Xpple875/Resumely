import React, { useState } from 'react'
import { matchJobDescription, getAIUsesLeft } from '../../services/aiService'
import SectionWrapper from './SectionWrapper.jsx'

export default function JDMatcher({ resumeData, onToast }) {
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

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

  return (
    <SectionWrapper 
      title="Optimize for a Job" 
      icon={<span className="matcher-section-icon">🎯</span>} 
      defaultOpen={false}
    >
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
        .matcher-section-icon {
          font-size: 18px;
          margin-right: 2px;
        }
        .jd-matcher-content {
          padding: 8px 4px;
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
          transition: var(--transition);
        }
        .jd-textarea:focus {
          border-color: var(--accent);
          outline: none;
          box-shadow: 0 0 0 2px var(--accent-soft);
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </SectionWrapper>
  )
}
