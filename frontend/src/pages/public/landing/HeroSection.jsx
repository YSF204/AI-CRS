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
        backgroundColor: 'var(--nm-bg)',
      }}
    >
      {/* Left content */}
      <div className="flex-1 flex flex-col items-start z-10" style={{ maxWidth: '640px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            marginBottom: 'clamp(1.25rem, 2.5%, 2rem)',
            color: 'var(--nm-text-primary)',
            textTransform: 'uppercase',
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
          <span style={{ color: 'var(--nm-primary)' }}>&amp;</span>{' '}
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
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
            lineHeight: 1.7,
            maxWidth: '480px',
            marginBottom: 'clamp(2rem, 4%, 3rem)',
            color: 'var(--nm-text-secondary)',
            fontWeight: 400,
          }}
        >
          Build stunning resumes. Let AI do the rest. Get your ATS score, detect
          skill gaps, and plan your career path — all in one place.
        </p>

        <div className="flex flex-wrap" style={{ gap: 'clamp(1rem, 2%, 1.25rem)' }}>
          <Link
            to="/auth?mode=signup"
            className="nm-btn nm-btn-primary"
            style={{
              padding: '1rem 2.5rem',
              fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
              borderWidth: '4px',
              boxShadow: '4px 4px 0 var(--nm-ink)'
            }}
          >
            Build My CV
            <ArrowRight size={18} strokeWidth={3} />
          </Link>

        </div>
      </div>

      {/* Right — HTML CV Cards (preserved) */}
      <div
        className="flex-1 flex items-center justify-center z-10"
        style={{ maxWidth: '620px', width: '100%' }}
      >
        <CVShowcase />
      </div>

      {/* Background decorative — industrial grid feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(var(--nm-ink) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
    </section>
  );
}
