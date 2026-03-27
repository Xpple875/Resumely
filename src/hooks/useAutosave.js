
// We are keeping this simple to avoid sync loops
export const saveDraft = (resumeData) => {
  localStorage.setItem('resume_draft', JSON.stringify(resumeData))
}

export const loadDraft = () => {
  const saved = localStorage.getItem('resume_draft')
  try {
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    return null
  }
}

export const clearDraft = () => {
  localStorage.removeItem('resume_draft')
}
