import React from 'react';

export default function PrivacyPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', fontFamily: 'var(--sans)', color: 'var(--text)', lineHeight: '1.6' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '30px', fontWeight: 600 }}>← Back to Home</button>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>1. Data Collection</h2>
        <p>We collect information you explicitly provide: email address for account management, and resume content (work history, skills, etc.) for document generation. We also collect basic usage analytics (e.g., number of AI enhancements used) and standard server logs (IP addresses) to prevent abuse.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>2. Third-Party AI Processing</h2>
        <p>To provide "AI Enhancement" features, we securely transmit the text of your resume bullet points to third-party providers (such as Groq or OpenAI). This data is transmitted anonymously without your name or email. These providers are prohibited from using your data to train their models.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>3. Data Storage & Security</h2>
        <p>We use industry-standard encryption and secure cloud providers (Supabase/PostgreSQL) to store your account and resume data. Your data is protected by Row Level Security (RLS), ensuring only you can access your own documents.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>4. Your Rights (Deletion & Access)</h2>
        <p>You have full control over your data. You can delete individual documents at any time. We also provide a "Delete Account" feature in your profile settings which permanently purges your account, email, and all associated resume data from our servers and authentication systems. This action is irreversible.</p>
      </section>
    </div>
  );
}
