import React from 'react'
import SectionWrapper from './SectionWrapper.jsx'

const FONT_OPTIONS = [
  { label: 'Sans Serif (Modern)', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Serif (Classic)', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace (Technical)', value: '"Courier New", Courier, monospace' }
];

const PRESET_COLORS = [
  '#C4622D', // Default orange
  '#2C3E50', // Navy blue
  '#27AE60', // Emerald green
  '#8E44AD', // Purple
  '#C0392B', // Dark red
  '#16A085'  // Teal
];

export default function PersonalizeSection({ data = {}, onChange }) {
  const accentColor = data.accentColor || '#C4622D';
  const fontFamily = data.fontFamily || FONT_OPTIONS[0].value;
  const fontSize = data.fontSize || 13; // Numeric base font size

  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <SectionWrapper title="Personalize" icon={<PaletteIcon />} defaultOpen={false}>
      <div className="field">
        <label>Accent Color</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input 
            type="color" 
            value={accentColor} 
            onChange={e => set('accentColor', e.target.value)} 
            style={{ width: '40px', height: '40px', padding: '0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          />
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              onClick={() => set('accentColor', color)}
              style={{
                width: '30px', 
                height: '30px', 
                backgroundColor: color, 
                border: accentColor === color ? '2px solid #000' : '1px solid #ddd',
                borderRadius: '50%',
                cursor: 'pointer',
                padding: 0
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Font Style</label>
          <select 
            value={fontFamily} 
            onChange={e => set('fontFamily', e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
          >
            {FONT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div className="field">
          <label>Font Size ({fontSize}px)</label>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <input 
              type="range" 
              min="10" 
              max="16" 
              step="1" 
              value={fontSize} 
              onChange={e => set('fontSize', parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

function PaletteIcon() {
  return (
    <svg className="form-section__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  )
}
