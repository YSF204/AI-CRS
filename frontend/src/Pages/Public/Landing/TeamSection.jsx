import React from 'react';
import { Code2, Brain, Server, Layout } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import BorderGlow from './components/BorderGlow';

const team = [
  {
    name: 'Yousef AL Bakri',
    role: 'Full Stack Developer',
    initials: 'YA',
    image: '/src/assets/Yousef.png',
    bio: 'Passionate full stack developer with experience in modern web technologies. Designed the platform architecture and AI integration pipeline.',
    skills: ['React', 'Node.js', 'MongoDB', 'OpenAI API'],
    Icon: Code2,
    accent: '#1a6b5a',
    glowColors: ['#34d399', '#059669', '#10b981'],
  },
  {
    name: 'Bashar AL-Ajalin',
    role: 'Frontend Engineer',
    initials: 'BA',
    bio: 'Detail-oriented frontend engineer specializing in building responsive, accessible, and performant user interfaces with a strong eye for design.',
    skills: ['React', 'TailwindCSS', 'Figma', 'UI/UX'],
    Icon: Layout,
    accent: '#d97706',
    glowColors: ['#f59e0b', '#d97706', '#fbbf24'],
  },
  {
    name: 'Ismail Jboor',
    role: 'Backend Developer',
    initials: 'IJ',
    bio: 'Results-driven backend developer with expertise in designing scalable server-side architectures and optimizing database performance.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    Icon: Server,
    accent: '#0891b2',
    glowColors: ['#22d3ee', '#0891b2', '#67e8f9'],
  },
  {
    name: 'Azeez Abu Queider',
    role: 'AI / ML Engineer',
    initials: 'AA',
    bio: 'AI/ML engineer passionate about applying machine learning and NLP to solve real-world problems. Built the CV analysis engine.',
    skills: ['Python', 'TensorFlow', 'OpenAI', 'NLP'],
    Icon: Brain,
    accent: '#7c3aed',
    glowColors: ['#a78bfa', '#7c3aed', '#c4b5fd'],
  },
];

export default function TeamSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="about"
      className="w-full"
      style={{
        background: 'var(--bg-alt)',
        borderTop: '1px solid var(--border-color)',
        paddingBottom: 'clamp(4rem, 10vh, 8rem)',
      }}
    >
      {/* Title */}
      <div
        className="text-center"
        style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1.5rem, 5%, 4rem) 0' }}
      >
        <span className="paper-section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
          The Crew
        </span>
        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--fg)',
            marginBottom: '0.75rem',
          }}
        >
          Meet the <span style={{ color: 'var(--accent)' }}>Team</span>
        </h2>
        <p
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
            color: 'var(--fg-muted)',
            maxWidth: '440px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          Four developers from Palestine building the future of CV creation with AI.
        </p>
      </div>

      {/* Pure CSS Sticky Stack - Zero JS Shaking! */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 clamp(1rem, 5vw, 2rem)' }}>
        <div style={{ paddingTop: '1rem', paddingBottom: '50vh' }}>
          {team.map((member, i) => {
            return (
              <div
                key={i}
                style={{
                  position: 'sticky',
                  // Each card sticks slightly lower than the one before it
                  top: `calc(15vh + ${i * 1.25}rem)`,
                  // Space added between cards so you scroll naturally before the next card hits the stack.
                  marginBottom: '20vh',
                  zIndex: i + 1,
                  boxShadow: i > 0 ? `0 -10px 40px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)'}` : 'none',
                  borderRadius: '24px',
                  // Prevent the tall container from causing awkward spacing inside the inner div
                  height: 'max-content',
                }}
              >
                <BorderGlow
                  edgeSensitivity={50}
                  glowColor={`${member.accent === '#1a6b5a' ? '160 60 45' : member.accent === '#d97706' ? '35 85 60' : member.accent === '#0891b2' ? '190 70 55' : '270 55 60'}`}
                  backgroundColor={isDark ? '#262220' : '#ffffff'}
                  borderRadius={24}
                  glowRadius={15}
                  glowIntensity={isDark ? 0.8 : 0.4}
                  coneSpread={40}
                  colors={member.glowColors}
                  fillOpacity={isDark ? 0.25 : 0.05}
                  className="group"
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      padding: 'clamp(2rem, 5%, 3rem)',
                      minHeight: '280px',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    {/* Header row: Avatar + Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: member.image ? 'transparent' : `linear-gradient(135deg, ${member.accent}15, ${member.accent}05)`,
                        border: `1.5px solid ${member.accent}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'Libre Bodoni', serif",
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: member.accent,
                        flexShrink: 0,
                        boxShadow: `0 8px 24px ${member.accent}10`,
                        overflow: 'hidden',
                      }}
                    >
                      {member.image ? (
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        member.initials
                      )}
                    </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontFamily: "'Libre Bodoni', serif",
                            fontSize: 'clamp(1.25rem, 2vw, 1.6rem)',
                            fontWeight: 700,
                            color: 'var(--fg)',
                            margin: 0,
                            lineHeight: 1.2,
                          }}
                        >
                          {member.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                          <member.Icon size={14} style={{ color: member.accent }} strokeWidth={2.5} />
                          <span
                            style={{
                              fontFamily: "'Public Sans', sans-serif",
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: member.accent,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p
                      style={{
                        fontFamily: "'Public Sans', sans-serif",
                        fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)',
                        lineHeight: 1.7,
                        color: 'var(--fg-muted)',
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {member.bio}
                    </p>

                    {/* Skill pills row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {member.skills.map((skill, si) => (
                        <span
                          key={si}
                          style={{
                            fontFamily: "'Public Sans', sans-serif",
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            background: `${member.accent}12`,
                            color: member.accent,
                            border: `1px solid ${member.accent}20`,
                            letterSpacing: '0.03em',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </BorderGlow>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
