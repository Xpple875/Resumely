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
      <div ref={innerRef} className="resume-classic resume-content-inner" style={{ position: 'relative', fontFamily: theme.fontFamily, fontSize: theme.fontSize, paddingTop: '20mm' }}>
         <div className="r-header">
            <h1 className="r-name">{personal.name || 'YOUR NAME'}</h1>
            {personal.title && <div className="r-tagline" style={{ color: accentColor }}>{personal.title}</div>}
            <div className="r-contact">
               {personal.email && <span>📧 {personal.email}</span>}
               {personal.phone && <span>📞 {personal.phone}</span>}
               {personal.location && <span>📍 {personal.location}</span>}
               {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
               {personal.github && <span>💻 {personal.github}</span>}
               {personal.twitter && <span>🐦 {personal.twitter}</span>}
               {personal.portfolio && <span>🎨 {personal.portfolio}</span>}
               {personal.website && <span>🌐 {personal.website}</span>}

            </div>
         </div>

         {!personal.hideSummary && personal.summary && (
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
            {personal.github && <span>{personal.github}</span>}
            {personal.twitter && <span>{personal.twitter}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
            {personal.website && <span>{personal.website}</span>}

         </div>

         {!personal.hideSummary && personal.summary && (
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
      <div ref={innerRef} className="resume-minimal resume-content-inner" style={{ position: 'relative', fontFamily: theme.fontFamily, fontSize: theme.fontSize, paddingTop: '20mm' }}>
         <div className="rmin-header">
            <h1 className="rmin-name" style={{ color: accentColor }}>{personal.name || 'YOUR NAME'}</h1>
            {personal.title && <div className="rmin-title">{personal.title}</div>}
            <div className="rmin-contact">
               {personal.email && <span>{personal.email}</span>}
               {personal.phone && <span>{personal.phone}</span>}
               {personal.location && <span>{personal.location}</span>}
               {personal.linkedin && <span>{personal.linkedin}</span>}
               {personal.github && <span>{personal.github}</span>}
               {personal.twitter && <span>{personal.twitter}</span>}
               {personal.portfolio && <span>{personal.portfolio}</span>}
               {personal.website && <span>{personal.website}</span>}

            </div>
         </div>

         {!personal.hideSummary && personal.summary && (
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

const ElegantContent = ({ data, theme, innerRef }) => {
   const { personal, sectionOrder = [], sectionLabels = {} } = data;
   const accentColor = theme.accentColor || '#C4622D';

   const renderSection = (key) => {
      const label = sectionLabels[key] || key.toUpperCase();
      const items = data[key] || [];
      if (items.length === 0) return null;

      const isSimpleList = ['skills', 'interests', 'languages'].includes(key);

      return (
         <div key={key} style={{ marginBottom: '30px', textAlign: 'center' }}>
            <div style={{
               fontSize: '0.85rem',
               letterSpacing: '0.2em',
               color: accentColor,
               marginBottom: '12px',
               fontWeight: 600
            }}>
               {label}
            </div>

            {isSimpleList ? (
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                  {items.map((item, i) => (
                     <span key={i} style={{ fontSize: '0.95rem', color: '#444' }}>
                        {typeof item === 'string' ? item : (item.name + (item.level ? ` (${item.level})` : ''))}
                        {i < items.length - 1 ? '  ·  ' : ''}
                     </span>
                  ))}
               </div>
            ) : (
               items.map((item, i) => (
                  <div key={item.id || i} style={{ marginBottom: '20px' }}>
                     <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '2px' }}>
                        {item.title || item.degree || item.name || item.role}
                     </div>
                     <div style={{ color: accentColor, fontSize: '0.9rem', marginBottom: '6px', fontStyle: 'italic' }}>
                        {[item.company, item.organization, item.institution, item.location, item.issuer].filter(Boolean).join(' · ')}
                        {(item.startDate || item.date) && `  |  ${item.startDate ? `${item.startDate} — ${item.endDate || 'Present'}` : item.date}`}
                     </div>
                     {item.description && <p style={{ margin: '0 auto', maxWidth: '90%', lineHeight: '1.6' }}>{item.description}</p>}
                     {item.bullets && item.bullets.length > 0 && item.bullets[0] !== '' && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0' }}>
                           {item.bullets.filter(b => b && b.trim()).map((b, idx) => (
                              <li key={idx} style={{ lineHeight: '1.5', marginBottom: '4px' }}>— {b}</li>
                           ))}
                        </ul>
                     )}
                  </div>
               ))
            )}
            <div style={{ width: '40px', height: '1px', background: '#ddd', margin: '25px auto 0' }} />
         </div>
      );
   };

   return (
      <div ref={innerRef} className="resume-elegant resume-content-inner" style={{ position: 'relative', fontFamily: theme.fontFamily, fontSize: theme.fontSize, textAlign: 'center', paddingTop: '20mm' }}>
         <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 'normal', margin: '0 0 10px 0', letterSpacing: '0.05em' }}>{personal.name || 'YOUR NAME'}</h1>
            {personal.title && <div style={{ fontSize: '1.1rem', color: accentColor, letterSpacing: '0.15em', marginBottom: '20px' }}>{personal.title.toUpperCase()}</div>}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 20px', fontSize: '0.85rem', color: '#666' }}>
               {personal.email && <span>{personal.email}</span>}
               {personal.phone && <span>{personal.phone}</span>}
               {personal.location && <span>{personal.location}</span>}
               {personal.linkedin && <span>{personal.linkedin}</span>}
               {personal.github && <span>{personal.github}</span>}
               {personal.twitter && <span>{personal.twitter}</span>}
               {personal.portfolio && <span>{personal.portfolio}</span>}
               {personal.website && <span>{personal.website}</span>}

            </div>
         </div>

         {!personal.hideSummary && personal.summary && (
            <div style={{ marginBottom: '35px' }}>
               <p style={{ lineHeight: '1.8', margin: '0 auto', maxWidth: '85%', fontStyle: 'italic', fontSize: '1.05rem' }}>"{personal.summary}"</p>
               <div style={{ width: '40px', height: '1px', background: '#ddd', margin: '30px auto 0' }} />
            </div>
         )}

         {sectionOrder.map(key => renderSection(key))}
      </div>
   );
};

const CompactContent = ({ data, theme, innerRef }) => {
   const { personal, sectionOrder = [], sectionLabels = {} } = data;
   const accentColor = theme.accentColor || '#C4622D';

   const renderSidebarSection = (key) => {
      const label = sectionLabels[key] || key.toUpperCase();
      const items = data[key] || [];
      if (items.length === 0) return null;

      return (
         <div key={key} style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '0.1em', marginBottom: '10px' }}>{label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               {items.map((item, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                     {typeof item === 'string' ? item : (
                        <div>
                           <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                           {item.level && <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>{item.level}</div>}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      );
   };

   const renderMainSection = (key) => {
      const label = sectionLabels[key] || key.toUpperCase();
      const items = data[key] || [];
      if (items.length === 0 || ['skills', 'languages', 'interests'].includes(key)) return null;

      return (
         <div key={key} style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: `1px solid #eee`, paddingBottom: '4px', marginBottom: '12px' }}>{label}</div>
            {items.map((item, i) => (
               <div key={i} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem' }}>
                     <span>{item.title || item.degree || item.name || item.role}</span>
                     <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#888' }}>{item.startDate ? `${item.startDate} — ${item.endDate || 'Present'}` : item.date}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: accentColor, marginBottom: '4px' }}>
                     {[item.company, item.organization, item.institution, item.location, item.issuer].filter(Boolean).join(' · ')}
                  </div>
                  {item.description && <p style={{ fontSize: '0.9rem', margin: '4px 0', lineHeight: '1.4' }}>{item.description}</p>}
                  {item.bullets && item.bullets.length > 0 && item.bullets[0] !== '' && (
                     <ul style={{ paddingLeft: '15px', margin: '4px 0', fontSize: '0.88rem' }}>
                        {item.bullets.filter(b => b && b.trim()).map((b, idx) => (
                           <li key={idx} style={{ marginBottom: '2px' }}>{b}</li>
                        ))}
                     </ul>
                  )}
               </div>
            ))}
         </div>
      );
   };

   return (
      <div ref={innerRef} className="resume-compact resume-content-inner" style={{ position: 'relative', fontFamily: theme.fontFamily, fontSize: theme.fontSize, display: 'flex', gap: '120px', minHeight: '100%' }}>
         {/* Sidebar */}
         <div className="sidebar">
            <div style={{ marginBottom: '30px' }}>
               <h1 style={{ fontSize: '1.8rem', lineHeight: '1.1', marginBottom: '10px' }}>{personal.name || 'YOUR NAME'}</h1>
               <div style={{ fontSize: '0.9rem', color: accentColor, fontWeight: 500 }}>{personal.title}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#555', marginBottom: '30px' }}>
               {personal.email && <div style={{ overflowWrap: 'anywhere' }}>{personal.email}</div>}
               {personal.phone && <div>{personal.phone}</div>}
               {personal.location && <div>{personal.location}</div>}
               {personal.linkedin && <div style={{ overflowWrap: 'anywhere' }}>{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</div>}
               {personal.github && <div style={{ overflowWrap: 'anywhere' }}>{personal.github.replace(/^https?:\/\/github\.com\//, '')}</div>}
               {personal.twitter && <div style={{ overflowWrap: 'anywhere' }}>{personal.twitter.replace(/^https?:\/\/(x|twitter)\.com\//, '')}</div>}
               {personal.portfolio && <div style={{ overflowWrap: 'anywhere' }}>{personal.portfolio.replace(/^https?:\/\//, '')}</div>}
               {personal.website && <div style={{ color: accentColor }}>{personal.website.replace(/^https?:\/\//, '')}</div>}

            </div>

            {['skills', 'languages', 'interests'].map(key => renderSidebarSection(key))}
         </div>

         {/* Main Content */}
         <div style={{ flex: 1 }}>
            {!personal.hideSummary && personal.summary && (
               <div style={{ marginBottom: '25px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: `1px solid #eee`, paddingBottom: '4px', marginBottom: '8px' }}>PROFILE</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{personal.summary}</p>
               </div>
            )}
            {sectionOrder.map(key => renderMainSection(key))}
         </div>
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
   if (template === 'elegant') return <ElegantContent data={data} theme={resolvedTheme} innerRef={ref} />;
   if (template === 'compact') return <CompactContent data={data} theme={resolvedTheme} innerRef={ref} />;
   return <ClassicContent data={data} theme={resolvedTheme} innerRef={ref} />;
});

export default function ResumePreview({ data, template = 'classic', mobileView }) {
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

         // Subtract a small "fudge factor" (10px) to ignore sub-pixel overflows that trigger empty pages
         let calculatedPages = Math.ceil((trueTotalWidth - 10) / colStride);
         
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
   }, [data, template, mobileView]);

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
                pageTopPad = (template === 'modern') ? 0 : 20;
             }

            return (
               <div key={i} className={`physical-paper-sheet sheet-${template}`}>
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
