import os

def update_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Updated: {path}")

# Update App.jsx to persist the view and data
app_jsx_final = """
import React, { useState, useEffect } from 'react'
import BuilderPage from './pages/BuilderPage'
import TemplatePage from './pages/TemplatePage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import { isUnlocked } from './services/paymentService'
import { loadDraft } from './hooks/useAutosave'

export default function App() {
  // Check if we have a draft. If we do, we should probably be in 'builder' view
  const hasDraft = !!loadDraft()

  const [view, setView] = useState(hasDraft ? 'builder' : 'template')
  const [template, setTemplate] = useState('classic')
  const [unlocked, setUnlocked] = useState(isUnlocked())

  const params = new URLSearchParams(window.location.search)
  const isPaymentSuccess = params.get('payment') === 'success'
  const sessionId = params.get('session_id')

  const handleSelectTemplate = (id) => {
    setTemplate(id)
    setView('builder')
  }

  const handlePaymentComplete = () => {
    setUnlocked(true)
    // IMPORTANT: We force the view to 'builder' here
    setView('builder')
    // Clean the URL without refreshing the page
    window.history.replaceState({}, document.title, "/")
  }

  // If we're in the middle of a payment confirmation, show that screen
  if (isPaymentSuccess && !unlocked) {
    return <PaymentSuccessPage sessionId={sessionId} onUnlocked={handlePaymentComplete} />
  }

  return (
    <div className="app-container">
      {view === 'template' ? (
        <TemplatePage onSelect={handleSelectTemplate} />
      ) : (
        <BuilderPage
          template={template}
          onChangeTemplate={() => setView('template')}
          unlocked={unlocked}
        />
      )}
    </div>
  )
}
"""

update_file('src/App.jsx', app_jsx_final)

print("\\n🚀 Phase 4 Complete! The app now remembers your session and returns to the builder.")
