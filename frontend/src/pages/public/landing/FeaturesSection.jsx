import { FileText, Brain, Zap, Shield } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const features = [
  {
    Icon: FileText,
    title: 'CV Builder',
    description: 'Create professional, ATS-optimized resumes with our intelligent builder. Pick from multiple templates and customize every detail.',
    color: 'var(--nm-primary)',
  },
  {
    Icon: Brain,
    title: 'ATS Score',
    description: 'Instant compatibility score and feedback for applicant tracking systems. Know exactly where your CV stands.',
    color: 'var(--nm-warning)',
  },
  {
    Icon: Zap,
    title: 'Skill Gap Detection',
    description: 'AI identifies exactly which skills you need to develop for target roles. Bridge the gap between where you are and where you want to be.',
    color: 'var(--nm-success)',
  },
  {
    Icon: Shield,
    title: 'Secure & Private',
    description: 'Your data stays encrypted end-to-end. We never share your information with third parties. Your career data belongs to you.',
    color: 'var(--nm-ink)',
  },
];

export default function FeaturesSection() {
  const { theme } = useTheme();

  return (
    <section
      id="features"
      className="w-full"
      style={{ 
        padding: 'clamp(5rem, 12%, 9rem) clamp(1.5rem, 5%, 4rem)',
        backgroundColor: 'var(--nm-bg)'
      }}
    >
      {/* Section header */}
      <div className="text-center" style={{ marginBottom: 'clamp(4rem, 8%, 6rem)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'var(--nm-text-primary)',
            textTransform: 'uppercase',
            marginTop: '0.5rem'
          }}
        >
          Everything Your
          <br />
          <span style={{ color: 'var(--nm-primary)' }}>CV Needs</span>
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
            color: 'var(--nm-text-secondary)',
            maxWidth: '520px',
            margin: '1.5rem auto 0',
            lineHeight: 1.7,
          }}
        >
          Our AI-powered platform handles every aspect of your resume, from creation to optimization.
        </p>
      </div>

      {/* Feature cards grid */}
      <div
        className="grid w-full max-w-5xl mx-auto grid-cols-1 md:grid-cols-2"
        style={{
          gap: '2.5rem',
        }}
      >
        {features.map(({ Icon, title, description, color }, i) => (
          <div
            key={i}
            className="nm-card"
            style={{ 
              padding: 'clamp(2rem, 4%, 3rem)',
              borderWidth: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              background: 'var(--nm-surface)',
              boxShadow: '8px 8px 0 var(--nm-ink)',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-4px, -4px)';
              e.currentTarget.style.boxShadow = '12px 12px 0 var(--nm-ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '8px 8px 0 var(--nm-ink)';
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '4rem',
                height: '4rem',
                border: '4px solid var(--nm-ink)',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '4px 4px 0 var(--nm-ink)'
              }}
            >
              <Icon
                style={{
                  width: '2rem',
                  height: '2rem',
                  color: '#fff',
                }}
                strokeWidth={2.5}
              />
            </div>

            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.25rem, 1.8vw, 1.75rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: '1rem',
                  color: 'var(--nm-text-primary)',
                  textTransform: 'uppercase'
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
                  lineHeight: 1.6,
                  color: 'var(--nm-text-secondary)',
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
