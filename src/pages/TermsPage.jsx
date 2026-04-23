import React from 'react';

export default function TermsPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', fontFamily: 'var(--sans)', color: 'var(--text)', lineHeight: '1.6' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '30px', fontWeight: 600 }}>← Back to Home</button>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
        <p>By accessing and using Resumely ("we", "our", "us"), you accept and agree to be bound by the terms and provision of this agreement. Our resume building services and site infrastructure are provided strictly under these terms.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>2. Use License & Payments</h2>
        <p>Resumely operates on a simple flat-fee system. By paying the specified processing fee ($8), you are granted a lifetime right to download the final generated PDF without watermarks. However, this does not grant you rights to replicate, copy, or redistribute the internal software, codebase, or proprietary templates of Resumely itself outside the scope of your personal resume.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>3. AI Generation Usage</h2>
        <p>We provide access to an AI assistant to enhance resume bullet points. To prevent abuse, each user is strictly limited to an anti-abuse threshold per session. Attempts to bypass, automate, or flood our enhancement APIs will result in immediate IP banning or account suspension without refund.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>4. Disclaimer of Warranties</h2>
        <p>Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that the utilization of our resumes will result in employment, as hiring decisions are strictly governed by external employers.</p>
      </section>
    </div>
  );
}
