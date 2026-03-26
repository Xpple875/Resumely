import React from 'react'
import PersonalSection from './form/PersonalSection.jsx'
import ExperienceSection from './form/ExperienceSection.jsx'
import EducationSection from './form/EducationSection.jsx'
import SkillsSection from './form/SkillsSection.jsx'
import ProjectsSection from './form/ProjectsSection.jsx'

export default function ResumeForm({ data, onChange, onToast }) {
  const update = (section, value) =>
    onChange(prev => ({ ...prev, [section]: value }))

  return (
    <div style={{ paddingBottom: '70px' }}>
      <PersonalSection
        data={data.personal}
        onChange={val => update('personal', val)}
        onToast={onToast}
      />
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
    </div>
  )
}
