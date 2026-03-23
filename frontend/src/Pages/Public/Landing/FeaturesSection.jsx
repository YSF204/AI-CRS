import { FileText, Brain, Zap, TrendingUp, Shield } from 'lucide-react';

const features = [
  {
    Icon: FileText,
    title: 'CV Builder',
    description: 'Create professional, ATS-optimized resumes with our intelligent builder.',
    bgClass: 'bg-brutal-yellow',
  },
  {
    Icon: Brain,
    title: 'ATS Score',
    description: 'Instant compatibility score and feedback for applicant tracking systems.',
    bgClass: 'bg-brutal-coral',
  },
  {
    Icon: Zap,
    title: 'Skill Gap Detection',
    description: 'AI identifies exactly which skills you need to develop for target roles.',
    bgClass: 'bg-brutal-teal',
  },
  {
    Icon: TrendingUp,
    title: 'Career Path AI',
    description: 'Personalized career trajectories based on your experience and trends.',
    bgClass: 'bg-brutal-mint',
  },
  {
    Icon: Shield,
    title: 'Secure & Private',
    description: 'Your data stays encrypted. We never share your information with third parties.',
    bgClass: 'bg-brutal-blue',
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="w-full"
      style={{ padding: 'clamp(4rem, 10%, 8rem) clamp(1.5rem, 5%, 4rem)' }}
    >
      {/* Section title */}
      <div className="text-center" style={{ marginBottom: 'clamp(2.5rem, 5%, 4rem)' }}>
        <span
          className="inline-block bg-brutal-coral text-black uppercase font-bold"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
            letterSpacing: '0.12em',
            padding: '0.2em 0.6em',
            marginBottom: 'clamp(0.75rem, 1.5%, 1.25rem)',
            border: '2px solid #0a0a0a',
            boxShadow: '3px 3px 0 #0a0a0a',
          }}
        >
          FEATURES
        </span>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 4rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginTop: 'clamp(0.75rem, 1.5%, 1.25rem)',
            color: 'var(--fg)',
          }}
        >
          EVERYTHING YOUR
          <br />
          <span className="text-brutal-yellow">CV NEEDS</span>
        </h2>
      </div>

      {/* Feature cards grid */}
      <div
        className="grid w-full max-w-6xl mx-auto"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(260px, 28vw, 340px), 1fr))',
          gap: 'clamp(1rem, 2%, 1.5rem)',
        }}
      >
        {features.map(({ Icon, title, description, bgClass }, i) => (
          <div
            key={i}
            className="brutal-card group cursor-default"
            style={{ padding: 'clamp(1.25rem, 2.5%, 2rem)' }}
          >
            {/* Icon block */}
            <div
              className={`${bgClass} text-black inline-flex items-center justify-center`}
              style={{
                width: 'clamp(2.5rem, 4vw, 3.5rem)',
                height: 'clamp(2.5rem, 4vw, 3.5rem)',
                marginBottom: 'clamp(0.75rem, 1.5%, 1.25rem)',
                border: '2px solid #0a0a0a',
                boxShadow: '3px 3px 0 #0a0a0a',
              }}
            >
              <Icon style={{ width: 'clamp(1.2rem, 1.8vw, 1.5rem)', height: 'clamp(1.2rem, 1.8vw, 1.5rem)' }} />
            </div>

            <h3
              className="uppercase"
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.2rem)',
                letterSpacing: '-0.01em',
                marginBottom: 'clamp(0.3rem, 0.8%, 0.5rem)',
                color: 'var(--fg)',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: 'clamp(0.75rem, 1vw, 0.88rem)',
                lineHeight: 1.6,
                color: 'var(--fg-muted)',
              }}
            >
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
