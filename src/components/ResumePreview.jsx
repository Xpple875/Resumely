import React, { useRef, useLayoutEffect, useState } from 'react'
import '../styles/preview.css'

const A4_HEIGHT_MM = 297;
const A4_WIDTH_MM = 210;
const TOP_PAD_MM = 20;
const BOT_PAD_MM = 30; 
const CONTENT_H_MM = A4_HEIGHT_MM - TOP_PAD_MM - BOT_PAD_MM;

const ClassicContent = ({ data, theme, innerRef }) => {
   const { personal, theme: dataTheme, sectionOrder = [], sectionLabels = {} } = data;
   const accentColor = theme.accentColor || '#C4622D';

   const renderSection = (key) => {
      const label = sectionLabels[key] || key.toUpperCase();
      const items = data[key] || [];
      if (items.length === 0) return null;

      const isSimpleList = ['skills', 'interests', 'languages'].includes(key);

      return (
         <div key={key} style={{ marginBottom: '25px' }}>
            <div className="r-section-title" style={{ color: accentColor }}>{label}</div>
            
            {isSimpleList ? (
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {items.map((item, i) => (
                     <span key={i} className="skill-tag-preview">
                        {typeof item === 'string' ? item : (item.name + (item.level ? ` (${item.level})` : ''))}
                     </span>
                  ))}
               </div>
            ) : (
               items.map((item, i) => (
                  <div className="r-entry" key={item.id || i}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontWeight: 'bold', fontSize: '1.05em' }}>
                        <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>
                           {item.title || item.degree || item.name || item.role}
                        </span>
                        <span style={{ flexShrink: 0, fontWeight: 'normal', color: '#666', fontSize: '0.9em', whiteSpace: 'nowrap' }}>
                           {item.startDate ? `${item.startDate} ${item.endDate ? `— ${item.endDate}` : ''}` : item.date}
                        </span>
                     </div>
                     <div style={{ fontStyle: 'italic', color: '#444' }}>
                        {[item.company, item.organization, item.institution, item.location, item.issuer].filter(Boolean).join(' · ')}
                     </div>
                     {item.gpa && <div style={{ fontSize: '0.9em', color: '#666' }}>GPA: {item.gpa}</div>}
                     {item.url && <div style={{ fontSize: '0.85em', color: accentColor }}>{item.url}</div>}
                     {item.description && <p style={{ margin: '4px 0 0 0' }}>{item.description}</p>}
                     {item.bullets && item.bullets.length > 0 && item.bullets[0] !== '' && (
                        <ul className="r-entry-bullets">
                           {item.bullets.filter(b => b && b.trim()).map((b, idx) => (
                              <li key={idx} style={{ lineHeight: '1.5' }}>{b}</li>
                           ))}
                        </ul>
                     )}
                  </div>
               ))
            )}
         </div>
      );
   };

   return (
      <div ref={innerRef} className="resume-classic resume-content-inner" style={{ position: 'relative', fontFamily: theme.fontFamily, fontSize: theme.fontSize, paddingTop: '10mm' }}>
         <div className="r-header">
            <h1 className="r-name">{personal.name || 'YOUR NAME'}</h1>
            {personal.title && <div className="r-tagline" style={{ color: accentColor }}>{personal.title}</div>}
            <div className="r-contact">
               {personal.email && <span>📧 {personal.email}</span>}
               {personal.phone && <span>📞 {personal.phone}</span>}
               {personal.location && <span>📍 {personal.location}</span>}
               {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
               {personal.website && <span>🌐 {personal.website}</span>}
            </div>
         </div>

         {personal.summary && (
            <div style={{ marginBottom: '25px' }}>
               <div className="r-section-title" style={{ color: accentColor }}>SUMMARY</div>
               <p style={{ lineHeight: '1.6', margin: 0 }}>{personal.summary}</p>
            </div>
         )}

         {sectionOrder.map(key => renderSection(key))}
      </div>
   );
};

const ModernContent = ({ data, theme, innerRef }) => {
   const { personal, sectionOrder = [], sectionLabels = {} } = data;
   const accentColor = theme.accentColor || '#C4622D';

   const renderSection = (key) => {
      const label = sectionLabels[key] || key.toUpperCase();
      const items = data[key] || [];
      if (items.length === 0) return null;

      const isSimpleList = ['skills', 'interests', 'languages'].includes(key);

      return (
         <div key={key} style={{ marginBottom: '25px' }}>
            <div className="rm-section-title" style={{ color: accentColor }}>{label}</div>
            
            {isSimpleList ? (
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {items.map((item, i) => (
                     <span key={i} className="rm-skill-pill" style={{ color: accentColor }}>
                        {typeof item === 'string' ? item : (item.name + (item.level ? ` (${item.level})` : ''))}
                     </span>
                  ))}
               </div>
            ) : (
               items.map((item, i) => (
                  <div className="r-entry" key={item.id || i}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontWeight: 'bold', fontSize: '1.05em' }}>
                        <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>
                           {item.title || item.degree || item.name || item.role}
                        </span>
                        <span style={{ flexShrink: 0, fontWeight: 'normal', color: '#666', fontSize: '0.9em', whiteSpace: 'nowrap' }}>
                           {item.startDate ? `${item.startDate} ${item.endDate ? `— ${item.endDate}` : ''}` : item.date}
                        </span>
                     </div>
                     <div style={{ fontStyle: 'italic', color: '#444' }}>
                        {[item.company, item.organization, item.institution, item.location, item.issuer].filter(Boolean).join(' · ')}
                     </div>
                     {item.gpa && <div style={{ fontSize: '0.9em', color: '#666' }}>GPA: {item.gpa}</div>}
                     {item.url && <div style={{ fontSize: '0.85em', color: accentColor }}>{item.url}</div>}
                     {item.description && <p style={{ margin: '4px 0 0 0' }}>{item.description}</p>}
                     {item.bullets && item.bullets.length > 0 && item.bullets[0] !== '' && (
                        <ul className="r-entry-bullets">
                           {item.bullets.filter(b => b && b.trim()).map((b, idx) => (
                              <li key={idx} style={{ lineHeight: '1.5' }}>{b}</li>
                           ))}
                        </ul>
                     )}
                  </div>
               ))
            )}
         </div>
      );
   };

   return (
      <div ref={innerRef} className="resume-modern resume-content-inner" style={{ position: 'relative', fontFamily: theme.fontFamily, fontSize: theme.fontSize }}>
         <div className="rm-header">
            <h1 className="rm-name">{personal.name || 'YOUR NAME'}</h1>
            {personal.title && <div className="rm-title" style={{ color: accentColor }}>{personal.title}</div>}
         </div>
         <div className="rm-contact">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
            {personal.website && <span>{personal.website}</span>}
         </div>

         {personal.summary && (
            <div style={{ marginBottom: '25px' }}>
               <div className="rm-section-title" style={{ color: accentColor }}>SUMMARY</div>
               <p style={{ lineHeight: '1.6', margin: 0 }}>{personal.summary}</p>
            </div>
         )}

         {sectionOrder.map(key => renderSection(key))}
      </div>
   );
};

const MinimalContent = ({ data, theme, innerRef }) => {
   const { personal, sectionOrder = [], sectionLabels = {} } = data;
   const accentColor = theme.accentColor || '#C4622D';

   const renderSection = (key) => {
      const label = sectionLabels[key] || key.toUpperCase();
      const items = data[key] || [];
      if (items.length === 0) return null;

      const isSimpleList = ['skills', 'interests', 'languages'].includes(key);

      return (
         <div className="rmin-section" key={key}>
            <div className="rmin-section-title" style={{ color: accentColor }}>{label}</div>
            <div>
               {isSimpleList ? (
                  <div className="rmin-skills">
                     {items.map((item, i) => (
                        <span key={i}>
                           {typeof item === 'string' ? item : (item.name + (item.level ? ` (${item.level})` : ''))}
                           {i < items.length - 1 ? '  ·  ' : ''}
                        </span>
                     ))}
                  </div>
               ) : (
                  items.map((item, i) => (
                     <div className="r-entry" key={item.id || i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontWeight: 'bold', fontSize: '1.05em' }}>
                           <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>
                              {item.title || item.degree || item.name || item.role}
                           </span>
                           <span style={{ flexShrink: 0, fontWeight: 'normal', color: '#666', fontSize: '0.9em', whiteSpace: 'nowrap' }}>
                              {item.startDate ? `${item.startDate} ${item.endDate ? `— ${item.endDate}` : ''}` : item.date}
                           </span>
                        </div>
                        <div style={{ fontStyle: 'italic', color: '#444' }}>
                           {[item.company, item.organization, item.institution, item.location, item.issuer].filter(Boolean).join(' · ')}
                        </div>
                        {item.gpa && <div style={{ fontSize: '0.9em', color: '#666' }}>GPA: {item.gpa}</div>}
                        {item.url && <div style={{ fontSize: '0.85em', color: accentColor }}>{item.url}</div>}
                        {item.description && <p style={{ margin: '4px 0 0 0' }}>{item.description}</p>}
                        {item.bullets && item.bullets.length > 0 && item.bullets[0] !== '' && (
                           <ul className="r-entry-bullets">
                              {item.bullets.filter(b => b && b.trim()).map((b, idx) => (
                                 <li key={idx} style={{ lineHeight: '1.5' }}>{b}</li>
                              ))}
                           </ul>
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>
      );
   };

   return (
      <div ref={innerRef} className="resume-minimal resume-content-inner" style={{ position: 'relative', fontFamily: theme.fontFamily, fontSize: theme.fontSize, paddingTop: '10mm' }}>
         <div className="rmin-header">
            <h1 className="rmin-name" style={{ color: accentColor }}>{personal.name || 'YOUR NAME'}</h1>
            {personal.title && <div className="rmin-title">{personal.title}</div>}
            <div className="rmin-contact">
               {personal.email && <span>{personal.email}</span>}
               {personal.phone && <span>{personal.phone}</span>}
               {personal.location && <span>{personal.location}</span>}
               {personal.linkedin && <span>{personal.linkedin}</span>}
               {personal.website && <span>{personal.website}</span>}
            </div>
         </div>

         {personal.summary && (
            <div className="rmin-section">
               <div className="rmin-section-title" style={{ color: accentColor }}>SUMMARY</div>
               <div>
                  <p style={{ lineHeight: '1.6', margin: 0 }}>{personal.summary}</p>
               </div>
            </div>
         )}

         {sectionOrder.map(key => renderSection(key))}
      </div>
   );
};

const ResumeContent = React.forwardRef(({ data, template }, ref) => {
   const { theme = {} } = data;
   const resolvedTheme = {
      accentColor: theme.accentColor || '#C4622D',
      fontFamily: theme.fontFamily || 'Helvetica, Arial, sans-serif',
      fontSize: theme.fontSize ? `${theme.fontSize}px` : '13px'
   };

   if (template === 'modern') return <ModernContent data={data} theme={resolvedTheme} innerRef={ref} />;
   if (template === 'minimal') return <MinimalContent data={data} theme={resolvedTheme} innerRef={ref} />;
   return <ClassicContent data={data} theme={resolvedTheme} innerRef={ref} />;
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
      <div className="resume-container" style={{ userSelect: 'none' }}>
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
         {Array.from({ length: numPages }).map((_, i) => {
            let pageTopPad = TOP_PAD_MM;
            if (i === 0) {
               pageTopPad = (template === 'modern') ? 0 : 10;
            }

            return (
               <div key={i} className="physical-paper-sheet">
                  <div style={{ height: `${pageTopPad}mm`, backgroundColor: 'transparent', width: '100%' }} />

                  <div style={{ height: `${CONTENT_H_MM}mm`, width: `${A4_WIDTH_MM}mm`, overflowX: 'hidden', overflowY: 'hidden', position: 'relative' }}>
                     <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0,
                        transform: `translateX(calc(-${i} * (${A4_WIDTH_MM}mm + 30mm)))` 
                     }}>
                        <MultiColEngine data={data} template={template} />
                     </div>
                  </div>

                  <div style={{ height: `${A4_HEIGHT_MM - pageTopPad - CONTENT_H_MM}mm`, backgroundColor: 'transparent', width: '100%' }} />
               </div>
            );
         })}
      </div>
   )
}
