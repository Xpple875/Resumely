import React from 'react'
import '../styles/template.css'

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean serif headings, traditional layout. Best ATS compatibility.',
    tag: 'Most Popular',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Accent sidebar, bold name treatment. Stands out while staying ATS-safe.',
    tag: 'New',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Pure whitespace, no decoration. Lets your content do the talking.',
    tag: null,
  },
]

export default function TemplatePage({ selected, onSelect, onContinue }) {
  return (
    <div className="template-page">
      <div className="template-page__inner">
        <div className="template-page__header">
          <div className="template-logo">Resum<span>e</span>ly</div>
          <h1 className="template-page__title">Choose your template</h1>
          <p className="template-page__sub">All three are ATS-tested. You can change this later.</p>
        </div>

        <div className="template-grid">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              className={`template-card ${selected === t.id ? 'selected' : ''}`}
              onClick={() => onSelect(t.id)}
            >
              {t.tag && <div className="template-card__tag">{t.tag}</div>}
              <div className="template-card__preview">
                <TemplatePreview id={t.id} />
              </div>
              <div className="template-card__info">
                <div className="template-card__name">{t.name}</div>
                <div className="template-card__desc">{t.description}</div>
              </div>
              {selected === t.id && (
                <div className="template-card__check">
                  <CheckIcon />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="template-page__actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={onContinue}
            disabled={!selected}
          >
            Continue with {TEMPLATES.find(t => t.id === selected)?.name || '…'}
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

// Tiny SVG sketch of each template layout — purely decorative
function TemplatePreview({ id }) {
  if (id === 'classic') return (
    <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="160" height="200" fill="#FDFAF7"/>
      {/* Name */}
      <rect x="16" y="18" width="80" height="8" rx="2" fill="#1A1714"/>
      {/* Title */}
      <rect x="16" y="30" width="50" height="4" rx="1" fill="#C4622D"/>
      {/* Contact */}
      <rect x="16" y="38" width="35" height="2.5" rx="1" fill="#A09894"/>
      <rect x="56" y="38" width="35" height="2.5" rx="1" fill="#A09894"/>
      {/* Divider */}
      <line x1="16" y1="46" x2="144" y2="46" stroke="#1A1714" strokeWidth="0.8"/>
      {/* Section */}
      <rect x="16" y="54" width="40" height="3" rx="1" fill="#1A1714"/>
      <line x1="16" y1="60" x2="144" y2="60" stroke="#E2DAD4" strokeWidth="0.5"/>
      {/* Entry */}
      <rect x="16" y="65" width="55" height="3" rx="1" fill="#1A1714"/>
      <rect x="100" y="65" width="30" height="3" rx="1" fill="#A09894"/>
      <rect x="16" y="71" width="40" height="2.5" rx="1" fill="#6B6460"/>
      <rect x="20" y="77" width="110" height="2" rx="1" fill="#6B6460" opacity="0.6"/>
      <rect x="20" y="82" width="95" height="2" rx="1" fill="#6B6460" opacity="0.6"/>
      <rect x="20" y="87" width="100" height="2" rx="1" fill="#6B6460" opacity="0.6"/>
      {/* Section 2 */}
      <rect x="16" y="100" width="40" height="3" rx="1" fill="#1A1714"/>
      <line x1="16" y1="106" x2="144" y2="106" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="16" y="111" width="55" height="3" rx="1" fill="#1A1714"/>
      <rect x="100" y="111" width="30" height="3" rx="1" fill="#A09894"/>
      <rect x="16" y="117" width="40" height="2.5" rx="1" fill="#6B6460"/>
      {/* Skills */}
      <rect x="16" y="132" width="40" height="3" rx="1" fill="#1A1714"/>
      <line x1="16" y1="138" x2="144" y2="138" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="16" y="143" width="24" height="8" rx="2" fill="#F6F1EC" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="44" y="143" width="28" height="8" rx="2" fill="#F6F1EC" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="76" y="143" width="20" height="8" rx="2" fill="#F6F1EC" stroke="#E2DAD4" strokeWidth="0.5"/>
    </svg>
  )
  if (id === 'modern') return (
    <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="160" height="200" fill="#FDFAF7"/>
      {/* Accent bar top */}
      <rect width="160" height="28" fill="#1A1714"/>
      <rect x="16" y="8" width="70" height="7" rx="2" fill="#FDFAF7"/>
      <rect x="16" y="18" width="40" height="3" rx="1" fill="#C4622D"/>
      {/* Contact bar */}
      <rect width="160" height="14" y="28" fill="#F0E6DF"/>
      <rect x="16" y="32" width="30" height="2.5" rx="1" fill="#6B6460"/>
      <rect x="52" y="32" width="30" height="2.5" rx="1" fill="#6B6460"/>
      <rect x="88" y="32" width="30" height="2.5" rx="1" fill="#6B6460"/>
      {/* Section */}
      <rect x="16" y="52" width="40" height="3" rx="1" fill="#C4622D"/>
      <line x1="16" y1="58" x2="144" y2="58" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="16" y="63" width="55" height="3" rx="1" fill="#1A1714"/>
      <rect x="100" y="63" width="30" height="3" rx="1" fill="#A09894"/>
      <rect x="16" y="69" width="40" height="2.5" rx="1" fill="#6B6460"/>
      <rect x="20" y="75" width="110" height="2" rx="1" fill="#6B6460" opacity="0.6"/>
      <rect x="20" y="80" width="95" height="2" rx="1" fill="#6B6460" opacity="0.6"/>
      <rect x="20" y="85" width="100" height="2" rx="1" fill="#6B6460" opacity="0.6"/>
      {/* Section 2 */}
      <rect x="16" y="98" width="40" height="3" rx="1" fill="#C4622D"/>
      <line x1="16" y1="104" x2="144" y2="104" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="16" y="109" width="55" height="3" rx="1" fill="#1A1714"/>
      <rect x="100" y="109" width="30" height="3" rx="1" fill="#A09894"/>
      <rect x="16" y="115" width="40" height="2.5" rx="1" fill="#6B6460"/>
      {/* Skills */}
      <rect x="16" y="130" width="40" height="3" rx="1" fill="#C4622D"/>
      <line x1="16" y1="136" x2="144" y2="136" stroke="#E2DAD4" strokeWidth="0.5"/>
      <rect x="16" y="141" width="24" height="8" rx="2" fill="#F0E6DF"/>
      <rect x="44" y="141" width="28" height="8" rx="2" fill="#F0E6DF"/>
      <rect x="76" y="141" width="20" height="8" rx="2" fill="#F0E6DF"/>
    </svg>
  )
  // minimal
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
      <rect x="100" y="69" width="30" height="2.5" rx="1" fill="#A09894"/>
      <rect x="16" y="75" width="38" height="2.5" rx="1" fill="#6B6460"/>
      <rect x="16" y="82" width="110" height="2" rx="1" fill="#6B6460" opacity="0.5"/>
      <rect x="16" y="87" width="95" height="2" rx="1" fill="#6B6460" opacity="0.5"/>
      <rect x="16" y="92" width="100" height="2" rx="1" fill="#6B6460" opacity="0.5"/>
      <rect x="16" y="105" width="38" height="2.5" rx="1" fill="#A09894"/>
      <line x1="16" y1="111" x2="144" y2="111" stroke="#E2DAD4" strokeWidth="0.3"/>
      <rect x="16" y="116" width="55" height="3" rx="1" fill="#1A1714"/>
      <rect x="100" y="116" width="30" height="2.5" rx="1" fill="#A09894"/>
      <rect x="16" y="122" width="38" height="2.5" rx="1" fill="#6B6460"/>
      <rect x="16" y="136" width="38" height="2.5" rx="1" fill="#A09894"/>
      <line x1="16" y1="142" x2="144" y2="142" stroke="#E2DAD4" strokeWidth="0.3"/>
      <rect x="16" y="147" width="20" height="2.5" rx="1" fill="#6B6460" opacity="0.7"/>
      <rect x="42" y="147" width="25" height="2.5" rx="1" fill="#6B6460" opacity="0.7"/>
      <rect x="73" y="147" width="18" height="2.5" rx="1" fill="#6B6460" opacity="0.7"/>
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
function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}
