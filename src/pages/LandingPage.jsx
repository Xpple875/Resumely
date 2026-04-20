import React from 'react'
import '../styles/landing.css'

export default function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      <header className="landing-header">
         <div className="landing-logo">Resum<span>e</span>ly</div>
         <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#templates">Templates</a>
            <button className="btn btn-primary" onClick={onStart}>Build Resume</button>
         </nav>
      </header>

      <main>
         <section className="hero-section">
            <div className="hero-content">
               <div className="hero-badge">AI-Powered Resume Builder</div>
               <h1 className="hero-title">
                  Land your next job with a <span>premium</span> resume.
               </h1>
               <p className="hero-desc">
                  Stop struggling with formatting. Resumely uses advanced AI to enhance your bullets and generates mathematically perfect PDFs that pass every ATS parser.
               </p>
               <div className="hero-actions">
                  <button className="btn btn-primary btn-lg" onClick={onStart}>
                     Create My Resume — Free
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
               </div>
            </div>
            <div className="hero-visual">
               {/* Decorative Abstract Resume UI */}
               <div className="hero-mockup">
                  <div className="mockup-header"></div>
                  <div className="mockup-body">
                     <div className="mockup-line w-full"></div>
                     <div className="mockup-line w-3/4"></div>
                     <div className="mockup-line w-1/2"></div>
                     <div className="mockup-block"></div>
                     <div className="mockup-line w-full"></div>
                     <div className="mockup-line w-5/6"></div>
                     <div className="mockup-block"></div>
                  </div>
               </div>
               <div className="hero-orb orb-1"></div>
               <div className="hero-orb orb-2"></div>
            </div>
         </section>

         <section id="features" className="features-section">
            <h2 className="section-title">Why use Resumely?</h2>
            <div className="features-grid">
               <div className="feature-card">
                  <div className="feature-icon">✨</div>
                  <h3>AI Enhancement</h3>
                  <p>Our Vercel AI proxy automatically rewrites your weak bullet points into impactful, action-driven achievements.</p>
               </div>
               <div className="feature-card">
                  <div className="feature-icon">📄</div>
                  <h3>ATS-Optimized</h3>
                  <p>No messy absolute positioning. Our engine generates clean, semantic PDFs that parsers can parse perfectly.</p>
               </div>
               <div className="feature-card">
                  <div className="feature-icon">🎨</div>
                  <h3>Premium Aesthetics</h3>
                  <p>Choose from three meticulously designed templates with micro-adjustable spacing and typography.</p>
               </div>
            </div>
         </section>
      </main>

      <footer className="landing-footer">
         <div className="landing-logo">Resum<span>e</span>ly</div>
         <p>© {new Date().getFullYear()} Resumely. All rights reserved.</p>
      </footer>
    </div>
  )
}
