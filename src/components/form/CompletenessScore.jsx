import React, { useMemo, useState } from 'react'

export default function CompletenessScore({ data }) {
  const [expanded, setExpanded] = useState(false)

  const { score, checks } = useMemo(() => {
    const items = [
      { id: 'name', label: 'Full Name', passed: !!data.personal?.name?.trim() },
      { id: 'title', label: 'Job Title', passed: !!data.personal?.title?.trim() },
      { id: 'email', label: 'Email Address', passed: !!data.personal?.email?.trim() },
      { id: 'summary', label: 'Professional Summary', passed: !!data.personal?.summary?.trim() },
      { id: 'exp', label: 'Add Work Experience', passed: data.experience?.length > 0 },
      { id: 'edu', label: 'Add Education', passed: data.education?.length > 0 },
      { id: 'skills', label: 'Add Skills', passed: data.skills?.length > 0 },
    ];
    
    const passedChecks = items.filter(c => c.passed).length;
    const computedScore = Math.round((passedChecks / items.length) * 100);
    return { score: computedScore, checks: items };
  }, [data])

  const circumference = 2 * Math.PI * 16; // r=16
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="completeness-widget">
      <div 
        className="completeness-header" 
        onClick={() => setExpanded(!expanded)}
      >
         <div className="completeness-ring">
            <svg width="40" height="40" viewBox="0 0 40 40">
               <circle cx="20" cy="20" r="16" fill="none" stroke="var(--glass-border)" strokeWidth="4" />
               <circle 
                  cx="20" cy="20" r="16" fill="none" 
                  stroke={score === 100 ? '#4ade80' : 'var(--accent)'} 
                  strokeWidth="4" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease-in-out, stroke 0.3s ease' }}
                  transform="rotate(-90 20 20)"
               />
            </svg>
            <div className="completeness-value">{score}%</div>
         </div>
         <div className="completeness-info">
            <h4>Resume Completeness</h4>
            <p>{score === 100 ? 'Looking great! Ready to download.' : 'Finish the checklist to improve your resume.'}</p>
         </div>
         <svg 
            className={`completeness-chevron ${expanded ? 'open' : ''}`} 
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         >
            <polyline points="6 9 12 15 18 9"/>
         </svg>
      </div>

      <div className={`completeness-dropdown ${expanded ? 'open' : ''}`}>
         <div className="completeness-checklist">
            {checks.map(check => (
               <div key={check.id} className={`checklist-item ${check.passed ? 'passed' : ''}`}>
                  <div className="checklist-icon">
                     {check.passed ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                     ) : (
                        <div className="checklist-circle" />
                     )}
                  </div>
                  <span>{check.label}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}
