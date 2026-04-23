import React, { useEffect, useState } from 'react'
import { getUserDocuments, createDocument, deleteDocument, deleteUserAccount } from '../services/supabaseClient'
import { defaultResumeData } from '../utils/defaultData'
import '../styles/landing.css' // Reuse landing styles or global styles

export default function DashboardPage({ user, onOpenDocument, onSignOut }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteModalDoc, setDeleteModalDoc] = useState(null)

  useEffect(() => {
    if (!user) return
    loadDocs()
  }, [user])

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

  const handleCreateNew = async () => {
    try {
      setIsCreating(true)
      const newId = await createDocument(user.id, "Untitled Resume", defaultResumeData)
      onOpenDocument(newId)
    } catch (err) {
      console.error("Failed to create document", err)
      alert("Database Error: " + (err.message || 'Check browser console'))
    } finally {
      setIsCreating(false)
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

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav>
        <div className="nav-logo">Resum<span>ely</span></div>
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && (
             <div style={{ position: 'relative' }}>
                <button
                   onClick={() => setIsProfileOpen(!isProfileOpen)}
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
        </div>
      </nav>

      <main style={{ flex: 1, padding: '100px 20px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
         <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Your Resumes</h1>
         <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>Manage and edit your saved resumes.</p>

         {loading && documents.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-light)', opacity: 0.5 }}>
               {/* Content area is empty while loading initial set */}
            </div>
         ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
               
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

               {/* Existing Resumes */}
               {documents.map(doc => (
                  <div 
                     key={doc.id}
                     onClick={() => onOpenDocument(doc.id)}
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
                     </div>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
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
                    style={{ flex: 1, background: '#e74c3c' }} 
                    onClick={handleDelete}
                 >
                    Delete Forever
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
