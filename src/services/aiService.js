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

export async function generateSummary(experience, jobTitle = '') {
   if (!experience || experience.length === 0) {
      throw new Error('Please add some work experience first so the AI has context to write a summary.')
   }

   // Prepare experience data for the AI
   const expText = experience.map(exp => 
      `${exp.title} at ${exp.company}${exp.description ? `: ${exp.description}` : ''}`
   ).join('\n')

   const { data: { session } } = await supabase.auth.getSession()
   const token = session?.access_token || null

   const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullet: expText, jobTitle, mode: 'generate_summary', token }),
   })

   const data = await response.json()
   if (!response.ok) throw new Error(data.error || 'Summary generation failed.')

   if (data.uses_left !== undefined) setAIUsesLeft(data.uses_left)
   return data.result
}

export async function matchJobDescription(resumeData, jobDescription) {
   if (!jobDescription.trim()) {
      throw new Error('Please paste a job description first.')
   }

   const { data: { session } } = await supabase.auth.getSession()
   const token = session?.access_token || null

   // We pass the resume data as the "bullet" and JD as "jobTitle" for simplicity in the proxy
   const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
         bullet: JSON.stringify(resumeData), 
         jobTitle: jobDescription, 
         mode: 'match_jd', 
         token 
      }),
   })

   const data = await response.json()
   if (!response.ok) throw new Error(data.error || 'Job matching failed.')

   if (data.uses_left !== undefined) setAIUsesLeft(data.uses_left)
   return data.result
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
export async function parseResumeText(text) {
   if (!text.trim()) {
      throw new Error('No text found to parse.')
   }

   const { data: { session } } = await supabase.auth.getSession()
   const token = session?.access_token || null

   const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
         bullet: text, 
         mode: 'parse_resume', 
         token 
      }),
   })

   const data = await response.json()
   if (!response.ok) throw new Error(data.error || 'Resume parsing failed.')

   if (data.uses_left !== undefined) setAIUsesLeft(data.uses_left)
   
   // The result should be a JSON string that we can parse
   try {
      const cleanJson = extractJSON(data.result)
      return JSON.parse(cleanJson)
   } catch (e) {
      console.error("AI returned invalid JSON", data.result)
      throw new Error("Failed to parse the AI response. Please try again.")
   }
}

function extractJSON(str) {
   if (!str) return ""
   // Find the first { and the last }
   const start = str.indexOf('{')
   const end = str.lastIndexOf('}')
   if (start === -1 || end === -1) return str
   return str.substring(start, end + 1)
}

