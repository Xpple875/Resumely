import React, { useRef, useLayoutEffect, useState } from 'react'
import '../styles/preview.css'

const ResumeContent = React.forwardRef(({ data, template }, ref) => {
   const { personal, experience = [], education = [], skills = [], projects = [] } = data;

   return (
      <div ref={ref} className={`resume-${template} resume-content-inner`}>
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
   )
});

export default function ResumePreview({ data, template = 'classic' }) {
   const [numPages, setNumPages] = useState(1);
   const measureRef = useRef(null);

   useLayoutEffect(() => {
      if (!measureRef.current) return;

      const resizeObserver = new ResizeObserver((entries) => {
         for (let entry of entries) {
            const totalHeight = entry.target.scrollHeight;
            const width = entry.target.offsetWidth;
            // The aspect ratio of A4 is exactly 297mm height / 210mm width
            const pageHeight = width * (297 / 210);

            let calculatedPages = 1;
            if (pageHeight > 0 && totalHeight > 0) {
               // Subtract 5px to avoid floating point math causing a whole blank page for 1px overflow
               calculatedPages = Math.ceil((totalHeight - 5) / pageHeight);
            }
            calculatedPages = Math.max(1, calculatedPages); // at least 1 page

            setNumPages(prev => (prev !== calculatedPages ? calculatedPages : prev));
         }
      });

      resizeObserver.observe(measureRef.current);

      return () => resizeObserver.disconnect();
   }, [data]);

   if (!data || !data.personal) return null;

   return (
      <div className="resume-container">
         {/*
        Measurement Layer:
        Renders the full continuous resume completely hidden, so the ResizeObserver
        can read its true 'scrollHeight' and divide by A4 height to get the page count.
      */}
         <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -100, width: '210mm' }}>
            <div className="global-paper-flow" style={{ height: 'auto', overflow: 'visible' }}>
               <ResumeContent data={data} template={template} ref={measureRef} />
            </div>
         </div>

         {/*
        Physical Pages Layer:
        Creates distinct, actual DOM divs separated by real CSS gaps.
        It uses CSS transform (translateY) to perfectly 'scroll' the content up for each page,
        so text that flows past 297mm on page 1 is seamlessly displayed at the top of page 2.
      */}
         {Array.from({ length: numPages }).map((_, i) => (
            <div key={i} className="global-paper-flow" style={{ position: 'relative', overflow: 'hidden' }}>
               <div style={{ transform: `translateY(calc(-${i} * 297mm))` }}>
                  <ResumeContent data={data} template={template} />
               </div>
            </div>
         ))}
      </div>
   )
}
