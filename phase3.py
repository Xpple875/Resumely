#!/usr/bin/env python3
"""
Resumely — Phase 3 Script
Adds: Template selection screen, Modern + Minimal templates, loading states,
mobile responsiveness, UX polish throughout.

Run from INSIDE the resumely/ folder in PowerShell:
    python phase3.py
"""

import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  OK  {path}")

def append(path, content):
    with open(path, "a", encoding="utf-8") as f:
        f.write(content)
    print(f"  OK  {path} (appended)")

# ─────────────────────────────────────────────────────────────────────────────
# src/pages/TemplatePage.jsx — template selection screen
# ─────────────────────────────────────────────────────────────────────────────
write("src/pages/TemplatePage.jsx", """import React from 'react'
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
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/styles/template.css
# ─────────────────────────────────────────────────────────────────────────────
write("src/styles/template.css", """/* ── Template Selection Page ── */
.template-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 24px 80px;
}

.template-page__inner {
  width: 100%;
  max-width: 900px;
}

.template-logo {
  font-family: var(--font-heading);
  font-size: 22px;
  color: var(--text);
  margin-bottom: 32px;
}
.template-logo span { color: var(--accent); }

.template-page__header {
  margin-bottom: 40px;
}

.template-page__title {
  font-family: var(--font-heading);
  font-size: 36px;
  color: var(--text);
  margin-bottom: 8px;
}

.template-page__sub {
  font-size: 15px;
  color: var(--text-mid);
}

/* ── Grid ── */
.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

@media (max-width: 680px) {
  .template-grid {
    grid-template-columns: 1fr;
    max-width: 340px;
  }
}

/* ── Card ── */
.template-card {
  position: relative;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0;
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
  overflow: hidden;
}

.template-card:hover {
  border-color: var(--text-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(196,98,45,0.12);
}

.template-card__tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
  z-index: 1;
}

.template-card__preview {
  height: 220px;
  background: #E8E2DB;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.template-card__info {
  padding: 16px 18px;
}

.template-card__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.template-card__desc {
  font-size: 13px;
  color: var(--text-mid);
  line-height: 1.5;
}

.template-card__check {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  background: var(--accent);
  color: #fff;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Actions ── */
.template-page__actions {
  display: flex;
  justify-content: center;
}

.btn-lg {
  padding: 13px 28px;
  font-size: 15px;
  gap: 8px;
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/components/ResumePreview.jsx — supports classic, modern, minimal
# ─────────────────────────────────────────────────────────────────────────────
write("src/components/ResumePreview.jsx", """import React from 'react'
import '../styles/preview.css'

export default function ResumePreview({ data, template = 'classic' }) {
  if (template === 'modern')  return <ModernTemplate  data={data} />
  if (template === 'minimal') return <MinimalTemplate data={data} />
  return <ClassicTemplate data={data} />
}

// ── SHARED HELPERS ────────────────────────────────────────────────────────────
function ContactItems({ personal }) {
  const items = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.website,
  ].filter(Boolean)
  return items.map((item, i) => <span key={i}>{item}</span>)
}

function ExperienceEntries({ experience, accentColor }) {
  return (experience || []).filter(e => e.title || e.company).map(entry => (
    <div className="r-entry" key={entry.id}>
      <div className="r-entry-header">
        <span className="r-entry-title">{entry.title}</span>
        <span className="r-entry-dates">
          {[entry.startDate, entry.endDate].filter(Boolean).join(' – ')}
        </span>
      </div>
      <div className="r-entry-sub">
        {[entry.company, entry.location].filter(Boolean).join(' · ')}
      </div>
      {(entry.bullets || []).filter(b => b.trim()).length > 0 && (
        <ul className="r-entry-bullets">
          {entry.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  ))
}

function EducationEntries({ education }) {
  return (education || []).filter(e => e.degree || e.institution).map(entry => (
    <div className="r-entry" key={entry.id}>
      <div className="r-entry-header">
        <span className="r-entry-title">{entry.degree}</span>
        <span className="r-entry-dates">
          {[entry.startDate, entry.endDate].filter(Boolean).join(' – ')}
        </span>
      </div>
      <div className="r-entry-sub">{entry.institution}</div>
      {entry.gpa && <div style={{fontSize:'12px',color:'#A09894',marginTop:'2px'}}>{entry.gpa}</div>}
    </div>
  ))
}

function ProjectEntries({ projects }) {
  return (projects || []).filter(p => p.name).map(entry => (
    <div className="r-entry" key={entry.id}>
      <div className="r-entry-header">
        <span className="r-entry-title">{entry.name}</span>
        {entry.url && <span style={{fontSize:'12px',color:'#A09894'}}>{entry.url}</span>}
      </div>
      {entry.description && (
        <p style={{fontSize:'13px',marginTop:'4px',color:'#1A1714'}}>{entry.description}</p>
      )}
    </div>
  ))
}

// ── CLASSIC TEMPLATE ──────────────────────────────────────────────────────────
function ClassicTemplate({ data }) {
  const { personal, experience, education, skills, projects } = data
  return (
    <div className="resume-classic">
      <div className="r-header">
        <div className="r-name">{personal.name || 'Your Name'}</div>
        {personal.title && <div className="r-tagline">{personal.title}</div>}
        <div className="r-contact"><ContactItems personal={personal} /></div>
      </div>
      {personal.summary && (
        <div className="r-section">
          <div className="r-section-title">Summary</div>
          <p style={{fontSize:'13px',color:'#1A1714',lineHeight:'1.6'}}>{personal.summary}</p>
        </div>
      )}
      {(experience||[]).filter(e=>e.title||e.company).length > 0 && (
        <div className="r-section">
          <div className="r-section-title">Experience</div>
          <ExperienceEntries experience={experience} />
        </div>
      )}
      {(education||[]).filter(e=>e.degree||e.institution).length > 0 && (
        <div className="r-section">
          <div className="r-section-title">Education</div>
          <EducationEntries education={education} />
        </div>
      )}
      {(skills||[]).length > 0 && (
        <div className="r-section">
          <div className="r-section-title">Skills</div>
          <div className="r-skills-grid">
            {skills.map(s => <span className="r-skill-pill" key={s}>{s}</span>)}
          </div>
        </div>
      )}
      {(projects||[]).filter(p=>p.name).length > 0 && (
        <div className="r-section">
          <div className="r-section-title">Projects</div>
          <ProjectEntries projects={projects} />
        </div>
      )}
    </div>
  )
}

// ── MODERN TEMPLATE ───────────────────────────────────────────────────────────
function ModernTemplate({ data }) {
  const { personal, experience, education, skills, projects } = data
  return (
    <div className="resume-modern">
      {/* Dark header band */}
      <div className="rm-header">
        <div className="rm-name">{personal.name || 'Your Name'}</div>
        {personal.title && <div className="rm-title">{personal.title}</div>}
      </div>
      {/* Contact strip */}
      <div className="rm-contact">
        <ContactItems personal={personal} />
      </div>
      <div className="rm-body">
        {personal.summary && (
          <div className="rm-section">
            <div className="rm-section-title">Summary</div>
            <p className="rm-prose">{personal.summary}</p>
          </div>
        )}
        {(experience||[]).filter(e=>e.title||e.company).length > 0 && (
          <div className="rm-section">
            <div className="rm-section-title">Experience</div>
            <ExperienceEntries experience={experience} />
          </div>
        )}
        {(education||[]).filter(e=>e.degree||e.institution).length > 0 && (
          <div className="rm-section">
            <div className="rm-section-title">Education</div>
            <EducationEntries education={education} />
          </div>
        )}
        {(skills||[]).length > 0 && (
          <div className="rm-section">
            <div className="rm-section-title">Skills</div>
            <div className="r-skills-grid">
              {skills.map(s => <span className="rm-skill-pill" key={s}>{s}</span>)}
            </div>
          </div>
        )}
        {(projects||[]).filter(p=>p.name).length > 0 && (
          <div className="rm-section">
            <div className="rm-section-title">Projects</div>
            <ProjectEntries projects={projects} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── MINIMAL TEMPLATE ──────────────────────────────────────────────────────────
function MinimalTemplate({ data }) {
  const { personal, experience, education, skills, projects } = data
  return (
    <div className="resume-minimal">
      <div className="rmin-header">
        <div className="rmin-name">{personal.name || 'Your Name'}</div>
        {personal.title && <div className="rmin-title">{personal.title}</div>}
        <div className="rmin-contact"><ContactItems personal={personal} /></div>
      </div>
      {personal.summary && (
        <div className="rmin-section">
          <div className="rmin-section-title">Summary</div>
          <p className="rmin-prose">{personal.summary}</p>
        </div>
      )}
      {(experience||[]).filter(e=>e.title||e.company).length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Experience</div>
          <ExperienceEntries experience={experience} />
        </div>
      )}
      {(education||[]).filter(e=>e.degree||e.institution).length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Education</div>
          <EducationEntries education={education} />
        </div>
      )}
      {(skills||[]).length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Skills</div>
          <div className="rmin-skills">
            {skills.join('  ·  ')}
          </div>
        </div>
      )}
      {(projects||[]).filter(p=>p.name).length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Projects</div>
          <ProjectEntries projects={projects} />
        </div>
      )}
    </div>
  )
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/styles/preview.css — add Modern + Minimal template styles
# ─────────────────────────────────────────────────────────────────────────────
write("src/styles/preview.css", """/* ── Resume Preview Shell ── */
.resume-preview-wrapper {
  width: 794px;
  min-height: 1123px;
  background: #fff;
  box-shadow: var(--shadow-lg);
  border-radius: 2px;
  flex-shrink: 0;
}

/* ── SHARED entry styles (used by all templates) ── */
.r-entry { margin-bottom: 14px; }
.r-entry:last-child { margin-bottom: 0; }
.r-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.r-entry-title { font-size: 13.5px; font-weight: 600; color: #1A1714; }
.r-entry-dates { font-size: 12px; color: #A09894; white-space: nowrap; flex-shrink: 0; }
.r-entry-sub { font-size: 13px; color: #6B6460; font-weight: 500; margin-top: 1px; margin-bottom: 5px; }
.r-entry-bullets { padding-left: 16px; list-style: disc; margin-top: 4px; }
.r-entry-bullets li { margin-bottom: 3px; color: #1A1714; font-size: 13px; }

/* ── CLASSIC ── */
.resume-classic {
  width: 100%;
  min-height: 1123px;
  padding: 56px 60px;
  font-family: 'Geist', system-ui, sans-serif;
  color: #1A1714;
  font-size: 13px;
  line-height: 1.55;
}
.resume-classic .r-header { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #1A1714; }
.resume-classic .r-name { font-family: 'Instrument Serif', Georgia, serif; font-size: 34px; font-weight: 400; line-height: 1.1; color: #1A1714; margin-bottom: 6px; }
.resume-classic .r-tagline { font-size: 14px; font-weight: 500; color: #C4622D; margin-bottom: 10px; }
.resume-classic .r-contact { display: flex; flex-wrap: wrap; gap: 4px 20px; font-size: 12.5px; color: #6B6460; }
.resume-classic .r-section { margin-bottom: 24px; }
.resume-classic .r-section-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 14px; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase; color: #1A1714; border-bottom: 1px solid #E2DAD4; padding-bottom: 5px; margin-bottom: 14px; }
.resume-classic .r-skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.resume-classic .r-skill-pill { background: #F6F1EC; color: #1A1714; font-size: 12.5px; padding: 3px 10px; border-radius: 3px; border: 1px solid #E2DAD4; }

/* ── MODERN ── */
.resume-modern {
  width: 100%;
  min-height: 1123px;
  font-family: 'Geist', system-ui, sans-serif;
  color: #1A1714;
  font-size: 13px;
  line-height: 1.55;
}
.resume-modern .rm-header { background: #1A1714; padding: 36px 52px 28px; }
.resume-modern .rm-name { font-family: 'Instrument Serif', Georgia, serif; font-size: 36px; font-weight: 400; color: #FDFAF7; line-height: 1.1; margin-bottom: 6px; }
.resume-modern .rm-title { font-size: 13px; font-weight: 500; color: #C4622D; letter-spacing: 0.3px; }
.resume-modern .rm-contact { background: #F0E6DF; padding: 10px 52px; display: flex; flex-wrap: wrap; gap: 4px 24px; font-size: 12px; color: #6B6460; }
.resume-modern .rm-body { padding: 32px 52px 52px; }
.resume-modern .rm-section { margin-bottom: 24px; }
.resume-modern .rm-section-title { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #C4622D; border-bottom: 1px solid #E2DAD4; padding-bottom: 5px; margin-bottom: 14px; }
.resume-modern .rm-prose { font-size: 13px; color: #1A1714; line-height: 1.6; }
.resume-modern .r-skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.resume-modern .rm-skill-pill { background: #F0E6DF; color: #C4622D; font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 3px; }

/* ── MINIMAL ── */
.resume-minimal {
  width: 100%;
  min-height: 1123px;
  padding: 64px 68px;
  font-family: 'Geist', system-ui, sans-serif;
  color: #1A1714;
  font-size: 13px;
  line-height: 1.6;
}
.resume-minimal .rmin-header { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E2DAD4; }
.resume-minimal .rmin-name { font-family: 'Instrument Serif', Georgia, serif; font-size: 38px; font-weight: 400; color: #1A1714; line-height: 1.1; margin-bottom: 6px; }
.resume-minimal .rmin-title { font-size: 13px; color: #6B6460; margin-bottom: 12px; }
.resume-minimal .rmin-contact { display: flex; flex-wrap: wrap; gap: 4px 20px; font-size: 12px; color: #A09894; }
.resume-minimal .rmin-section { margin-bottom: 28px; display: grid; grid-template-columns: 110px 1fr; gap: 0 24px; }
.resume-minimal .rmin-section-title { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #A09894; padding-top: 2px; }
.resume-minimal .rmin-prose { font-size: 13px; color: #1A1714; line-height: 1.6; }
.resume-minimal .rmin-skills { font-size: 13px; color: #6B6460; }

/* ── Print ── */
@media print {
  .resume-preview-wrapper { box-shadow: none; border-radius: 0; }
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/App.jsx — add template selection flow
# ─────────────────────────────────────────────────────────────────────────────
write("src/App.jsx", """import React, { useState } from 'react'
import TemplatePage from './pages/TemplatePage.jsx'
import BuilderPage from './pages/BuilderPage.jsx'

export default function App() {
  const [screen, setScreen]     = useState('template')  // 'template' | 'builder'
  const [template, setTemplate] = useState('classic')

  if (screen === 'builder') {
    return <BuilderPage template={template} onChangeTemplate={() => setScreen('template')} />
  }

  return (
    <TemplatePage
      selected={template}
      onSelect={setTemplate}
      onContinue={() => setScreen('builder')}
    />
  )
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# src/pages/BuilderPage.jsx — accept template prop, add Change Template button
# ─────────────────────────────────────────────────────────────────────────────
write("src/pages/BuilderPage.jsx", """import React, { useState } from 'react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import ToastContainer from '../components/ToastContainer.jsx'
import { generatePDF } from '../utils/pdfExport.js'
import { defaultResumeData } from '../utils/defaultData.js'
import { useAutosave, loadDraft, clearDraft } from '../hooks/useAutosave.js'
import { useToast } from '../hooks/useToast.js'
import '../styles/builder.css'

function getInitialData() {
  const draft = loadDraft()
  return draft || defaultResumeData
}

export default function BuilderPage({ template = 'classic', onChangeTemplate }) {
  const [resumeData, setResumeData]   = useState(getInitialData)
  const [isExporting, setIsExporting] = useState(false)
  const [mobileTab, setMobileTab]     = useState('form')  // 'form' | 'preview'
  const { toasts, showToast }         = useToast()

  useAutosave(resumeData)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await generatePDF(null, resumeData, resumeData.personal.name || 'resume')
      showToast('PDF downloaded!', 'success')
    } catch (err) {
      console.error('PDF export failed:', err)
      showToast('PDF export failed — try again.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearDraft = () => {
    clearDraft()
    setResumeData(defaultResumeData)
    showToast('Draft cleared.', 'info')
  }

  return (
    <div className="builder-layout">
      <header className="builder-header">
        <div className="builder-header__logo">
          Resum<span>e</span>ly
        </div>
        <div className="builder-header__actions">
          {/* Mobile tab switcher */}
          <div className="mobile-tabs">
            <button
              className={`mobile-tab ${mobileTab === 'form' ? 'active' : ''}`}
              onClick={() => setMobileTab('form')}
            >Edit</button>
            <button
              className={`mobile-tab ${mobileTab === 'preview' ? 'active' : ''}`}
              onClick={() => setMobileTab('preview')}
            >Preview</button>
          </div>
          <button className="btn btn-ghost" onClick={onChangeTemplate} title="Change template">
            <TemplateIcon /> <span className="hide-mobile">Template</span>
          </button>
          <button className="btn btn-ghost" onClick={handleClearDraft} title="Clear draft">
            <span className="hide-mobile">Clear</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <><SpinnerIcon /> <span className="hide-mobile">Exporting…</span></> : <><DownloadIcon /> <span className="hide-mobile">Download PDF</span></>}
          </button>
        </div>
      </header>

      <aside className={`form-panel ${mobileTab === 'preview' ? 'mobile-hidden' : ''}`}>
        <ResumeForm
          data={resumeData}
          onChange={setResumeData}
          onToast={showToast}
        />
      </aside>

      <main className={`preview-panel ${mobileTab === 'form' ? 'mobile-hidden' : ''}`}>
        <div className="resume-preview-wrapper">
          <ResumePreview data={resumeData} template={template} />
        </div>
      </main>

      <div className="download-bar">
        <button
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Generating PDF…' : 'Download PDF'}
        </button>
        <button className="btn btn-secondary" onClick={onChangeTemplate}>
          <TemplateIcon />
        </button>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 0.8s linear infinite'}}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
function TemplateIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}
""")

# ─────────────────────────────────────────────────────────────────────────────
# Append mobile + polish styles to builder.css
# ─────────────────────────────────────────────────────────────────────────────
append("src/styles/builder.css", """
/* ── Mobile tabs ── */
.mobile-tabs {
  display: none;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 2px;
}
.mobile-tab {
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--text-mid);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition);
  background: none;
  border: none;
}
.mobile-tab.active {
  background: var(--bg-card);
  color: var(--text);
  box-shadow: var(--shadow-sm);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .builder-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 56px 1fr;
  }
  .mobile-tabs { display: flex; }
  .hide-mobile { display: none; }
  .form-panel  { border-right: none; border-bottom: 1px solid var(--border); }
  .download-bar { width: 100%; }
  .mobile-hidden { display: none !important; }
  .preview-panel {
    padding: 16px;
  }
  .resume-preview-wrapper {
    width: 100%;
    transform-origin: top left;
    /* Scale down A4 preview to fit mobile screen */
    transform: scale(0.45);
    margin-bottom: -54%;
  }
}

@media (max-width: 480px) {
  .resume-preview-wrapper {
    transform: scale(0.38);
    margin-bottom: -62%;
  }
}
""")

print("""
All Phase 3 files written.

In PowerShell:
    npm run dev

Then deploy:
    vercel --prod
""")
