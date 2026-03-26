
import { useEffect, useRef } from 'react'
import { syncResumeToCloud } from '../services/supabaseClient'

export function useAutosave(resumeData, user, unlocked) {
  const timeoutRef = useRef(null)

  useEffect(() => {
    // 1. Always save to LocalStorage for speed
    localStorage.setItem('resume_draft', JSON.stringify(resumeData))

    // 2. If user is logged in, debounce the cloud sync (save every 3 seconds of typing)
    if (user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(async () => {
        try {
          await syncResumeToCloud(user.id, resumeData, unlocked)
          console.log("Cloud sync successful")
        } catch (err) {
          console.error("Cloud sync failed:", err)
        }
      }, 3000)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [resumeData, user, unlocked])
}

export const loadDraft = () => {
  const saved = localStorage.getItem('resume_draft')
  return saved ? JSON.parse(saved) : null
}

export const clearDraft = () => {
  localStorage.removeItem('resume_draft')
}
