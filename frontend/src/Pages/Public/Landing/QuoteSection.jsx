
export default function QuoteSection() {
  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        minHeight: '80vh',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-alt)',
      }}
    >
      {/* Background — subtle ruled lines (paper/notebook feel) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 39px, var(--border-light) 39px, var(--border-light) 40px)',
          opacity: 0.5,
        }}
      />

      {/* Margin line — red editorial line */}
      <div
        className="absolute hidden md:block"
        style={{
          top: 0,
          bottom: 0,
          left: 'clamp(3rem, 8%, 6rem)',
          width: '1px',
          background: 'var(--accent)',
          opacity: 0.12,
        }}
      />

      {/* Quote content */}
      <div
        className="relative z-10 text-center"
        style={{ padding: '0 clamp(2rem, 10%, 8rem)', maxWidth: '800px' }}
      >
        {/* Large editorial quote mark */}
        <div
          style={{
            fontFamily: "'Libre Bodoni', serif",
            fontSize: 'clamp(5rem, 12vw, 10rem)',
            lineHeight: 0.7,
            marginBottom: 'clamp(0.5rem, 1%, 1rem)',
            color: 'var(--accent)',
            opacity: 0.25,
            userSelect: 'none',
          }}
        >
          &ldquo;
        </div>

        <blockquote
          style={{
            fontFamily: "'Libre Bodoni', serif",
            fontWeight: 700,
            fontSize: 'clamp(1.6rem, 4vw, 3.25rem)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: 'clamp(1.5rem, 3%, 2.5rem)',
            color: 'var(--fg)',
          }}
        >
          Your career story
          <br />
          deserves to be
          <br />
          <span style={{ color: 'var(--accent)' }}>told right.</span>
        </blockquote>

        {/* Attribution */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '2rem',
              height: '1px',
              background: 'var(--border-color)',
            }}
          />
          <span
            style={{
              fontFamily: "'Public Sans', sans-serif",
              fontSize: 'clamp(0.65rem, 0.9vw, 0.78rem)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--fg-muted)',
            }}
          >
            AI-CRS Team
          </span>
          <div
            style={{
              width: '2rem',
              height: '1px',
              background: 'var(--border-color)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
