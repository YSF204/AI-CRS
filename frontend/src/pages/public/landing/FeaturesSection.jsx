import { FileText, Brain, Zap, Shield } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from '../../../context/LanguageContext';

export default function FeaturesSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const features = [
    {
      Icon: FileText,
      title: t('features.cvBuilder.title'),
      description: t('features.cvBuilder.description'),
      color: 'var(--nm-primary)',
    },
    {
      Icon: Brain,
      title: t('features.atsScore.title'),
      description: t('features.atsScore.description'),
      color: 'var(--nm-warning)',
    },
    {
      Icon: Zap,
      title: t('features.skillGap.title'),
      description: t('features.skillGap.description'),
      color: 'var(--nm-success)',
    },
    {
      Icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.description'),
      color: 'var(--nm-ink)',
    },
  ];

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
          {t('features.titleMain')}
          <br />
          <span style={{ color: 'var(--nm-primary)' }}>{t('features.titleHighlight')}</span>
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
          {t('features.description')}
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
