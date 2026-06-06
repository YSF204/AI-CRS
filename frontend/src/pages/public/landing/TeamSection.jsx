import React from 'react';
import { Code2, Brain, Server, Layout } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import YousefImage from '../../../assets/Yousef.png';
import { useTranslation } from '../../../context/LanguageContext';

export default function TeamSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const team = [
    {
      name: 'Yousef AL Bakri',
      role: t('team.members.yousef.role'),
      initials: 'YA',
      image: YousefImage,
      bio: t('team.members.yousef.bio'),
      skills: ['React', 'Node.js', 'MongoDB', 'Next.js', "AI Integration", "postgreSQL"],
      Icon: Code2,
      accent: 'var(--nm-primary)',
    },
    {
      name: 'Bashar AL-Ajalin',
      role: t('team.members.bashar.role'),
      initials: 'BA',
      bio: t('team.members.bashar.bio'),
      skills: ['React', 'TailwindCSS', 'Figma', 'UI/UX'],
      Icon: Layout,
      accent: 'var(--nm-warning)',
    },
    {
      name: 'Ismail Jboor',
      role: t('team.members.ismail.role'),
      initials: 'IJ',
      bio: t('team.members.ismail.bio'),
      skills: ['Node.js', 'Express', 'PostgreSQL'],
      Icon: Server,
      accent: 'var(--nm-success)',
    },
    {
      name: 'Azeez Abu Queider',
      role: t('team.members.azeez.role'),
      initials: 'AA',
      bio: t('team.members.azeez.bio'),
      skills: ['React', 'TailwindCSS', 'Figma', 'UI/UX'],
      Icon: Brain,
      accent: 'var(--nm-primary)',
    },
  ];

  return (
    <section
      id="about"
      className="w-full"
      style={{
        background: 'var(--nm-bg)',
        borderTop: '4px solid var(--nm-ink)',
        paddingBottom: 'clamp(6rem, 12vh, 10rem)',
      }}
    >
      {/* Title */}
      <div
        className="text-center"
        style={{ padding: 'clamp(5rem, 10%, 8rem) clamp(1.5rem, 5%, 4rem) 0' }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'var(--nm-text-primary)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          {t('team.title')} <span style={{ color: 'var(--nm-primary)' }}>{t('team.titleHighlight')}</span>
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
            color: 'var(--nm-text-secondary)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          {t('team.description')}
        </p>
      </div>

      {/* Pure CSS Sticky Stack */}
      <div style={{ maxWidth: '900px', margin: '4rem auto 0', padding: '0 clamp(1rem, 5vw, 2.5rem)' }}>
        <div style={{ paddingBottom: '50vh' }}>
          {team.map((member, i) => {
            return (
              <div
                key={i}
                className="nm-card"
                style={{
                  position: 'sticky',
                  top: `calc(15vh + ${i * 0.75}rem)`,
                  zIndex: i + 1,
                  background: 'var(--nm-surface)',
                  padding: 'clamp(2rem, 5%, 3.5rem)',
                  borderWidth: '4px',
                  boxShadow: '10px 10px 0 var(--nm-ink)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem',
                  marginBottom: '25vh',
                }}
              >
                {/* Header row: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      border: '4px solid var(--nm-ink)',
                      background: member.image ? 'transparent' : member.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: '#fff',
                      flexShrink: 0,
                      boxShadow: '4px 4px 0 var(--nm-ink)',
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

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                        fontWeight: 800,
                        color: 'var(--nm-text-primary)',
                        margin: 0,
                        lineHeight: 1.1,
                        textTransform: 'uppercase'
                      }}
                    >
                      {member.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                      <div
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: member.accent,
                          color: '#fff',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          border: '2px solid var(--nm-ink)'
                        }}
                      >
                        {member.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                    lineHeight: 1.7,
                    color: 'var(--nm-text-secondary)',
                    margin: 0,
                  }}
                >
                  {member.bio}
                </p>

                {/* Skill pills row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {member.skills.map((skill, si) => (
                    <span
                      key={si}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.4rem 1rem',
                        background: 'var(--nm-surface-high)',
                        color: 'var(--nm-text-primary)',
                        border: '2px solid var(--nm-ink)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
