import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Building2, CheckCircle, Mail } from 'lucide-react';

export default function PendingActivation() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      {/* Decorative elements */}
      <div className="hidden lg:block" style={{ position: 'fixed', bottom: '10%', left: '5%', width: 60, height: 60, background: '#FFE630', border: '3px solid #0a0a0a', transform: 'rotate(12deg)', opacity: 0.5 }} />
      <div className="hidden lg:block" style={{ position: 'fixed', top: '15%', right: '8%', width: 40, height: 80, background: 'var(--coral)', border: '3px solid #0a0a0a', transform: 'rotate(-8deg)', opacity: 0.4 }} />

      <div
        className="w-full max-w-lg"
        style={{
          background: 'var(--card-bg)',
          border: '3px solid var(--border-color)',
          boxShadow: '8px 8px 0 var(--shadow-color)',
          padding: 'clamp(2rem, 5%, 3rem)',
        }}
      >
        {/* Icon header */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{ background: '#FFE630', border: '3px solid #0a0a0a', padding: '10px', display: 'inline-flex' }}>
            <Clock size={28} color="#0a0a0a" />
          </div>
          <div>
            <p
              className="uppercase tracking-widest text-xs font-bold"
              style={{ fontFamily: "'DM Mono', monospace", color: 'var(--fg-muted)' }}
            >
              Registration Complete
            </p>
            <h1
              className="font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: 'var(--fg)', letterSpacing: '-0.03em' }}
            >
              Account Pending Review
            </h1>
          </div>
        </div>

        {/* Status badge */}
        <div
          className="flex items-center gap-2 mb-6 px-4 py-3"
          style={{ background: '#FFF3E0', border: '2px solid #FFB300', fontFamily: "'DM Mono', monospace", fontSize: 13 }}
        >
          <Building2 size={16} color="#FF8F00" />
          <span style={{ color: '#7F4500', fontWeight: 700 }}>EMPLOYER ACCOUNT — AWAITING ADMIN APPROVAL</span>
        </div>

        {/* Explanation */}
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.7, marginBottom: 24 }}>
          Your employer account has been created and submitted to our team for verification. This process typically takes <strong style={{ color: 'var(--fg)' }}>1–2 business days</strong>.
        </p>

        {/* What happens next */}
        <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: 20, marginBottom: 28 }}>
          <p className="font-bold uppercase tracking-wider text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--fg)' }}>
            What happens next?
          </p>
          {[
            { icon: CheckCircle, text: 'Our admin team reviews your company details and license.' },
            { icon: Mail, text: 'You will receive an email notification once your account is approved.' },
            { icon: Building2, text: 'After approval, you can log in and start posting jobs.' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3 mb-4">
              <Icon size={18} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/"
            className="flex-1"
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '12px 20px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em',
              textDecoration: 'none',
              background: '#FFE630', color: '#0a0a0a',
              border: '3px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '2px 2px 0 #0a0a0a'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 #0a0a0a'; }}
          >
            ← Back to Home
          </Link>
          <Link
            to="/auth"
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '12px 20px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em',
              textDecoration: 'none',
              background: 'transparent', color: 'var(--fg)',
              border: '3px solid var(--border-color)', boxShadow: '4px 4px 0 var(--shadow-color)',
            }}
          >
            Login Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
