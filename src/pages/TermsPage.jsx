import React from 'react';

export default function TermsPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', fontFamily: 'var(--sans)', color: 'var(--text)', lineHeight: '1.6' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '30px', fontWeight: 600 }}>← Back to Home</button>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
        <p>By accessing and using Resumely ("we", "our", "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>2. Description of Service</h2>
        <p>Resumely is an AI-powered resume building platform. We provide tools for users to create, preview, share, and export resumes. While in "Early Access," some or all features may be provided free of charge at our discretion.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>3. User Accounts & Data</h2>
        <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You retain full ownership of the content (resume data) you input into Resumely. By using our service, you grant us a license to host and process this data as necessary to provide the service.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>4. AI Enhancement Services</h2>
        <p>The "Enhance with AI" feature utilizes third-party large language models (LLMs) to process text. We cannot guarantee the accuracy, professional suitability, or total safety of the AI-generated output. Use AI suggestions at your own discretion.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>5. Limitation of Liability</h2>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, RESUMELY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>6. Termination</h2>
        <p>We reserve the right to terminate or suspend your account and access to our services at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of the service, us, or third parties, or for any other reason.</p>
      </section>
    </div>
  );
}
