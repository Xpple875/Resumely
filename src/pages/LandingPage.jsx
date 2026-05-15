import React, { useEffect, useState } from 'react'
import AuthModal from '../components/AuthModal.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import '../styles/landing.css'

export default function LandingPage({ onStart, user, onSignIn, onShowTerms, onShowPrivacy, theme, setTheme }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Scroll reveal observer
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { 
          entry.target.classList.add('visible'); 
          observer.unobserve(entry.target); 
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => {
       observer.disconnect();
    }
  }, []);

  const handleStartBuildingClick = () => {
    if (user) {
      onStart(user);
    } else {
      setShowAuthModal(true);
    }
  }

  const handleAuthSuccess = (newUser) => {
    if (onSignIn) {
      onSignIn(newUser);
    }
    setShowAuthModal(false);
    onStart(newUser); // Continue to dashboard immediately
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      <div className="bg-glow"></div>
      <nav>
        <div className="nav-logo">Resum<span>ely</span></div>
        <div className="nav-right">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <button className="nav-cta" onClick={handleStartBuildingClick}>
            {user ? 'Go to Editor' : 'Start Building'}
          </button>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <button className="drawer-close" onClick={() => setIsMenuOpen(false)}>×</button>
        <a href="#how" className="drawer-link" onClick={() => setIsMenuOpen(false)}>How it works</a>
        <a href="#pricing" className="drawer-link" onClick={() => setIsMenuOpen(false)}>Pricing</a>
        <button className="drawer-cta" onClick={() => { setIsMenuOpen(false); handleStartBuildingClick(); }}>
          {user ? 'Go to Editor' : 'Start Building'}
        </button>
      </div>

      <main>
        <section className="hero-section section-alt reveal" id="early-access">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="eyebrow">The #1 Free AI Resume Maker</div>
              <h1>The Best Free AI Resume Builder <br/>for <em>ATS-Friendly</em> Resumes</h1>
              <p className="hero-sub">Build a professional, recruiter-approved resume in 15 minutes. No subscription traps, no hidden fees, and no watermarks. <strong>Free for now</strong> while we're in early access.</p>

              <div className="form-wrap" style={{ marginTop: '2rem' }}>
                <button 
                  className="submit-btn" 
                  onClick={handleStartBuildingClick} 
                  style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)', width: 'auto' }}
                >
                  Start Building →
                </button>
              </div>

              <div className="social-proof" style={{ marginTop: '3rem' }}>
                <div className="avatars">
                  <div className="avatar" style={{background:'#8B6F5E'}}>AK</div>
                  <div className="avatar" style={{background:'#5E7A8B'}}>MR</div>
                  <div className="avatar" style={{background:'#6B8B5E'}}>JL</div>
                  <div className="avatar" style={{background:'#8B5E7A'}}>SP</div>
                </div>
                <p className="proof-text"><strong>4,700+</strong> resumes generated</p>
              </div>
            </div>

            <div className="hero-visual">
               <div className="hero-mockup">
                  <div className="mockup-shine"></div>
                  <div className="mockup-sidebar">
                     <div className="mockup-profile"></div>
                     <div className="mockup-sidebar-lines">
                        <div className="mockup-line-sm"></div>
                        <div className="mockup-line-sm"></div>
                        <div className="mockup-line-sm"></div>
                     </div>
                  </div>
                  <div className="mockup-content">
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
                  <div className="mockup-cursor">
                     <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4.16666 1.66666L17.5 8.33333L10.8333 10.8333L8.33332 17.5L4.16666 1.66666Z" fill="white" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
                     </svg>
                  </div>
               </div>
               <div className="hero-orb orb-1"></div>
               <div className="hero-orb orb-2"></div>
            </div>
          </div>
        </section>

        <section className="section reveal">
          <div className="section-inner">
            <p className="section-label">The problem</p>
            <h2 className="section-title">Resume builders are broken for people who actually need them</h2>
            <p className="section-body">Either free and useless, or polished and $25 a month. Meanwhile your application disappears before a human ever reads it.</p>
            <div className="pain-grid">
              <div className="pain-card">
                 <div className="pain-num">01</div>
                 <div className="pain-title">Subscription traps</div>
                 <div className="pain-body">You spend 40 minutes building your resume then discover the PDF costs $23.70/month. Every time.</div>
              </div>
              <div className="pain-card">
                 <div className="pain-num">02</div>
                 <div className="pain-title">ATS failures</div>
                 <div className="pain-body">Templates with columns and icons look great to humans. They're invisible to the software that screens 75% of applications first.</div>
              </div>
              <div className="pain-card">
                 <div className="pain-num">03</div>
                 <div className="pain-title">Blank page paralysis</div>
                 <div className="pain-body">Knowing what you did and writing it well on paper are completely different skills. Most people freeze at the bullet points.</div>
              </div>
              <div className="pain-card">
                 <div className="pain-num">04</div>
                 <div className="pain-title">Generic output</div>
                 <div className="pain-body">Free templates produce resumes that look exactly like everyone else's. You're competing in a pile of identical documents.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="how-section section-alt reveal" id="how">
          <div className="how-inner">
            <p className="section-label">How it works</p>
            <h2 className="section-title">Three steps. One finished resume.</h2>
            <div className="steps">
              <div className="step">
                <div className="step-num">01</div>
                <div className="step-title">Fill in your details</div>
                <div className="step-body">Work history, education, skills. No formatting decisions — just your information. The live preview builds as you type.</div>
              </div>
              <div className="step">
                <div className="step-num">02</div>
                <div className="step-title">Refine your bullets</div>
                <div className="step-body">Type what you actually did. The AI rewrites it into strong achievement-oriented language that reads well to recruiters.</div>
              </div>
              <div className="step">
                <div className="step-num">03</div>
                <div className="step-title">Download your PDF</div>
                <div className="step-body">Get a clean, ATS-safe PDF instantly. It's free while we're in early access — if it helps you, a small donation is appreciated!</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rewritten-section reveal">
          <div className="rewritten-inner">
            <div className="rewritten-header">
               <p className="section-label">Profile, rewritten</p>
               <h2 className="section-title">Your headline, clarified, not generated.</h2>
            </div>
            
            <div className="rewritten-content">
               <div className="comparison-wrap">
                  <div className="comp-card">
                     <div className="comp-item before">
                        <p className="comp-label">Draft</p>
                        <p className="comp-text">I am a software developer with a few years of experience in web technologies and I have also done some work with managing servers.</p>
                     </div>
                     <div className="comp-item after">
                        <p className="comp-label accent">Rewritten</p>
                        <p className="comp-text">As a Senior Full-Stack Engineer, I architect and orchestrate high-availability web systems that serve over 2 million users, leveraging enterprise-grade cloud solutions to ensure peak performance and global scalability.</p>
                     </div>
                  </div>
               </div>
            </div>

            </div>
         </section>

        <section className="features-section section-alt reveal">
          <div className="features-inner">
            <p className="section-label">What's included</p>
            <h2 className="section-title">Everything you need.<br/>Nothing you don't.</h2>
            <div className="features-grid">
              <div className="feature-card reveal">
                <div className="feature-icon">⬡</div>
                <div className="feature-title">ATS-safe templates</div>
                <div className="feature-body">Every template is tested against real ATS scanners before it ships. Clean structure, parseable text, correct formatting.</div>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon">◎</div>
                <div className="feature-title">Live preview</div>
                <div className="feature-body">Your resume updates in real time as you type. What you see is exactly what you download — no layout surprises.</div>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon">✦</div>
                <div className="feature-title">AI bullet rewriter</div>
                <div className="feature-body">Type a rough description of what you did. Get back a polished, achievement-oriented bullet point that reads well to both humans and ATS.</div>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon">◈</div>
                <div className="feature-title">Autosave</div>
                <div className="feature-body">Your work saves automatically every 30 seconds. Come back tomorrow and pick up exactly where you left off.</div>
              </div>
              <div className="feature-card wide reveal">
                <div style={{flex:1}}>
                  <div className="feature-icon">◻</div>
                  <div className="feature-title">Early access pricing</div>
                  <div className="feature-body">Resumely is free while we polish the platform. No credit card required. No catch. All we ask is for your feedback.</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div style={{fontFamily:'var(--serif)', fontSize:'2.5rem', color:'var(--accent)', lineHeight:1}}>Free</div>
                  <div style={{fontSize:'0.75rem', color:'var(--text-light)', marginTop:'0.2rem'}}>for early adopters</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="compare-section reveal">
          <p className="section-label">vs. the alternatives</p>
          <h2 className="section-title">How we compare</h2>
          <div className="compare-table-wrap">
            <table className="compare-table">
            <thead>
              <tr><th>Tool</th><th>Price</th><th>ATS safe</th><th>AI writing</th></tr>
            </thead>
            <tbody>
              <tr className="ours"><td>Resumely</td><td>Free*</td><td className="tick">✓</td><td className="tick">✓</td></tr>
              <tr><td>Zety</td><td>$23.70/mo</td><td className="partial">~</td><td className="tick">✓</td></tr>
              <tr><td>Novoresume</td><td>$19.99/mo</td><td className="partial">~</td><td className="cross">✗</td></tr>
              <tr><td>Canva (free)</td><td>Free</td><td className="cross">✗</td><td className="cross">✗</td></tr>
              <tr><td>Google Docs</td><td>Free</td><td className="tick">✓</td><td className="cross">✗</td></tr>
            </tbody>
          </table>
        </div>
      </section>

        <section className="pricing-section section-alt" id="pricing">
          <div className="pricing-inner">
            <p className="section-label">Early Access</p>
            <h2 className="section-title">Free for now.</h2>
            <div className="pricing-card reveal">
              <div className="price-row">
                <div className="price-amount">$0</div>
                <div className="price-label">while in beta</div>
              </div>
              <p className="price-desc">Build, preview, and download your perfect resume for free. We'll be moving to an honest one-time price later this year.</p>
              <ul className="price-features">
                <li>Full AI-powered resume editor</li>
                <li>Multiple professional templates</li>
                <li>Public sharing (Recruiter links)</li>
                <li>Unlimited AI bullet point rewrites</li>
                <li>Clean PDF — no watermarks</li>
                <li>No credit card or subscription required</li>
              </ul>
              <div className="pricing-note-box">
                 <strong>Optional Donation:</strong> If Resumely helps you get a job, consider buying me a coffee to keep the servers running.
              </div>
              <button onClick={handleStartBuildingClick} className="pricing-cta" style={{marginTop:'1.5rem'}}>Start Building — Free →</button>
            </div>
          </div>
        </section>

        <section className="faq-section reveal">
          <div className="section-inner">
            <p className="section-label">Common Questions</p>
            <h2 className="section-title">Everything you need to know about building your resume</h2>
            <div className="faq-grid">
              <div className="faq-item reveal">
                <div className="faq-icon">?</div>
                <div className="faq-q">Is Resumely really free?</div>
                <div className="faq-a">Yes. While in early access, every feature — including AI writing and PDF downloads — is 100% free with no watermarks or hidden credit card requirements.</div>
              </div>
              <div className="faq-item reveal">
                <div className="faq-icon">!</div>
                <div className="faq-q">What makes this the best resume builder?</div>
                <div className="faq-a">Unlike other builders, we focus on "ATS Science." Our templates are tested against real scanners to ensure your resume actually gets read by human recruiters.</div>
              </div>
              <div className="faq-item reveal">
                <div className="faq-icon">✦</div>
                <div className="faq-q">Can I use this for any industry?</div>
                <div className="faq-a">Absolutely. Our AI is trained on millions of job descriptions across tech, healthcare, finance, and creative fields to provide the best resume bullet points for your specific role.</div>
              </div>
              <div className="faq-item reveal">
                <div className="faq-icon">↓</div>
                <div className="faq-q">How do I download my resume?</div>
                <div className="faq-a">Once you're happy with your design, just click the download button in the editor. You'll get a clean, professional PDF instantly.</div>
              </div>
              <div className="faq-item reveal">
                <div className="faq-icon">✎</div>
                <div className="faq-q">Can I edit my resume later?</div>
                <div className="faq-a">Yes. Your work is automatically saved. You can log back in anytime to update your experience, change templates, or download a fresh copy.</div>
              </div>
              <div className="faq-item reveal">
                <div className="faq-icon">🔗</div>
                <div className="faq-q">Can I share a link with recruiters?</div>
                <div className="faq-a">Yes! Every resume can be made "Public," giving you a unique link to share with recruiters or on LinkedIn, which includes a live web preview of your resume.</div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="footer-logo">Resum<span>ely</span></div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '15px', fontSize: '0.85rem' }}>
           <button onClick={onShowTerms} style={{ background:'none', border:'none', color:'var(--text-light)', cursor:'pointer', padding: 0 }}>Terms of Service</button>
           <button onClick={onShowPrivacy} style={{ background:'none', border:'none', color:'var(--text-light)', cursor:'pointer', padding: 0 }}>Privacy Policy</button>
        </div>
        <p className="footer-note" style={{ marginTop: '15px' }}>{new Date().getFullYear()} Resumely · Built by a solo developer who got tired of subscription traps</p>
      </footer>

      {showAuthModal && (
        <AuthModal 
          onDismiss={() => {
            setShowAuthModal(false);
            // Even if they close, let them use the builder (allow frictionless guest mode)
            onStart(); 
          }} 
          onSuccess={handleAuthSuccess}
          context={'signup_first'}
        />
      )}
    </div>
  )
}
