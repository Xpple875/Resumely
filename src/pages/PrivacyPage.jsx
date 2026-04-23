import React from 'react';

export default function PrivacyPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', fontFamily: 'var(--sans)', color: 'var(--text)', lineHeight: '1.6' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '30px', fontWeight: 600 }}>← Back to Home</button>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>1. Information We Collect</h2>
        <p>When you use Resumely, you provide us with personal information strictly related to your professional career (e.g., your name, email, work history, and contact details) which is used solely to generate your resume document. If you choose to create an account, we store this securely in our encrypted database so you can access it later.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>2. How We Use Your Data</h2>
        <p>Your data is used entirely to formulate your document. We process your raw bullet points through a secure third-party AI provider strictly for the purpose of grammar and syntax enrichment. We do NOT sell, lease, or rent your personal information to recruiters, advertisers, or any third parties.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>3. Financial Data</h2>
        <p>All payment processing is handled securely and off-site. We do not store, process, or ever see your raw credit card numbers or financial details.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>4. Your Rights (Account Deletion)</h2>
        <p>You have the absolute right to have your data erased. Since your documents are tied specifically to your dashboard, deleting a document instantly scrubs it from our active database. If you wish to permanently delete your entire account, contact us and we will promptly execute a hard delete of your UUID and all associated records.</p>
      </section>
    </div>
  );
}
