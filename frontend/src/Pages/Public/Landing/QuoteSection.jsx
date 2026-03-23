
export default function QuoteSection() {
  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        minHeight: '100vh',
        borderTop: '3px solid var(--border-color)',
        borderBottom: '3px solid var(--border-color)',
      }}
    >
      {/* Background pattern — diagonal stripes */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, var(--fg) 0px, var(--fg) 1px, transparent 1px, transparent 30px)',
          opacity: 0.04,
        }}
      />

      {/* Accent block top-left */}
      <div
        className="absolute bg-brutal-yellow"
        style={{
          top: 'clamp(2rem, 5%, 4rem)',
          left: 'clamp(1.5rem, 4%, 3rem)',
          width: 'clamp(40px, 6vw, 80px)',
          height: 'clamp(40px, 6vw, 80px)',
          border: '3px solid #0a0a0a',
          transform: 'rotate(12deg)',
        }}
      />

      {/* Accent block bottom-right */}
      <div
        className="absolute bg-brutal-teal"
        style={{
          bottom: 'clamp(2rem, 5%, 4rem)',
          right: 'clamp(1.5rem, 4%, 3rem)',
          width: 'clamp(30px, 4vw, 60px)',
          height: 'clamp(60px, 8vw, 100px)',
          border: '3px solid #0a0a0a',
          transform: 'rotate(-8deg)',
        }}
      />

      {/* Quote content */}
      <div
        className="relative z-10 text-center"
        style={{ padding: '0 clamp(2rem, 8%, 6rem)', maxWidth: '900px' }}
      >
        <div
          className="text-brutal-yellow font-bold"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(4rem, 10vw, 10rem)',
            lineHeight: 0.8,
            marginBottom: 'clamp(1rem, 2%, 1.5rem)',
          }}
        >
          &ldquo;
        </div>

        <blockquote
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: 'clamp(1.5rem, 3%, 2.5rem)',
            color: 'var(--fg)',
          }}
        >
          YOUR CAREER STORY
          <br />
          DESERVES TO BE
          <br />
          <span className="text-brutal-yellow">TOLD RIGHT.</span>
        </blockquote>

        <div
          className="inline-block bg-brutal-yellow text-black font-bold uppercase"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(0.6rem, 0.9vw, 0.8rem)',
            letterSpacing: '0.12em',
            padding: '0.3em 0.8em',
            border: '2px solid #0a0a0a',
            boxShadow: '3px 3px 0 #0a0a0a',
          }}
        >
          — AI-CV STUDIO TEAM
        </div>
      </div>
    </section>
  );
}
