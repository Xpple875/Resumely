import React from 'react'
import SectionWrapper from './SectionWrapper.jsx'

export default function SectionManager({ order, labels, onOrderChange, onLabelChange }) {
  const move = (idx, direction) => {
    const newOrder = [...order]
    const target = idx + direction
    if (target < 0 || target >= newOrder.length) return
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]]
    onOrderChange(newOrder)
  }

  const updateLabel = (key, val) => {
    onLabelChange({ ...labels, [key]: val })
  }

  return (
    <SectionWrapper title="Manage Sections" icon={<SettingsIcon />} defaultOpen={false}>
      <div className="section-manager">
        <p style={{ fontSize: '0.85em', color: 'var(--text-light)', marginBottom: '16px' }}>
          Reorder sections or rename headers. Only sections with content will show on the resume.
        </p>
        
        {order.map((key, idx) => (
          <div key={key} className="manager-row">
            <div className="manager-row__drag">
               <button onClick={() => move(idx, -1)} disabled={idx === 0} title="Move Up">
                  <ChevronUpIcon />
               </button>
               <button onClick={() => move(idx, 1)} disabled={idx === order.length - 1} title="Move Down">
                  <ChevronDownIcon />
               </button>
            </div>
            
            <div className="field" style={{ flex: 1, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span style={{ fontSize: '0.75em', color: '#999', textTransform: 'uppercase', minWidth: '40px' }}>Label:</span>
               <input 
                  type="text" 
                  value={labels[key] || ''} 
                  onChange={e => updateLabel(key, e.target.value)}
                  placeholder={key.toUpperCase()}
                  style={{ flex: 1 }}
               />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .section-manager { display: flex; flex-direction: column; gap: 8px; }
        .manager-row { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          background: var(--bg-card); 
          padding: 10px 14px; 
          border-radius: var(--radius-md); 
          border: 1px solid var(--border); 
          transition: border-color 0.15s ease;
        }
        .manager-row:hover {
          border-color: var(--accent);
        }
        .manager-row__drag { display: flex; flex-direction: column; gap: 4px; }
        .manager-row__drag button { 
          background: var(--bg); 
          border: 1px solid var(--border); 
          cursor: pointer; 
          padding: 4px; 
          border-radius: 4px; 
          color: var(--text-light); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: all 0.15s ease;
        }
        .manager-row__drag button:hover:not(:disabled) { 
          background: var(--accent-soft); 
          color: var(--accent); 
          border-color: var(--accent); 
        }
        .manager-row__drag button:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </SectionWrapper>
  )
}

function SettingsIcon() {
  return (
    <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

function ChevronUpIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
}
function ChevronDownIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
}
