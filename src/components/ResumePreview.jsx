
import React, { useRef, useLayoutEffect } from 'react'
import '../styles/preview.css'

/* ── Pagination Engine ───────────────────────────────────────────────────────
   After every render, find any .r-entry or .r-section-title that straddles
   a visual page-break boundary and push it down past the beige gap.
   The .global-paper-flow background-image draws the visual gap;
   the spacers ensure no content actually sits inside that gap zone.
──────────────────────────────────────────────────────────────────────────── */
function repaginate(paper) {
   if (!paper) return

   // 1. Remove previously injected spacers
   paper.querySelectorAll('.page-break-spacer').forEach(s => s.remove())

   // 2. mm → px: paper.offsetWidth === 210mm rendered width
   const mmToPx = paper.offsetWidth / 210
   const PAGE_H = mmToPx * 297   // one A4 page in px
   const GAP_H = mmToPx * 20    // beige gap in px

   // 3. Fix up to 8 page-break zones
   for (let page = 0; page < 8; page++) {
      const breakY = (page + 1) * PAGE_H + page * GAP_H  // bottom edge of this page

      // Re-query each pass so offsetTops are fresh after prior insertions
      const els = paper.querySelectorAll('.r-entry, .r-section-title')
      let inserted = false

      for (const el of els) {
         const top = el.offsetTop
         const bottom = top + el.offsetHeight

         if (top < breakY && bottom > breakY) {
            // Element straddles the break — push it to next page
            const push = breakY + GAP_H - top
            const spacer = document.createElement('div')
            spacer.className = 'page-break-spacer'
            spacer.style.cssText = `display:block;height:${push}px;flex-shrink:0;`
            el.parentNode.insertBefore(spacer, el)
            inserted = true
            break
         }
      }

      if (!inserted) break  // no more breaks needed
   }
}

export default function ResumePreview({ data, template = 'classic' }) {
   const paperRef = useRef(null)

   // useLayoutEffect: runs after every DOM commit, before paint → no flicker
   useLayoutEffect(() => { repaginate(paperRef.current) })

   if (!data || !data.personal) return null

   const { personal, experience = [], education = [], skills = [], projects = [] } = data

   return (
      <div className="resume-container">
         <div ref={paperRef} className={`resume-${template} global-paper-flow`}>

            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
               <h1 style={{ fontSize: '32px', margin: '0 0 5px 0', textTransform: 'uppercase', wordBreak: 'break-all' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                           <span style={{ minWidth: 0, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{exp.title}</span>
                           <span style={{ flexShrink: 0, fontWeight: 'normal', color: '#666', fontSize: '12px', whiteSpace: 'nowrap' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                           <span style={{ minWidth: 0, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{edu.degree}</span>
                           <span style={{ flexShrink: 0, fontWeight: 'normal', color: '#666', fontSize: '12px', whiteSpace: 'nowrap' }}>
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
                        <div style={{ fontWeight: 'bold', fontSize: '14px', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                           {proj.name}
                           {proj.url && (
                              <span style={{ display: 'block', fontWeight: 'normal', fontSize: '11px', color: '#C4622D', marginTop: '2px', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                                 {proj.url}
                              </span>
                           )}
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
