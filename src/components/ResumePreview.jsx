
import React from 'react'
import '../styles/preview.css'

export default function ResumePreview({ data, template = 'classic' }) {
  // 1. Ultimate Safety Check
  if (!data || !data.personal) return null;

  const { personal, experience = [], education = [], skills = [], projects = [] } = data;

  return (
    <div className="resume-container">
      {/* global-paper-flow uses your CSS to create visual A4 gaps */}
      <div className={`resume-${template} global-paper-flow`}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
            {personal.name || 'YOUR NAME'}
          </h1>
          {personal.title && (
            <div style={{ color: '#C4622D', fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase' }}>
              {personal.title}
            </div>
          )}
          <div style={{ marginTop: '10px', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {personal.email && <span>📧 {personal.email}</span>}
            {personal.phone && <span>📞 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
            {personal.linkedin && <span>🔗 LinkedIn</span>}
          </div>
        </div>

        {/* SUMMARY */}
        {personal.summary && (
          <div style={{ marginBottom: '25px' }}>
            <div className="r-section-title">SUMMARY</div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{personal.summary}</p>
          </div>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && experience.some(e => e.title || e.company) && (
          <div style={{ marginBottom: '25px' }}>
            <div className="r-section-title">EXPERIENCE</div>
            {experience.map((exp) => (
              <div className="r-entry" key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                  <span>{exp.title}</span>
                  <span style={{ fontWeight: 'normal', color: '#666', fontSize: '12px' }}>
                    {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                  </span>
                </div>
                <div style={{ fontStyle: 'italic', fontSize: '13px', color: '#444' }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.bullets && exp.bullets.length > 0 && exp.bullets[0] !== '' && (
                  <ul className="r-entry-bullets">
                    {exp.bullets.filter(b => b && b.trim()).map((bullet, idx) => (
                      <li key={idx} style={{ fontSize: '13px', lineHeight: '1.5' }}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EDUCATION */}
        {education.length > 0 && education.some(edu => edu.degree || edu.institution) && (
          <div style={{ marginBottom: '25px' }}>
            <div className="r-section-title">EDUCATION</div>
            {education.map((edu) => (
              <div className="r-entry" key={edu.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                  <span>{edu.degree}</span>
                  <span style={{ fontWeight: 'normal', color: '#666', fontSize: '12px' }}>
                    {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: '13px' }}>{edu.institution}</div>
                {edu.gpa && <div style={{ fontSize: '12px', color: '#666' }}>GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        )}

        {/* SKILLS */}
        {skills && skills.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <div className="r-section-title">SKILLS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill, i) => (
                <span key={i} className="skill-tag-preview">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {projects && projects.length > 0 && projects.some(p => p.name) && (
          <div>
            <div className="r-section-title">PROJECTS</div>
            {projects.map((proj) => (
              <div className="r-entry" key={proj.id}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {proj.name}
                  {proj.url && <span style={{ fontWeight: 'normal', fontSize: '11px', color: '#C4622D', marginLeft: '10px' }}>{proj.url}</span>}
                </div>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
