import { useState, Children, useRef, useLayoutEffect, useEffect } from 'react';
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
  onNextAttempt,
  backButtonText = 'Previous',
  nextButtonText = 'Next',
  canProceed,
  advanceRef,      // optional ref — caller can call advanceRef.current() to go next
}) {
  const steps = Children.toArray(children);
  const total = steps.length;
  const [current, setCurrent] = useState(initialStep - 1);
  const [direction, setDirection] = useState(1);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('auto');

  // Expose advance() to parent via advanceRef
  useEffect(() => {
    if (!advanceRef) return;
    advanceRef.current = () => {
      setCurrent((prev) => {
        if (prev < total - 1) {
          setDirection(1);
          return prev + 1;
        }
        return prev;
      });
    };
  }, [advanceRef, total]);

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
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: '4px solid var(--nm-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                  background: i <= current ? 'var(--nm-primary)' : 'var(--nm-bg)',
                  color: i <= current ? '#fff' : 'var(--nm-text-tertiary)',
                  boxShadow: i === current ? '4px 4px 0 var(--nm-ink)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  borderRadius: '0px',
                }}
              >
                {i < current ? '✓' : i + 1}
              </div>
              {i < total - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: 'var(--nm-ink)',
                    opacity: 0.1,
                    marginLeft: 6,
                    marginRight: 6,
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
                      background: 'var(--nm-primary)',
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
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            fontWeight: 800,
            color: 'var(--nm-text-tertiary)',
            flexShrink: 0,
            letterSpacing: '0.1em',
          }}
        >
          {current + 1} / {total}
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
            initial={{ x: direction > 0 ? 30 : -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -30 : 30, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
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
          marginTop: '2.5rem',
          gap: 16,
        }}
      >
        <button
          onClick={goBack}
          disabled={current === 0}
          className="nm-btn"
          style={{
            flex: 1,
            padding: '14px',
            fontSize: 13,
            background: 'var(--nm-surface)',
            color: 'var(--nm-text-primary)',
            opacity: current === 0 ? 0 : 1,
            pointerEvents: current === 0 ? 'none' : 'auto',
          }}
        >
          {backButtonText}
        </button>
        <button
          onClick={handleNextBtnClick}
          className="nm-btn"
          style={{
            flex: 2,
            padding: '14px',
            fontSize: 14,
            background: 'var(--nm-primary)',
            color: '#fff',
            opacity: isNextDisabled ? 0.4 : 1,
            cursor: isNextDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {current === total - 1 ? 'Complete Registration' : nextButtonText}
        </button>
      </div>
    </div>
  );
}
