import React from 'react'
import SectionManager from './form/SectionManager.jsx'
import PersonalizeSection from './form/PersonalizeSection.jsx'
import PersonalSection from './form/PersonalSection.jsx'
import ExperienceSection from './form/ExperienceSection.jsx'
import EducationSection from './form/EducationSection.jsx'
import SkillsSection from './form/SkillsSection.jsx'
import ProjectsSection from './form/ProjectsSection.jsx'
import CertificationSection from './form/CertificationSection.jsx'
import LanguageSection from './form/LanguageSection.jsx'
import VolunteerSection from './form/VolunteerSection.jsx'
import InterestSection from './form/InterestSection.jsx'
import ReferenceSection from './form/ReferenceSection.jsx'
import CompletenessScore from './form/CompletenessScore.jsx'
import { getAIUsesLeft, enhanceBullet } from '../services/aiService.js'

export default function ResumeForm({ data, onChange, onToast }) {
  const [enhancingAll, setEnhancingAll] = React.useState(false)

  const update = (section, value) =>
    onChange(prev => ({ ...prev, [section]: value }))

  const handleEnhanceAll = async () => {
    const uses = getAIUsesLeft();
    if (uses <= 0) {
      onToast("You've used all 15 AI enhancements for this session. Refresh to reset.", 'error');
      return;
    }
    
    setEnhancingAll(true);
    let enhancementsDone = 0;
    
    // We will clone data and mutate it directly for simplicity, then call onChange once
    try {
       const clone = JSON.parse(JSON.stringify(data));
       let hitLimit = false;

       if (clone.experience && Array.isArray(clone.experience)) {
          for (let exp of clone.experience) {
             if (hitLimit) break;
             if (exp.description && exp.description.trim()) {
                const bullets = exp.description.split('\n').filter(b => b.trim());
                const newBullets = [];
                for (let bullet of bullets) {
                   if (getAIUsesLeft() <= 0) { hitLimit = true; newBullets.push(bullet); continue; }
                   try {
                      const ans = await enhanceBullet(bullet, clone.personal?.title || '', exp.company || '', false);
                      newBullets.push('• ' + ans.replace(/^[-•]\s*/, ''));
                      enhancementsDone++;
                   } catch(e) {
                      newBullets.push(bullet);
                   }
                }
                exp.description = newBullets.join('\n');
             }
          }
       }
       if (enhancementsDone > 0) {
          onChange(clone);
          onToast(`Successfully enhanced ${enhancementsDone} points!`, 'success');
       } else if (hitLimit) {
          onToast('AI limit reached before enhancing.', 'error');
       } else {
          onToast('No points found to enhance.', 'info');
       }
    } catch(err) {
       onToast('Batch enhancement failed.', 'error');
    } finally {
       setEnhancingAll(false);
    }
  }

  const aiUses = getAIUsesLeft();

  return (
    <div style={{ paddingBottom: '70px' }}>
      <CompletenessScore data={data} />

      <div className="ai-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--glass-surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>AI Assistant</span>
            <div style={{ padding: '4px 8px', background: aiUses > 5 ? 'var(--bg)' : 'var(--accent-soft)', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: aiUses > 5 ? 'var(--text-light)' : 'var(--accent)', border: '1px solid var(--glass-border)' }}>
               ⚡ {aiUses} uses left
            </div>
         </div>
         <button 
           onClick={handleEnhanceAll} 
           disabled={enhancingAll || aiUses === 0}
           className="btn btn-secondary" 
           style={{ padding: '6px 12px', fontSize: '12px', height: 'auto', background: 'var(--text)', color: 'var(--bg)' }}
         >
           {enhancingAll ? 'Enhancing...' : 'Enhance All Bullets'}
         </button>
      </div>

      <SectionManager 
        order={data.sectionOrder}
        labels={data.sectionLabels}
        onOrderChange={val => update('sectionOrder', val)}
        onLabelChange={val => update('sectionLabels', val)}
        hideSummary={data.personal?.hideSummary ?? false}
        onToggleSummary={val => update('personal', { ...data.personal, hideSummary: val })}
      />
      <PersonalizeSection
        data={data.theme}
        onChange={val => update('theme', val)}
      />
      <PersonalSection
        data={data.personal}
        onChange={val => update('personal', val)}
        onToast={onToast}
      />
      
      {/* 
        The actual form fields follow the visual grouping for editing efficiency, 
        even if the order in the preview is dynamic! 
      */}
      <ExperienceSection
        data={data.experience}
        onChange={val => update('experience', val)}
        onToast={onToast}
      />
      <EducationSection
        data={data.education}
        onChange={val => update('education', val)}
      />
      <SkillsSection
        data={data.skills}
        onChange={val => update('skills', val)}
      />
      <ProjectsSection
        data={data.projects}
        onChange={val => update('projects', val)}
        onToast={onToast}
      />
      <CertificationSection 
        data={data.certifications}
        onChange={val => update('certifications', val)}
        onToast={onToast}
      />
      <LanguageSection 
        data={data.languages}
        onChange={val => update('languages', val)}
      />
      <VolunteerSection 
        data={data.volunteering}
        onChange={val => update('volunteering', val)}
        onToast={onToast}
      />
      <InterestSection 
        data={data.interests}
        onChange={val => update('interests', val)}
      />
      <ReferenceSection 
        data={data.references}
        onChange={val => update('references', val)}
      />
    </div>
  )
}
