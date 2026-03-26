import { useState, useCallback } from 'react'

let toastId = 0

/**
 * useToast — returns { toasts, showToast }
 * showToast(message, type) where type is 'success' | 'error' | 'info'
 * Toasts auto-dismiss after 3.5 seconds.
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return { toasts, showToast }
}
