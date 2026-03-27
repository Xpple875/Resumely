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

export default function ResumeForm({ data, onChange, onToast }) {
  const update = (section, value) =>
    onChange(prev => ({ ...prev, [section]: value }))

  return (
    <div style={{ paddingBottom: '70px' }}>
      <SectionManager 
        order={data.sectionOrder}
        labels={data.sectionLabels}
        onOrderChange={val => update('sectionOrder', val)}
        onLabelChange={val => update('sectionLabels', val)}
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
      />
      <CertificationSection 
        data={data.certifications}
        onChange={val => update('certifications', val)}
      />
      <LanguageSection 
        data={data.languages}
        onChange={val => update('languages', val)}
      />
      <VolunteerSection 
        data={data.volunteering}
        onChange={val => update('volunteering', val)}
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
