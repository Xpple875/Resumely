
// We are keeping this simple to avoid sync loops
export const saveDraft = (resumeData, name) => {
  const draft = {
    resumeData,
    name,
    updatedAt: new Date().toISOString()
  }
  localStorage.setItem('resume_draft', JSON.stringify(draft))
}

export const loadDraft = () => {
  const saved = localStorage.getItem('resume_draft')
  try {
    if (!saved) return null
    const parsed = JSON.parse(saved)
    // Support both old (just data) and new (object with data/name) formats
    if (parsed && parsed.resumeData) {
       return parsed
    }
    return { resumeData: parsed, name: 'Untitled Resume' }
  } catch (e) {
    return null
  }
}

export const clearDraft = () => {
  localStorage.removeItem('resume_draft')
}
