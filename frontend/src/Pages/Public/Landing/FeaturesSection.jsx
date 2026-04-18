import { FileText, Brain, Zap, TrendingUp, Shield } from 'lucide-react';
import BorderGlow from './components/BorderGlow';
import { useTheme } from '../../../context/ThemeContext';

const features = [
  {
    Icon: FileText,
    title: 'CV Builder',
    description: 'Create professional, ATS-optimized resumes with our intelligent builder. Pick from multiple templates and customize every detail.',
    glowColor: '160 60 45',
    colors: ['#34d399', '#059669', '#10b981'],
  },
  {
    Icon: Brain,
    title: 'ATS Score',
    description: 'Instant compatibility score and feedback for applicant tracking systems. Know exactly where your CV stands.',
    glowColor: '35 85 60',
    colors: ['#f59e0b', '#d97706', '#fbbf24'],
  },
  {
    Icon: Zap,
    title: 'Skill Gap Detection',
    description: 'AI identifies exactly which skills you need to develop for target roles. Bridge the gap between where you are and where you want to be.',
    glowColor: '190 70 55',
    colors: ['#22d3ee', '#0891b2', '#67e8f9'],
  },
  {
    Icon: TrendingUp,
    title: 'Career Path AI',
    description: 'Personalized career trajectories based on your experience and industry trends. Plan your next 5 years with confidence.',
    glowColor: '270 55 60',
    colors: ['#a78bfa', '#7c3aed', '#c4b5fd'],
  },
  {
    Icon: Shield,
    title: 'Secure & Private',
    description: 'Your data stays encrypted end-to-end. We never share your information with third parties. Your career data belongs to you.',
    glowColor: '30 10 50',
    colors: ['#a8a29e', '#78716c', '#d6d3d1'],
  },
];

export default function FeaturesSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="features"
      className="w-full"
      style={{ padding: 'clamp(5rem, 12%, 9rem) clamp(1.5rem, 5%, 4rem)' }}
    >
      {/* Section header */}
      <div className="text-center" style={{ marginBottom: 'clamp(3rem, 6%, 5rem)' }}>
        <span className="paper-section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
          Features
        </span>
        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--fg)',
          }}
        >
          Everything Your
          <br />
          <span style={{ color: 'var(--accent)' }}>CV Needs</span>
        </h2>
        <p
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
            color: 'var(--fg-muted)',
            maxWidth: '520px',
            margin: '1rem auto 0',
            lineHeight: 1.7,
          }}
        >
          Our AI-powered platform handles every aspect of your resume, from creation to optimization.
        </p>
      </div>

      {/* Feature cards grid with BorderGlow */}
      <div
        className="grid w-full max-w-6xl mx-auto"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 30vw, 340px), 1fr))',
          gap: 'clamp(1.5rem, 3%, 2rem)',
        }}
      >
        {features.map(({ Icon, title, description, glowColor, colors }, i) => (
          <BorderGlow
            key={i}
            edgeSensitivity={35}
            glowColor={glowColor}
            backgroundColor={isDark ? '#262220' : '#ffffff'}
            borderRadius={16}
            glowRadius={30}
            glowIntensity={isDark ? 1.2 : 0.6}
            coneSpread={30}
            colors={colors}
            fillOpacity={isDark ? 0.4 : 0.15}
          >
            <div style={{ padding: 'clamp(1.5rem, 3%, 2.25rem)' }}>
              {/* Icon */}
              <div
                style={{
                  width: 'clamp(2.5rem, 4vw, 3rem)',
                  height: 'clamp(2.5rem, 4vw, 3rem)',
                  marginBottom: 'clamp(1rem, 2%, 1.5rem)',
                  borderRadius: '10px',
                  background: `${colors[0]}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  style={{
                    width: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                    height: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                    color: colors[0],
                  }}
                  strokeWidth={2}
                />
              </div>

              <h3
                style={{
                  fontFamily: "'Libre Bodoni', serif",
                  fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  marginBottom: 'clamp(0.5rem, 1%, 0.75rem)',
                  color: 'var(--fg)',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: "'Public Sans', sans-serif",
                  fontSize: 'clamp(0.82rem, 1vw, 0.92rem)',
                  lineHeight: 1.7,
                  color: 'var(--fg-muted)',
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>
          </BorderGlow>
        ))}
      </div>
    </section>
  );
}
