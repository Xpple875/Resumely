import React from 'react'
import { TEMPLATES } from '../pages/TemplatePage.jsx' // we'll need to export TEMPLATES from there
import '../styles/builder.css' // we'll add some modal styles

// Tiny SVG sketch of each template layout — purely decorative
function TemplatePreview({ id }) {
  if (id === 'classic') return (
    <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="160" height="200" fill="#FDFAF7"/>
      <rect x="16" y="18" width="80" height="8" rx="2" fill="#1A1714"/>
      <rect x="16" y="30" width="50" height="4" rx="1" fill="#C4622D"/>
      <rect x="16" y="38" width="35" height="2.5" rx="1" fill="#A09894"/>
      <rect x="56" y="38" width="35" height="2.5" rx="1" fill="#A09894"/>
      <line x1="16" y1="46" x2="144" y2="46" stroke="#1A1714" strokeWidth="0.8"/>
      <rect x="16" y="54" width="40" height="3" rx="1" fill="#1A1714"/>
      <line x1="16" y1="60" x2="144" y2="60" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="16" y="65" width="55" height="3" rx="1" fill="#1A1714"/>
      <rect x="100" y="65" width="30" height="3" rx="1" fill="#A09894"/>
      <rect x="16" y="71" width="40" height="2.5" rx="1" fill="#6B6460"/>
    </svg>
  )
  if (id === 'modern') return (
    <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="160" height="200" fill="#FDFAF7"/>
      <rect width="160" height="28" fill="#1A1714"/>
      <rect x="16" y="8" width="70" height="7" rx="2" fill="#FDFAF7"/>
      <rect x="16" y="18" width="40" height="3" rx="1" fill="#C4622D"/>
      <rect width="160" height="14" y="28" fill="#F0E6DF"/>
      <rect x="16" y="32" width="30" height="2.5" rx="1" fill="#6B6460"/>
      <rect x="52" y="32" width="30" height="2.5" rx="1" fill="#6B6460"/>
      <rect x="16" y="52" width="40" height="3" rx="1" fill="#C4622D"/>
      <line x1="16" y1="58" x2="144" y2="58" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="16" y="63" width="55" height="3" rx="1" fill="#1A1714"/>
      <rect x="100" y="63" width="30" height="3" rx="1" fill="#A09894"/>
      <rect x="16" y="69" width="40" height="2.5" rx="1" fill="#6B6460"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="160" height="200" fill="#FDFAF7"/>
      <rect x="16" y="20" width="90" height="9" rx="2" fill="#1A1714"/>
      <rect x="16" y="33" width="45" height="3" rx="1" fill="#6B6460"/>
      <rect x="16" y="40" width="30" height="2.5" rx="1" fill="#A09894"/>
      <rect x="52" y="40" width="30" height="2.5" rx="1" fill="#A09894"/>
      <line x1="16" y1="50" x2="144" y2="50" stroke="#E2DAD4" strokeWidth="0.4"/>
      <rect x="16" y="58" width="38" height="2.5" rx="1" fill="#A09894"/>
      <line x1="16" y1="64" x2="144" y2="64" stroke="#E2DAD4" strokeWidth="0.3"/>
      <rect x="16" y="69" width="55" height="3" rx="1" fill="#1A1714"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

const TEMPLATES = [
  { id: 'classic', name: 'Classic', tag: 'Most Popular' },
  { id: 'modern',  name: 'Modern',  tag: 'New' },
  { id: 'minimal', name: 'Minimal', tag: null },
]

export default function TemplateModal({ isOpen, onClose, currentTemplate, onSelectTemplate }) {
  if (!isOpen) return null;

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={e => e.stopPropagation()}>
        <div className="template-modal__header">
          <h2>Change Template</h2>
          <button className="template-modal__close" onClick={onClose}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div className="template-modal__grid">
          {TEMPLATES.map(t => {
             const isSelected = currentTemplate === t.id;
             return (
               <button
                 key={t.id}
                 className={`template-modal__card ${isSelected ? 'selected' : ''}`}
                 onClick={() => {
                   onSelectTemplate(t.id);
                   onClose();
                 }}
               >
                 {t.tag && <div className="template-modal__card-tag">{t.tag}</div>}
                 <div className="template-modal__card-preview">
                   <TemplatePreview id={t.id} />
                 </div>
                 <div className="template-modal__card-name">{t.name}</div>
                 {isSelected && (
                   <div className="template-modal__card-check"><CheckIcon /></div>
                 )}
               </button>
             )
          })}
        </div>
      </div>
    </div>
  )
}
