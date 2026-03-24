import CVShowcase from './CVShowcase';
import Shuffle from './components/Shuffle';

export default function HeroSection() {
  return (
    <section
      className="relative w-full flex flex-col lg:flex-row items-center justify-between overflow-hidden"
      style={{
        minHeight: '100vh',
        padding: 'clamp(6rem, 12%, 10rem) clamp(1.5rem, 5%, 4rem) clamp(3rem, 6%, 5rem)',
        gap: 'clamp(2rem, 5%, 4rem)',
      }}
    >
      {/* Left content */}
      <div className="flex-1 flex flex-col items-start z-10 brutal-reveal" style={{ maxWidth: '680px' }}>
        {/* Tag */}
        <div
          className="brutal-card-yellow inline-block brutal-reveal brutal-reveal-delay-1"
          style={{
            padding: 'clamp(0.25rem, 0.6%, 0.4rem) clamp(0.6rem, 1.5%, 1rem)',
            fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 'clamp(1rem, 2.5%, 2rem)',
          }}
        >
          AI-POWERED PLATFORM
        </div>

        <h1
          className="brutal-reveal brutal-reveal-delay-2"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            marginBottom: 'clamp(1rem, 2.5%, 2rem)',
            color: 'var(--fg)',
          }}
        >
          <Shuffle
            text="CV BUILDER"
            shuffleDirection="right"
            duration={0.8}
            animationMode="evenodd"
            shuffleTimes={2}
            ease="power3.out"
            stagger={0.08}
            threshold={0.1}
            triggerOnce={true}
            triggerOnHover={false}
            respectReducedMotion={true}
            loop={false}
            loopDelay={0}
          />
          <br />
          <span className="text-brutal-yellow">&amp;</span>{' '}
          <Shuffle
            text="ANALYZER"
            shuffleDirection="right"
            duration={0.8}
            animationMode="evenodd"
            shuffleTimes={2}
            ease="power3.out"
            stagger={0.08}
            threshold={0.1}
            triggerOnce={true}
            triggerOnHover={false}
            respectReducedMotion={true}
            loop={false}
            loopDelay={0}
          />
        </h1>

        <p
          className="brutal-reveal brutal-reveal-delay-3"
          style={{
            fontSize: 'clamp(0.9rem, 1.4vw, 1.2rem)',
            lineHeight: 1.6,
            maxWidth: '480px',
            marginBottom: 'clamp(1.5rem, 3.5%, 2.5rem)',
            color: 'var(--fg-muted)',
          }}
        >
          Build stunning resumes. Let AI do the rest. Get your ATS score, detect
          skill gaps, and plan your career path — all in one place.
        </p>

        <div className="flex flex-wrap brutal-reveal brutal-reveal-delay-4" style={{ gap: 'clamp(0.75rem, 1.5%, 1.25rem)' }}>
          <a
            href="#get-started"
            className="brutal-btn bg-brutal-yellow text-black"
            style={{
              padding: 'clamp(0.6rem, 1.2%, 0.9rem) clamp(1.25rem, 2.5%, 2rem)',
              fontSize: 'clamp(0.8rem, 1.1vw, 1rem)',
            }}
          >
            Build My CV →
          </a>
          <a
            href="#features"
            className="brutal-btn-outline"
            style={{
              padding: 'clamp(0.6rem, 1.2%, 0.9rem) clamp(1.25rem, 2.5%, 2rem)',
              fontSize: 'clamp(0.8rem, 1.1vw, 1rem)',
            }}
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Right — HTML CV Cards */}
      <div
        className="flex-1 flex items-center justify-center z-10 brutal-reveal brutal-reveal-delay-3"
        style={{ maxWidth: '620px', width: '100%' }}
      >
        <CVShowcase />
      </div>

      {/* Background decorative geometric elements */}
      <div
        className="absolute hidden lg:block"
        style={{
          top: '18%',
          left: '3%',
          width: 'clamp(40px, 5vw, 70px)',
          height: 'clamp(40px, 5vw, 70px)',
          border: '3px solid var(--border-color)',
          opacity: 0.08,
          transform: 'rotate(45deg)',
        }}
      />
      <div
        className="absolute hidden lg:block"
        style={{
          bottom: '15%',
          right: '5%',
          width: 'clamp(50px, 6vw, 90px)',
          height: 'clamp(50px, 6vw, 90px)',
          border: '3px solid var(--border-color)',
          opacity: 0.06,
          transform: 'rotate(-12deg)',
          borderRadius: '50%',
        }}
      />
    </section>
  );
}
