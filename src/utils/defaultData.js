let counter = 0
const uid = () => `id_${++counter}_${Date.now()}`

export const defaultResumeData = {
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
  },
  theme: {
    accentColor: '#C4622D',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 13,
  },
  experience: [
    {
      id: uid(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      bullets: [''],
    }
  ],
  education: [
    {
      id: uid(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      gpa: '',
    }
  ],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  volunteering: [],
  interests: [],
  references: [],
  sectionOrder: ['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'volunteering', 'interests', 'references'],
  sectionLabels: {
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    languages: 'Languages',
    volunteering: 'Volunteering',
    interests: 'Interests',
    references: 'References',
  }
}

export const newExperienceEntry = () => ({
  id: uid(),
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  bullets: [''],
})

export const newEducationEntry = () => ({
  id: uid(),
  degree: '',
  institution: '',
  startDate: '',
  endDate: '',
  gpa: '',
})

export const newProjectEntry = () => ({
  id: uid(),
  name: '',
  url: '',
  description: '',
})

export const newCertificationEntry = () => ({
  id: uid(),
  name: '',
  issuer: '',
  date: '',
})

export const newLanguageEntry = () => ({
  id: uid(),
  name: '',
  level: '',
})

export const newVolunteerEntry = () => ({
  id: uid(),
  role: '',
  organization: '',
  date: '',
  description: '',
})

export const newInterestEntry = () => ({
  id: uid(),
  name: '',
})

export const newReferenceEntry = () => ({
  id: uid(),
  name: '',
  title: '',
  company: '',
  contact: '',
})
