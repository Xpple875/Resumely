import React, { useEffect, useState } from 'react'
import { getUserDocuments, createDocument, deleteDocument, deleteUserAccount, duplicateDocument, getDocumentById } from '../services/supabaseClient'
import { defaultResumeData } from '../utils/defaultData'

import { parseResumeText } from '../services/aiService'
import DownloadOptionsModal from '../components/DownloadOptionsModal'
import ThemeToggle from '../components/ThemeToggle.jsx'
import '../styles/landing.css'

export default function DashboardPage({ user, onOpenDocument, onSignOut, onCreateNew, onGoToLanding, onImportComplete, theme, setTheme }) {

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(null) // docId being duplicated
  const [isDownloading, setIsDownloading] = useState(null) // docId being downloaded
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [deleteModalDoc, setDeleteModalDoc] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsingStep, setParsingStep] = useState('')


  useEffect(() => {
    if (!user) return
    loadDocs()
  }, [user])

  useEffect(() => {
    if (loading) return;
    
    // Scroll reveal observer
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { 
          entry.target.classList.add('visible'); 
          observer.unobserve(entry.target); 
        }
      });
    }, { threshold: 0.1 });
    
    // Wait a tiny bit for DOM to update
    const timeoutId = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 100);

    return () => {
       observer.disconnect();
       clearTimeout(timeoutId);
    }
  }, [loading, documents.length])

  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const loadDocs = async () => {
    setLoading(true)
    try {
      const docs = await getUserDocuments(user.id)
      setDocuments(docs || [])
    } catch (err) {
      console.error("Failed to load documents", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    if (onCreateNew) onCreateNew()
  }

  const handleDuplicate = async (e, docId) => {
    e.stopPropagation()
    try {
      setIsDuplicating(docId)
      const newId = await duplicateDocument(docId, user.id)
      await loadDocs()
    } catch (err) {
      console.error("Duplication failed", err)
      alert("Failed to duplicate resume.")
    } finally {
      setIsDuplicating(null)
    }
  }

  const handleDownloadClick = (e, doc) => {
    e.stopPropagation()
    setSelectedDoc(doc)
    setShowDownloadOptions(true)
  }

  const handleDownloadAction = async (format) => {
    if (!selectedDoc) return
    setShowDownloadOptions(false)
    
    try {
      setIsDownloading(selectedDoc.id)
      const fullDoc = await getDocumentById(selectedDoc.id)
      if (fullDoc?.resume_data) {
        if (format === 'pdf') {
          const { generatePDF } = await import('../utils/pdfExport')
          await generatePDF(null, fullDoc.resume_data, fullDoc.template || 'classic')
        } else {
          const { generateDOCX } = await import('../utils/docxExport')
          await generateDOCX(fullDoc.resume_data)
        }
      }
    } catch (err) {
      console.error("Direct download failed", err)
      alert(`Failed to download ${format.toUpperCase()}.`)
    } finally {
      setIsDownloading(null)
      setSelectedDoc(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteModalDoc) return
    
    try {
      await deleteDocument(deleteModalDoc.id)
      setDocuments(docs => docs.filter(d => d.id !== deleteModalDoc.id))
      setDeleteModalDoc(null)
    } catch (err) {
      console.error("Failed to delete", err)
      alert("Failed to delete document")
    }
  }

  const confirmDelete = (e, doc) => {
    e.stopPropagation()
    setDeleteModalDoc(doc)
  }

  const extractTextFromPDF = async (file) => {
    const pdfjsLib = await import('pdfjs-dist')
    const pdfWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url')
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ""
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + "\n"
    }
    return fullText
  }

  const extractTextFromDOCX = async (file) => {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.default.extractRawText({ arrayBuffer })
    return result.value
  }

  const handleImportClick = () => {
    document.getElementById('import-upload').click()
  }

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    setParsingStep('Reading file...')
    try {
      let text = ""
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file)
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDOCX(file)
      } else {
        text = await file.text()
      }

      setParsingStep('AI is analyzing your resume...')
      const parsedData = await parseResumeText(text)
      
      setParsingStep('Finalizing...')
      const mergedData = {
        ...defaultResumeData,
        ...parsedData,
        personal: { ...defaultResumeData.personal, ...(parsedData.personal || {}) },
        theme: { ...defaultResumeData.theme, ...(parsedData.theme || {}) },
        sectionLabels: { ...defaultResumeData.sectionLabels, ...(parsedData.sectionLabels || {}) }
      }
      
      if (onImportComplete) {
        onImportComplete(mergedData, file.name.replace(/\.[^/.]+$/, ""))
      } else {
        // Fallback
        const newId = await createDocument(user.id, file.name.replace(/\.[^/.]+$/, ""), mergedData, 'classic')
        onOpenDocument(newId)
      }


    } catch (err) {
      console.error("Import failed", err)
      alert(err.message || "Failed to import resume. Make sure it's a valid PDF or DOCX.")
    } finally {
      setIsParsing(false)
      setParsingStep('')
      // Clear input
      e.target.value = ''
    }
  }


  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav>
        <div 
          className="nav-logo" 
          onClick={onGoToLanding}
          style={{ cursor: 'pointer' }}
        >
          Resum<span>ely</span>
        </div>
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && (
             <div style={{ position: 'relative' }}>
                <button
                   onClick={() => setIsProfileOpen(!isProfileOpen)}
                   className="hide-mobile"
                   style={{ 
                      borderRadius: '50%', 
                      background: 'var(--accent-soft)', 
                      color: 'var(--accent)', 
                      fontWeight: 'bold', 
                      fontSize: '12px', 
                      width: '34px', 
                      height: '34px', 
                      padding: 0,
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition)'
                   }}
                   title={`Account (${user.email})`}
                >
                   {user.email?.[0].toUpperCase()}
                </button>

                {isProfileOpen && (
                   <div style={{
                      position: 'absolute',
                      top: '120%',
                      right: '0',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '12px',
                      minWidth: '220px',
                      zIndex: 1000,
                      animation: 'toastIn 0.2s ease',
                      textAlign: 'left'
                   }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '10px', padding: '0 8px' }}>{user.email}</div>
                      
                      <button 
                         className="btn btn-ghost" 
                         style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '8px', border: 'none', background: 'none' }}
                         onClick={() => { setIsProfileOpen(false); window.location.hash = 'type=recovery'; }}
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"/></svg>
                         Change Password
                      </button>

                      <button 
                         className="btn btn-ghost" 
                         style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '8px', color: '#e74c3c', border: 'none', background: 'none' }}
                         onClick={async () => {
                            if (window.confirm("CRITICAL: This will permanently delete your account and ALL your resumes. This cannot be undone. Are you absolutely sure?")) {
                               setIsProfileOpen(false)
                               try {
                                  await deleteUserAccount(user.id)
                                  onSignOut()
                               } catch (err) {
                                  console.error("Delete failed", err)
                               }
                            }
                         }}
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                         Delete Account
                      </button>

                      <div style={{ borderTop: '1px solid var(--glass-border)', margin: '8px 0' }}></div>

                      <button 
                         className="btn btn-ghost" 
                         style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '8px', border: 'none', background: 'none' }}
                         onClick={onSignOut}
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                         Sign Out
                      </button>
                   </div>
                )}
             </div>
          )}
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <button className="drawer-close" onClick={() => setIsMenuOpen(false)}>×</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <div style={{ padding: '0.5rem 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>{user?.email}</div>
          <button className="drawer-link" onClick={() => { setIsMenuOpen(false); window.location.hash = 'type=recovery'; }} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>Change Password</button>
          <button className="drawer-link" onClick={() => { setIsMenuOpen(false); onSignOut(); }} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>Sign Out</button>
        </div>
        <button className="drawer-cta" onClick={() => { setIsMenuOpen(false); handleCreateNew(); }}>
          Create New Resume
        </button>
      </div>

      <main style={{ flex: 1, padding: '100px 20px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
         <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Your Resumes</h1>
         <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>Manage and edit your saved resumes.</p>

         {loading && documents.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-light)', opacity: 0.5 }}>
               {/* Content area is empty while loading initial set */}
            </div>
         ) : (
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
               
               {/* Create New Card */}
               <div 
                  onClick={handleCreateNew}
                  style={{
                     border: '2px dashed var(--glass-border)',
                     borderRadius: 'var(--radius-lg)',
                     padding: '30px',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     cursor: 'pointer',
                     minHeight: '200px',
                     background: 'var(--glass-surface)',
                     transition: 'all 0.2s ease',
                     color: 'var(--text)'
                  }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--accent)', color: 'var(--accent)', transform: 'translateY(-2px)' })}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--glass-border)', color: 'var(--text)', transform: 'none' })}
               >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
                     <line x1="12" y1="5" x2="12" y2="19"></line>
                     <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span style={{ fontWeight: 600 }}>Create New Resume</span>
               </div>

               {/* Import Card */}
               <div 
                  onClick={handleImportClick}
                  style={{
                     border: '2px dashed var(--glass-border)',
                     borderRadius: 'var(--radius-lg)',
                     padding: '30px',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     cursor: 'pointer',
                     minHeight: '200px',
                     background: 'var(--glass-surface)',
                     transition: 'all 0.2s ease',
                     color: 'var(--text)'
                  }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--accent)', color: 'var(--accent)', transform: 'translateY(-2px)' })}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--glass-border)', color: 'var(--text)', transform: 'none' })}
               >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                     <polyline points="17 8 12 3 7 8"></polyline>
                     <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span style={{ fontWeight: 600 }}>Import Existing CV</span>
                  <input 
                    type="file" 
                    id="import-upload" 
                    hidden 
                    accept=".pdf,.docx,.txt" 
                    onChange={handleFileImport}
                  />
               </div>


                {/* Existing Resumes */}
                {documents.map(doc => (
                   <div 
                      key={doc.id}
                      onClick={() => onOpenDocument(doc.id)}
                      className="reveal"
                      style={{
                         border: '1px solid var(--glass-border)',
                         borderRadius: 'var(--radius-lg)',
                         padding: '24px',
                         display: 'flex',
                         flexDirection: 'column',
                         cursor: 'pointer',
                         minHeight: '200px',
                         background: 'var(--bg)',
                         boxShadow: 'var(--shadow-sm)',
                         transition: 'all 0.2s ease',
                         position: 'relative'
                      }}
                     onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--accent)', transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)' })}
                     onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--glass-border)', transform: 'none', boxShadow: 'var(--shadow-sm)' })}
                  >
                     <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text)' }}>{doc.name || 'Untitled Resume'}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                           Updated: {new Date(doc.updated_at).toLocaleDateString()}
                        </p>
                        {doc.views_count > 0 && (
                           <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              {doc.views_count} Views
                           </div>
                        )}
                     </div>
                     
                     <div className="resume-card-actions" style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                        <button 
                           className="btn btn-ghost" 
                           onClick={(e) => handleDownloadClick(e, doc)}
                           disabled={isDownloading === doc.id}
                           style={{ flex: 1, fontSize: '0.75rem', padding: '6px' }}
                           title="Download Options"
                        >
                           {isDownloading === doc.id ? '...' : 'Download'}
                        </button>
                        <button 
                           className="btn btn-ghost" 
                           onClick={(e) => handleDuplicate(e, doc.id)}
                           disabled={isDuplicating === doc.id}
                           style={{ flex: 1, fontSize: '0.75rem', padding: '6px' }}
                           title="Duplicate Resume"
                        >
                           {isDuplicating === doc.id ? '...' : 'Duplicate'}
                        </button>
                     </div>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>Open Editor →</span>
                        <button 
                           onClick={(e) => confirmDelete(e, doc)}
                           style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '5px' }}
                           title="Delete"
                        >
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                           </svg>
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </main>

      {/* Loading Toast */}
      {(loading || isCreating) && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border)',
          padding: '12px 24px',
          borderRadius: '100px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          animation: 'toastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div className="spinner-simple" style={{
            width: '18px',
            height: '18px',
            border: '2px solid var(--accent-soft)',
            borderTop: '2px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            {isCreating ? 'Creating your resume...' : 'Retrieving your resumes...'}
          </span>
          <style>{`
            @keyframes toastIn {
              from { transform: translate(-50%, 20px); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModalDoc && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
           <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🗑️</div>
              <h3 style={{ marginBottom: '10px' }}>Delete Resume?</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '30px', lineHeight: '1.6' }}>
                 Are you sure you want to delete <strong>"{deleteModalDoc.name || 'this resume'}"</strong>? 
                 <br />This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button 
                    className="btn btn-ghost" 
                    style={{ flex: 1 }} 
                    onClick={() => setDeleteModalDoc(null)}
                 >
                    Cancel
                 </button>
                 <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, background: '#e11d48', color: 'white', border: 'none' }} 
                    onClick={handleDelete}
                 >
                    Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      {showDownloadOptions && (
        <DownloadOptionsModal 
          onDismiss={() => setShowDownloadOptions(false)} 
          onDownload={handleDownloadAction}
          unlocked={false} 
          userId={user?.id}
        />
      )}

      {/* Parsing Overlay */}
      {isParsing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          color: 'var(--text)',
          animation: 'pFadeUp 0.3s ease'
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            padding: '40px 60px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'floatIcon 2s ease-in-out infinite' }}>
              🤖
            </div>
            <h2 style={{ marginBottom: '10px' }}>Importing Resume</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{parsingStep}</p>
            
            <div style={{ marginTop: '30px', width: '100%', height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: '60%', 
                height: '100%', 
                background: 'var(--accent)', 
                animation: 'loadingBar 2s infinite ease-in-out' 
              }}></div>
            </div>
          </div>
          <style>{`
            @keyframes loadingBar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
        </div>
      )}
    </div>

  )
}
