import React, { useState } from 'react'
import { matchJobDescription, getAIUsesLeft } from '../../services/aiService'
import SectionWrapper from './SectionWrapper.jsx'

export default function JDMatcher({ resumeData, onChange, onToast }) {
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [selectedHighlights, setSelectedHighlights] = useState([])

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

      const keywords = missingMatch ? missingMatch[1].split(',').map(k => k.trim()).filter(k => k && k.toLowerCase() !== 'none') : []
      const highlights = highlightsMatch ? highlightsMatch[1].trim().split('\n').map(h => h.replace(/^[-•]\s*/, '').trim()).filter(h => h && h.length > 5) : []

      setResult({ keywords, highlights })
      setSelectedKeywords(keywords)
      setSelectedHighlights(highlights)
      
      const left = getAIUsesLeft()
      onToast(`Match complete! ${left} AI uses left.`, 'success')
    } catch (err) {
      onToast(err.message || 'Matching failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleKeyword = (kw) => {
    setSelectedKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    )
  }

  const toggleHighlight = (h) => {
    setSelectedHighlights(prev => 
      prev.includes(h) ? prev.filter(i => i !== h) : [...prev, h]
    )
  }

  const handleApply = () => {
    if (selectedKeywords.length === 0 && selectedHighlights.length === 0) {
      onToast('No changes selected to apply.', 'info')
      return
    }

    const newData = JSON.parse(JSON.stringify(resumeData))
    
    // 1. Apply keywords to skills
    if (selectedKeywords.length > 0) {
      const existingSkills = (newData.skills || []).map(s => s.toLowerCase())
      const newSkills = [...(newData.skills || [])]
      selectedKeywords.forEach(kw => {
        if (!existingSkills.includes(kw.toLowerCase())) {
          newSkills.push(kw)
        }
      })
      newData.skills = newSkills
    }

    // 2. Apply highlights to experience[0]
    if (selectedHighlights.length > 0) {
      if (!newData.experience || newData.experience.length === 0) {
        onToast('Add an experience entry first to include suggested highlights.', 'error')
        return
      } else {
        const firstExp = newData.experience[0]
        firstExp.bullets = [...(firstExp.bullets || []), ...selectedHighlights]
      }
    }

    onChange(newData)
    onToast('Selected improvements applied! Check your Skills and Experience sections.', 'success')
    setResult(null)
    setJd('')
  }

  return (
    <SectionWrapper 
      title="Optimize for a Job" 
      icon={<span className="matcher-section-icon">🎯</span>} 
      defaultOpen={false}
    >
      <div className="jd-matcher-content">
        {!result ? (
          <>
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
          </>
        ) : (
          <div className="jd-results">
            <div className="jd-results-header">
              <div className="jd-results-title">AI Matching Results</div>
              <p className="jd-results-subtitle">Select which improvements you'd like to implement. We'll automatically add them to the right sections.</p>
            </div>

            <div className="jd-result-section">
              <div className="jd-result-label">Missing Keywords</div>
              <div className="jd-keyword-checklist">
                {result.keywords.length > 0 ? result.keywords.map((kw, i) => (
                  <label key={i} className={`jd-keyword-pill ${selectedKeywords.includes(kw) ? 'selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedKeywords.includes(kw)} 
                      onChange={() => toggleKeyword(kw)} 
                    />
                    <span>{kw}</span>
                  </label>
                )) : <div className="jd-empty-msg">No missing keywords found! ✨</div>}
              </div>
            </div>

            <div className="jd-result-section">
              <div className="jd-result-label">Suggested Highlights</div>
              <div className="jd-highlights-checklist">
                {result.highlights.length > 0 ? result.highlights.map((h, i) => (
                  <label key={i} className={`jd-highlight-item ${selectedHighlights.includes(h) ? 'selected' : ''}`}>
                    <div className="jd-checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        checked={selectedHighlights.includes(h)} 
                        onChange={() => toggleHighlight(h)} 
                      />
                    </div>
                    <div className="jd-highlight-text">{h}</div>
                  </label>
                )) : <div className="jd-empty-msg">Your resume is already a great match! 🚀</div>}
              </div>
            </div>

            <div className="jd-actions">
              <button className="btn btn-ghost" onClick={() => setResult(null)}>Discard</button>
              <button 
                className="btn btn-primary" 
                onClick={handleApply}
                disabled={selectedKeywords.length === 0 && selectedHighlights.length === 0}
              >
                Apply Selected Changes
              </button>
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
          animation: fadeIn 0.4s ease;
        }
        .jd-results-header {
          margin-bottom: 20px;
        }
        .jd-results-title {
          font-weight: 700;
          font-size: 15px;
          color: var(--text);
          margin-bottom: 4px;
        }
        .jd-results-subtitle {
          font-size: 12px;
          color: var(--text-light);
          line-height: 1.4;
        }
        .jd-result-section {
          margin-bottom: 24px;
        }
        .jd-result-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--accent);
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        
        .jd-keyword-checklist {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .jd-keyword-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        .jd-keyword-pill:hover {
          border-color: var(--accent-soft);
          background: var(--glass-surface);
        }
        .jd-keyword-pill.selected {
          background: var(--accent-soft);
          color: var(--accent);
          border-color: var(--accent);
          font-weight: 600;
        }
        .jd-keyword-pill input {
          display: none;
        }
        
        .jd-highlights-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .jd-highlight-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .jd-highlight-item:hover {
          border-color: var(--accent-soft);
          background: var(--glass-surface);
        }
        .jd-highlight-item.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .jd-checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          padding-top: 2px;
        }
        .jd-highlight-text {
          font-size: 13px;
          color: var(--text);
          line-height: 1.5;
        }
        .jd-highlight-item.selected .jd-highlight-text {
          color: var(--text);
          font-weight: 500;
        }
        
        .jd-empty-msg {
          font-size: 12px;
          color: var(--text-lighter);
          font-style: italic;
          padding: 8px 0;
        }
        
        .jd-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
        }
        .jd-actions button {
          flex: 1;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </SectionWrapper>
  )
}
