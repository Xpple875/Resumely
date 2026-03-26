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
