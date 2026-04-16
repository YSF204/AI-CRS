import CVShowcase from './CVShowcase';
import Shuffle from './components/Shuffle';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative w-full flex flex-col lg:flex-row items-center justify-between overflow-hidden"
      style={{
        minHeight: '100vh',
        padding: 'clamp(7rem, 14%, 11rem) clamp(1.5rem, 5%, 4rem) clamp(4rem, 8%, 6rem)',
        gap: 'clamp(3rem, 6%, 5rem)',
      }}
    >
      {/* Left content */}
      <div className="flex-1 flex flex-col items-start z-10 paper-reveal" style={{ maxWidth: '640px' }}>
        {/* Badge */}
        <div
          className="paper-badge paper-reveal paper-reveal-delay-1"
          style={{ marginBottom: 'clamp(1.25rem, 2.5%, 2rem)' }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              display: 'inline-block',
              marginRight: '0.5rem',
            }}
          />
          AI-Powered Platform
        </div>

        <h1
          className="paper-reveal paper-reveal-delay-2"
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            marginBottom: 'clamp(1.25rem, 2.5%, 2rem)',
            color: 'var(--fg)',
          }}
        >
          <Shuffle
            text="CV Builder"
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
          <span style={{ color: 'var(--accent)' }}>&amp;</span>{' '}
          <Shuffle
            text="Analyzer"
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
          className="paper-reveal paper-reveal-delay-3"
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
            lineHeight: 1.7,
            maxWidth: '480px',
            marginBottom: 'clamp(2rem, 4%, 3rem)',
            color: 'var(--fg-muted)',
            fontWeight: 400,
          }}
        >
          Build stunning resumes. Let AI do the rest. Get your ATS score, detect
          skill gaps, and plan your career path — all in one place.
        </p>

        <div className="flex flex-wrap paper-reveal paper-reveal-delay-4" style={{ gap: 'clamp(0.75rem, 1.5%, 1rem)' }}>
          <Link
            to="/auth?mode=signup"
            className="paper-btn"
            style={{
              padding: 'clamp(0.7rem, 1.2%, 0.85rem) clamp(1.5rem, 3%, 2.25rem)',
              fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
            }}
          >
            Build My CV
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <a
            href="#features"
            className="paper-btn-outline"
            style={{
              padding: 'clamp(0.7rem, 1.2%, 0.85rem) clamp(1.5rem, 3%, 2.25rem)',
              fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
            }}
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Right — HTML CV Cards (preserved) */}
      <div
        className="flex-1 flex items-center justify-center z-10 paper-reveal paper-reveal-delay-3"
        style={{ maxWidth: '620px', width: '100%' }}
      >
        <CVShowcase />
      </div>

      {/* Background decorative — subtle editorial elements */}
      <div
        className="absolute hidden lg:block"
        style={{
          top: '15%',
          left: '5%',
          width: 'clamp(80px, 10vw, 140px)',
          height: '1px',
          background: 'var(--border-color)',
          opacity: 0.5,
          transform: 'rotate(-30deg)',
        }}
      />
      <div
        className="absolute hidden lg:block"
        style={{
          bottom: '20%',
          right: '4%',
          width: '1px',
          height: 'clamp(60px, 8vw, 120px)',
          background: 'var(--border-color)',
          opacity: 0.4,
        }}
      />
      {/* Subtle corner accent */}
      <div
        className="absolute hidden lg:block"
        style={{
          top: '10%',
          right: '8%',
          width: 'clamp(3px, 0.4vw, 5px)',
          height: 'clamp(3px, 0.4vw, 5px)',
          borderRadius: '50%',
          background: 'var(--accent)',
          opacity: 0.3,
        }}
      />
    </section>
  );
}
