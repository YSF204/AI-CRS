import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Building2, CheckCircle, Mail } from 'lucide-react';

export default function PendingActivation() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 4%, 3rem)',
        background: '#fbfaee',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#ffffff',
          border: '4px solid #1b1c15',
          boxShadow: '8px 8px 0px 0px #1b1c15',
          padding: 'clamp(2rem, 5%, 3.5rem)',
          borderRadius: 0,
        }}
      >
        {/* Icon header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#1e51f6', border: '4px solid #1b1c15', padding: '12px', display: 'inline-flex' }}>
            <Clock size={32} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 12,
                fontWeight: 800,
                color: '#1b1c15',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: 4
              }}
            >
              Registration Complete
            </p>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                color: '#1b1c15',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1.1
              }}
            >
              Account Pending Review
            </h1>
          </div>
        </div>

        {/* Status badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 32,
            padding: '12px 16px',
            background: '#fbfaee',
            border: '4px solid #1b1c15',
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          <Building2 size={18} color="#1b1c15" strokeWidth={2.5} />
          <span style={{ color: '#1b1c15' }}>Employer Account — Awaiting Approval</span>
        </div>

        {/* Explanation */}
        <p style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 15,
          color: '#1b1c15',
          lineHeight: 1.6,
          fontWeight: 500,
          marginBottom: 32
        }}>
          Your employer account has been created and submitted to our team for verification. This process typically takes <strong style={{ fontWeight: 800 }}>1–2 business days</strong>.
        </p>

        {/* What happens next */}
        <div style={{ borderTop: '4px solid #1b1c15', paddingTop: 32, marginBottom: 40 }}>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: '#1b1c15',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 20
          }}>
            What Happens Next?
          </p>
          {[
            { icon: CheckCircle, text: 'Our admin team reviews your company details and license.' },
            { icon: Mail, text: 'You will receive an email notification once your account is approved.' },
            { icon: Building2, text: 'After approval, you can log in and deploy your talent pipelines.' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <Icon size={20} color="#1e51f6" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14,
                color: '#1b1c15',
                fontWeight: 600,
                lineHeight: 1.5,
                margin: 0
              }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              flex: 1,
              minWidth: 140,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '16px 20px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              background: '#1e51f6',
              color: '#ffffff',
              border: '4px solid #1b1c15',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translate(2px, 2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translate(0px, 0px)'}
          >
            ← Back to Home
          </Link>
          <Link
            to="/auth?mode=login"
            style={{
              flex: 1,
              minWidth: 140,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '16px 20px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              background: '#fbfaee',
              color: '#1b1c15',
              border: '4px solid #1b1c15',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translate(2px, 2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translate(0px, 0px)'}
          >
            Login Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
