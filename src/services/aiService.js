import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// Optimistic global state so synchronous calls still work before the first fetch
let globalUsesLeft = 10;

/** 
 * Keep this for legacy synchronous checks inside non-react functions 
 * (though useAILimits is preferred for UI)
 */
export function getAIUsesLeft() {
   return globalUsesLeft;
}

export function setAIUsesLeft(count) {
   globalUsesLeft = count;
   // Tell React components to re-render
   window.dispatchEvent(new CustomEvent('ai_uses_updated', { detail: count }))
}

/** React hook for UI components to track the real limit securely linked to the cloud. */
export function useAILimits() {
   const [usesLeft, setUsesLeft] = useState(globalUsesLeft)

   useEffect(() => {
      const handleUpdate = (e) => setUsesLeft(e.detail)
      window.addEventListener('ai_uses_updated', handleUpdate)
      return () => window.removeEventListener('ai_uses_updated', handleUpdate)
   }, [])

   return usesLeft
}

export async function enhanceBullet(bullet, jobTitle = '', company = '', isSummary = false, mode = null) {
   if (!bullet.trim()) {
      throw new Error('Please write something in the bullet first.')
   }

   // Grab the Supabase token if the user is authenticated to bypass the IP limit
   const { data: { session } } = await supabase.auth.getSession()
   const token = session?.access_token || null

   const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullet, jobTitle, company, isSummary, mode, token }),
   })

   const data = await response.json()

   // Cloud explicitly returned an error (likely 429 Limit Exceeded)
   if (!response.ok) {
      throw new Error(data.error || 'Enhancement failed — try again.')
   }

   // Update local state based on absolute truth from the Database
   if (data.uses_left !== undefined) {
      setAIUsesLeft(data.uses_left)
   }

   return data.result
}
