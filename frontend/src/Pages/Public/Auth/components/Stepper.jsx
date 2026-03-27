import { useState, Children, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Step wrapper (just renders children) ─── */
export function Step({ children }) {
  return <>{children}</>;
}

/* ─── Stepper ─── */
export default function Stepper({
  children,
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  onNextAttempt, // Callback when Next is clicked (even if disabled)
  backButtonText = 'Previous',
  nextButtonText = 'Next',
  canProceed,
}) {
  const steps = Children.toArray(children);
  const total = steps.length;
  const [current, setCurrent] = useState(initialStep - 1);
  const [direction, setDirection] = useState(1);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('auto');

  useLayoutEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current.firstChild;
      if (el) setContentHeight(el.offsetHeight);
    }
  }, [current]);

  const isNextDisabled = canProceed ? !canProceed(current) : false;

  const handleNextBtnClick = () => {
    onNextAttempt?.(current);
    if (isNextDisabled) return;
    
    if (current < total - 1) {
      setDirection(1);
      const next = current + 1;
      setCurrent(next);
      onStepChange?.(next + 1);
    } else {
      onFinalStepCompleted?.();
    }
  };

  const goBack = () => {
    if (current > 0) {
      setDirection(-1);
      const prev = current - 1;
      setCurrent(prev);
      onStepChange?.(prev + 1);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Progress bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.5rem, 1.5%, 1rem)',
          marginBottom: 'clamp(1.5rem, 3%, 2rem)',
        }}
      >
        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '3px solid #0a0a0a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                  background: i <= current ? '#FFE630' : 'var(--bg)',
                  color: i <= current ? '#0a0a0a' : 'var(--fg-muted)',
                  boxShadow: i === current ? '3px 3px 0 #0a0a0a' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {i < current ? '✓' : i + 1}
              </div>
              {i < total - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: '#e0e0e0',
                    marginLeft: 4,
                    marginRight: 4,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      background: '#FFE630',
                    }}
                    animate={{ width: i < current ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress label */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'var(--fg-muted)',
            flexShrink: 0,
          }}
        >
          {current + 1}/{total}
        </div>
      </div>

      {/* Step content with animation */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: contentHeight !== 'auto' ? contentHeight : undefined,
          transition: 'min-height 0.3s ease',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -60 : 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {steps[current]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'clamp(1.25rem, 2.5%, 2rem)',
          gap: 12,
        }}
      >
        <button
          onClick={goBack}
          disabled={current === 0}
          className="brutal-btn-outline"
          style={{
            padding: '0.5rem 1.25rem',
            fontSize: 13,
            opacity: current === 0 ? 0.3 : 1,
            cursor: current === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {backButtonText}
        </button>
        <button
          onClick={handleNextBtnClick}
          className="brutal-btn"
          style={{
            padding: '0.5rem 1.25rem',
            fontSize: 13,
            background: '#FFE630',
            color: '#0a0a0a',
            opacity: isNextDisabled ? 0.4 : 1,
            cursor: isNextDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {current === total - 1 ? 'Complete' : nextButtonText}
        </button>
      </div>
    </div>
  );
}
