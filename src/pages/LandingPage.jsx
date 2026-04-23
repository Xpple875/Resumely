import React, { useEffect, useState } from 'react'
import AuthModal from '../components/AuthModal.jsx'
import '../styles/landing.css'

export default function LandingPage({ onStart, user, onSignIn, onShowTerms, onShowPrivacy }) {
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

  return (
    <div className="landing-page">
      <nav>
        <div className="nav-logo">Resum<span>ely</span></div>
        <div className="nav-right">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <button className="nav-cta" onClick={handleStartBuildingClick}>
            {user ? 'Go to Editor' : 'Start Building'}
          </button>
        </div>
      </nav>

      <main>
        <section className="hero-section" id="early-access">
          <div className="hero-content">
            <div className="eyebrow">Build your professional resume today</div>
            <h1>Your resume, <em>finally</em><br/>working for you</h1>
            <p className="hero-sub">ATS-ready resume in 15 minutes. No subscription. No watermarks. Pay once — $8 — and it's yours.</p>

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

        <section className="section reveal">
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
        </section>

        <section className="how-section" id="how">
          <div className="how-inner">
            <p className="section-label">How it works</p>
            <h2 className="section-title reveal">Three steps. One finished resume.</h2>
            <div className="steps">
              <div className="step reveal">
                <div className="step-num">01</div>
                <div className="step-title">Fill in your details</div>
                <div className="step-body">Work history, education, skills. No formatting decisions — just your information. The live preview builds as you type.</div>
              </div>
              <div className="step reveal">
                <div className="step-num">02</div>
                <div className="step-title">Refine your bullets</div>
                <div className="step-body">Type what you actually did. The AI rewrites it into strong achievement-oriented language that reads well to recruiters.</div>
              </div>
              <div className="step reveal">
                <div className="step-num">03</div>
                <div className="step-title">Download your PDF</div>
                <div className="step-body">Pay once — $8. Download a clean, ATS-safe PDF. No watermark, no monthly charge, no account required to start.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section reveal">
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
                <div className="feature-title">One honest price</div>
                <div className="feature-body">$8 once. Not $8 a month. Not a free trial that expires. You pay when you download. The PDF is yours forever.</div>
              </div>
              <div style={{textAlign:'right', flexShrink:0}}>
                <div style={{fontFamily:'var(--serif)', fontSize:'3rem', color:'var(--accent)', lineHeight:1}}>$8</div>
                <div style={{fontSize:'0.75rem', color:'var(--text-light)', marginTop:'0.2rem'}}>one-time · no subscription</div>
              </div>
            </div>
          </div>
        </section>

        <section className="compare-section reveal">
          <p className="section-label">vs. the alternatives</p>
          <h2 className="section-title">How we compare</h2>
          <table className="compare-table">
            <thead>
              <tr><th>Tool</th><th>Price</th><th>ATS safe</th><th>AI writing</th></tr>
            </thead>
            <tbody>
              <tr className="ours"><td>Resumely</td><td>$8 once</td><td className="tick">✓</td><td className="tick">✓</td></tr>
              <tr><td>Zety</td><td>$23.70/mo</td><td className="partial">~</td><td className="tick">✓</td></tr>
              <tr><td>Novoresume</td><td>$19.99/mo</td><td className="partial">~</td><td className="cross">✗</td></tr>
              <tr><td>Canva (free)</td><td>Free</td><td className="cross">✗</td><td className="cross">✗</td></tr>
              <tr><td>Google Docs</td><td>Free</td><td className="tick">✓</td><td className="cross">✗</td></tr>
            </tbody>
          </table>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="pricing-inner">
            <p className="section-label">Pricing</p>
            <h2 className="section-title">Simple. No catch.</h2>
            <div className="pricing-card reveal">
              <div className="price-row">
                <div className="price-amount">$8</div>
                <div className="price-label">one-time</div>
              </div>
              <p className="price-desc">Pay once when you download. Free to build, free to preview.</p>
              <ul className="price-features">
                <li>Full resume editor — all sections, all fields</li>
                <li>3 ATS-tested templates</li>
                <li>Live preview as you type</li>
                <li>Unlimited AI bullet point rewrites</li>
                <li>Clean PDF — no watermark</li>
                <li>Autosave — your work is never lost</li>
                <li>All future templates included</li>
              </ul>
              <button onClick={handleStartBuildingClick} className="pricing-cta">Start Building →</button>
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
        <p className="footer-note" style={{ marginTop: '15px' }}>© {new Date().getFullYear()} Resumely · Built by a solo developer who got tired of subscription traps</p>
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
