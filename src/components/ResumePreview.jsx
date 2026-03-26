import React from 'react'
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
