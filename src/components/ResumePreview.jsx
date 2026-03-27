import React, { useRef, useLayoutEffect, useState } from 'react'
import '../styles/preview.css'

const A4_HEIGHT_MM = 297;
const A4_WIDTH_MM = 210;
const TOP_PAD_MM = 20;
const BOT_PAD_MM = 30; 
const CONTENT_H_MM = A4_HEIGHT_MM - TOP_PAD_MM - BOT_PAD_MM;

const ResumeContent = React.forwardRef(({ data, template }, ref) => {
   const { personal, experience = [], education = [], skills = [], projects = [] } = data;

   return (
      <div ref={ref} className={`resume-${template} resume-content-inner`} style={{ position: 'relative' }}>
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
               {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
               {personal.website && <span>🌐 {personal.website}</span>}
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
               {experience.map((exp, i) => {
                  const safeId = exp.id || `idx-${i}`;
                  return (
                  <div className="r-entry" key={safeId}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                        <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>{exp.title}</span>
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
                              <li key={idx} style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                 {bullet}
                              </li>
                           ))}
                        </ul>
                     )}
                  </div>
               )})}
            </div>
         )}

         {/* EDUCATION */}
         {education.length > 0 && education.some(edu => edu.degree || edu.institution) && (
            <div style={{ marginBottom: '25px' }}>
               <div className="r-section-title">EDUCATION</div>
               {education.map((edu, i) => {
                  const safeId = edu.id || `idx-${i}`;
                  return (
                  <div className="r-entry" key={safeId}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                        <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>{edu.degree}</span>
                        <span style={{ flexShrink: 0, fontWeight: 'normal', color: '#666', fontSize: '12px', whiteSpace: 'nowrap' }}>
                           {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ''}
                        </span>
                     </div>
                     <div style={{ fontSize: '13px' }}>{edu.institution}</div>
                     {edu.gpa && <div style={{ fontSize: '12px', color: '#666' }}>GPA: {edu.gpa}</div>}
                  </div>
               )})}
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
               {projects.map((proj, i) => {
                  const safeId = proj.id || `idx-${i}`;
                  return (
                  <div className="r-entry" key={safeId}>
                     <div style={{ fontWeight: 'bold', fontSize: '14px', overflowWrap: 'break-word' }}>
                        {proj.name}
                        {proj.url && (
                           <span style={{ display: 'block', fontWeight: 'normal', fontSize: '11px', color: '#C4622D', marginTop: '2px', overflowWrap: 'break-word' }}>
                              {proj.url}
                           </span>
                        )}
                     </div>
                     <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>{proj.description}</p>
                  </div>
               )})}
            </div>
         )}
      </div>
   )
});

export default function ResumePreview({ data, template = 'classic' }) {
   const [numPages, setNumPages] = useState(1);
   const measureRef = useRef(null);
   const innerRef = useRef(null);

   useLayoutEffect(() => {
      const calculatePages = () => {
         if (!measureRef.current || !innerRef.current) return;
         
         const engineContainer = measureRef.current;
         const innerContainer = innerRef.current;
         
         const engineRect = engineContainer.getBoundingClientRect();
         const scaledColWidth = engineRect.width;
         if (scaledColWidth === 0) return;

         // Determine the deepest fragmented column spill by polling absolute render matrices of natively wrapped elements.
         // This fundamentally bypasses the Chrome / Firefox multi-column horizontal 'scrollWidth' zero-report bug.
         let maxRight = engineRect.right;
         const children = innerContainer.children;
         for (let i = 0; i < children.length; i++) {
             const childRect = children[i].getBoundingClientRect();
             if (childRect.right > maxRight) {
                 maxRight = childRect.right;
             }
         }
         
         // Converts proportional 30mm gaps explicitly mapped to the active transformed CSS scaling matrices
         const scaledGapWidth = scaledColWidth * (30 / A4_WIDTH_MM); 
         
         const trueTotalWidth = maxRight - engineRect.left;
         const colStride = scaledColWidth + scaledGapWidth;
         
         let calculatedPages = Math.ceil(trueTotalWidth / colStride);
         calculatedPages = Math.max(1, calculatedPages);
         
         setNumPages(prev => (prev !== calculatedPages ? calculatedPages : prev));
      };

      // Run immediately dynamically resolving the current hydration chunk
      calculatePages();

      // Observer simply secures responsive edge-case changes (like active window CSS template switching)
      let handle;
      const resizeObserver = new ResizeObserver(() => {
         cancelAnimationFrame(handle);
         handle = requestAnimationFrame(calculatePages);
      });

      if (measureRef.current) resizeObserver.observe(measureRef.current);
      return () => {
         resizeObserver.disconnect();
         cancelAnimationFrame(handle);
      };
   }, [data, template]);

   if (!data || !data.personal) return null;

   // The Magical Browser-Native HTML Splitting Engine
   // Utilizing CSS Multi-column layout horizontally ensures strings natively break 
   // line-by-line across bounded areas EXACTLY like Microsoft Word mapping algorithms!
   const MultiColEngine = React.forwardRef((props, ref) => (
      <div ref={ref} style={{
         height: `${CONTENT_H_MM}mm`,
         columnWidth: `${A4_WIDTH_MM}mm`,
         columnGap: '30mm', // Unseen natively but perfectly dictates scrollWidth expansion
         columnFill: 'auto',
      }}>
         <ResumeContent {...props} ref={props.innerRef} />
      </div>
   ));

   return (
      <div className="resume-container">
         {/*
          Measurement Layer:
          The native CSS multi-column forces horizontal fragmentation. 
          We read how wide it generated to precisely extract vertical pages sequentially!
         */}
         <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -100 }}>
            <MultiColEngine data={data} template={template} ref={measureRef} innerRef={innerRef} />
         </div>

         {/*
          True Physical DOM Pages Layer:
          We apply a positional masking loop to virtually convert the horizontal multi-column renderer 
          into sequentially stacked physical vertical sheets identically replicating Google Docs.
          No graphic pixel-slicing logic or text chopping natively exists here!
         */}
         {Array.from({ length: numPages }).map((_, i) => (
            <div key={i} className="physical-paper-sheet">
               <div style={{ height: `${TOP_PAD_MM}mm`, backgroundColor: 'transparent', width: '100%' }} />

               <div style={{ height: `${CONTENT_H_MM}mm`, width: `${A4_WIDTH_MM}mm`, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ 
                     position: 'absolute', 
                     top: 0, 
                     left: 0,
                     transform: `translateX(calc(-${i} * (${A4_WIDTH_MM}mm + 30mm)))` 
                  }}>
                     <MultiColEngine data={data} template={template} />
                  </div>
               </div>

               <div style={{ height: `${BOT_PAD_MM}mm`, backgroundColor: 'transparent', width: '100%' }} />
            </div>
         ))}
      </div>
   )
}
