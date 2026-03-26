import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'resumely_draft'
const INTERVAL_MS = 30_000  // 30 seconds

/**
 * Autosave hook.
 * - Saves resumeData to localStorage every 30 seconds
 * - Also saves immediately on page unload (tab close / refresh)
 * - Returns nothing — side-effect only
 */
export function useAutosave(resumeData) {
  const dataRef = useRef(resumeData)

  // Keep ref current so the unload handler always has fresh data
  useEffect(() => {
    dataRef.current = resumeData
  }, [resumeData])

  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataRef.current))
      } catch (e) {
        // localStorage quota exceeded — silent fail, not critical
        console.warn('Autosave failed:', e)
      }
    }

    const interval = setInterval(save, INTERVAL_MS)
    window.addEventListener('beforeunload', save)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', save)
    }
  }, [])
}

/**
 * Load saved draft from localStorage.
 * Returns parsed data or null if nothing saved.
 */
export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Clear the saved draft (used when user wants to start fresh).
 */
export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY)
}
