import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import { TEMPLATES } from '../../Features/CVManagement/index.js';
import { MOCK_CV_DATA, MOCK_USER_NAME } from '../../Features/CVManagement/mockCvData.js';
import api from '../../services/api';

// ─── Tag accent colours ───────────────────────────────────────────────────────
const TAG_COLORS = {
  Popular: { bg: 'var(--yellow)', text: '#0a0a0a' },
  Clean: { bg: 'var(--mint)', text: '#0a0a0a' },
  Premium: { bg: 'var(--blue)', text: '#ffffff' },
  Corporate: { bg: 'var(--teal)', text: '#0a0a0a' },
  Creative: { bg: 'var(--coral)', text: '#0a0a0a' },
  Formal: { bg: '#c4b89a', text: '#0a0a0a' },
  Elegant: { bg: '#a0a0b0', text: '#0a0a0a' },
};

// ─── Scaled live preview of the actual template component ─────────────────────
function TemplatePreview({ template }) {
  const TemplateComponent = template.component;
  const SCALE = 0.27;

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '0.707', // A4 ratio
        overflow: 'hidden',
        position: 'relative',
        background: '#fff',
        borderRadius: '2px',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '5%',
      }}
    >
      {/* Scaled wrapper — renders the real JSX at 27% scale, centered */}
      <div
        style={{
          transform: `scale(${SCALE})`,
          transformOrigin: 'top center',
          width: `${100 / SCALE}%`,
          pointerEvents: 'none',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        <TemplateComponent
          userName={MOCK_USER_NAME}
          cvData={MOCK_CV_DATA}
        />
      </div>
    </div>
  );
}

// ─── Individual template card ─────────────────────────────────────────────────
function TemplateCard({ template, isSelected, onSelect }) {
  const tagStyle = TAG_COLORS[template.tag] || { bg: 'var(--card-bg)', text: 'var(--fg)' };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(template)}
      onClick={() => onSelect(template)}
      className="brutal-card cursor-pointer flex flex-col"
      style={{
        borderColor: isSelected ? template.accent : 'var(--border-color)',
        boxShadow: isSelected
          ? `6px 6px 0 ${template.accent}`
          : 'var(--brutal-shadow)',
        transform: isSelected ? 'translate(-2px, -2px)' : undefined,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        outline: 'none',
      }}
    >
      {/* Preview area */}
      <div
        style={{
          position: 'relative',
          borderBottom: '3px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <TemplatePreview template={template} />

        {/* Selected overlay */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `${template.accent}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2
              size={48}
              style={{ color: template.accent, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
        )}

      </div>

      {/* Card footer */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.03em',
              color: 'var(--fg)',
              margin: 0,
            }}
          >
            {template.name}
          </h3>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.65rem',
              color: 'var(--fg-muted)',
            }}
          >
            #{template.id}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Name / Create Modal — wide two-panel: A4 preview left, form right ─────────
function CreateModal({ template, onClose, onCreate, loading }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const ModalPreviewComponent = template.component;

  const ZOOM = 0.72;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title for your CV.');
      return;
    }
    onCreate(title.trim());
  };

  // Close on Escape
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,10,10,0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="brutal-card"
        style={{
          width: '80vw',
          height: '96vh',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          background: 'var(--bg)',
        }}
      >
        {/* ── LEFT: A4 scrollable preview ────────────────────────────────── */}
        <div
          style={{
            flex: '1 1 0',
            minWidth: 0,
            background: '#b8b4ac',
            borderRight: '3px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Top label bar */}
          <div
            style={{
              padding: '9px 16px',
              borderBottom: '2px solid var(--border-color)',
              background: 'var(--nav-bg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            {/* Traffic-light dots for "document viewer" feel */}
            <div style={{ display: 'flex', gap: 5 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1.5px solid rgba(0,0,0,0.18)' }} />
              ))}
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginLeft: 6 }}>
              Live Preview — {template.name}
            </span>
            <span style={{ marginLeft: 'auto', fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: 'var(--fg-muted)', letterSpacing: '0.06em' }}>
              A4 · {Math.round(ZOOM * 100)}%
            </span>
          </div>

          {/*
            Preview area — zoom collapses layout to the scaled size so:
            - no fixed A4_H needed (no clipping of tall templates)
            - no white/beige gap (element truly shrinks)
            - no scrollbar (everything fits)
            overflow:hidden on parent clips any tiny remainder.
          */}
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 24px',
            }}
          >
            <div
              style={{
                zoom: ZOOM,
                flexShrink: 0,
                background: '#fff',
                boxShadow: '0 6px 32px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.10)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <ModalPreviewComponent
                userName={MOCK_USER_NAME}
                cvData={MOCK_CV_DATA}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form panel ──────────────────────────────────────────── */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.6rem',
            gap: '1rem',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '0.3rem' }}>
                Using template
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.2rem', margin: 0, color: 'var(--fg)', lineHeight: 1.2 }}>
                {template.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="brutal-btn-outline"
              style={{ padding: '0.35rem', minHeight: 'unset', flexShrink: 0 }}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Tag badge */}
          <span
            style={{
              display: 'inline-block',
              width: 'fit-content',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 10px',
              border: '2px solid #0a0a0a',
              background: template.accent,
              color: '#fff',
            }}
          >
            {template.tag || `Template ${template.id}`}
          </span>

          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--fg-muted)', lineHeight: 1.6, margin: 0 }}>
            {template.description}
          </p>

          <div style={{ borderTop: '2px solid var(--border-color)' }} />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label className="form-label" htmlFor="cv-title-input" style={{ fontSize: '0.7rem' }}>
                CV / Job Title
              </label>
              <input
                id="cv-title-input"
                type="text"
                className="form-field"
                placeholder="e.g. Frontend Developer…"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (error) setError(''); }}
                autoFocus
                disabled={loading}
                style={{ minHeight: 46 }}
              />
              {error && (
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.66rem', color: 'var(--coral)', marginTop: '0.3rem' }}>
                  {error}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                id="create-cv-submit-btn"
                type="submit"
                className="brutal-btn w-full flex items-center justify-center gap-2"
                style={{ background: 'var(--yellow)', color: '#0a0a0a' }}
                disabled={loading}
              >
                {loading ? 'Creating…' : <><ArrowRight size={14} /> Create CV</>}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="brutal-btn-outline w-full"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CVTemplates() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSelectTemplate = (template) => {
    setSelected(template);
    setModalOpen(true);
  };

  const handleCreate = async (jobTitle) => {
    if (!selected) return;
    setLoading(true);
    setApiError('');
    try {
      await api.post('/cvs', { jobTitle, templateId: selected.id });
      navigate('/employee/cvs');
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Unable to create CV. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-shell">
        <DashboardNav role="employee" />

        {/* ── Page header ── */}
        <div
          className="mb-10 brutal-reveal"
          style={{ animationDelay: '0s' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              {/* Eyebrow label */}
              <h1
                className="flex items-center gap-3"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                <Sparkles size={28} style={{ color: 'var(--yellow)' }} />
                CV Templates
              </h1>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.78rem',
                  color: 'var(--fg-muted)',
                  marginTop: '0.5rem',
                }}
              >
                {TEMPLATES.length} professionally designed templates — click one to get started.
              </p>
            </div>

            {/* Stats pill */}
            <div
              className="stat-pill"
              style={{ gap: '0.5rem', flexShrink: 0, alignSelf: 'flex-start' }}
            >
              <Layers size={14} />
              <span>{TEMPLATES.length} Templates</span>
            </div>
          </div>

          {/* Accent divider */}
          <div
            style={{
              height: 4,
              background: `repeating-linear-gradient(90deg, var(--yellow) 0, var(--yellow) 24px, transparent 24px, transparent 32px)`,
              marginTop: '1.5rem',
              border: '2px solid var(--border-color)',
            }}
          />
        </div>

        {/* ── API Error ── */}
        {apiError && (
          <div
            className="brutal-card mb-6 p-4"
            style={{ background: 'var(--coral)', color: '#0a0a0a', fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}
          >
            {apiError}
          </div>
        )}

        {/* ── Templates grid ── */}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {TEMPLATES.map((template, i) => (
            <div
              key={template.id}
              className="brutal-reveal"
              style={{ animationDelay: `${0.05 + i * 0.07}s`, opacity: 0 }}
            >
              <TemplateCard
                template={template}
                isSelected={selected?.id === template.id}
                onSelect={handleSelectTemplate}
              />
            </div>
          ))}
        </div>

        {/* ── Bottom CTA hint ── */}
        <div
          className="mt-10 text-center"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.72rem',
            color: 'var(--fg-muted)',
            letterSpacing: '0.08em',
          }}
        >
          Click any template to preview and create your CV →
        </div>
      </div>

      {/* ── Create modal ── */}
      {modalOpen && selected && (
        <CreateModal
          template={selected}
          onClose={() => {
            setModalOpen(false);
            setApiError('');
          }}
          onCreate={handleCreate}
          loading={loading}
        />
      )}
    </div>
  );
}
