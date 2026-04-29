import React, { useEffect, useRef, Children, forwardRef } from 'react';
import gsap from 'gsap';

/* ─── Card wrapper ─── */
export const Card = forwardRef(({ children, style, className = '' }, ref) => (
  <div
    ref={ref}
    className={`card-swap-card ${className}`}
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '0px',
      border: '4px solid var(--nm-ink)',
      boxShadow: '8px 8px 0 var(--nm-ink)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
));

Card.displayName = 'Card';

/* ─── CardSwap animation container ─── */
export default function CardSwap({
  children,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = true,
}) {
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.card-swap-card'));
    const total = cards.length;
    if (total === 0) return;

    // Stack cards initially — first card on top
    cards.forEach((card, i) => {
      gsap.set(card, {
        x: i * cardDistance,
        y: i * verticalDistance,
        zIndex: total - i,
        scale: 1 - i * 0.03,
        opacity: 1 - i * 0.04,
      });
    });

    const cycleCard = () => {
      if (isPaused.current) return;

      const front = cards.shift();
      cards.push(front);

      // Animate front card out
      gsap.to(front, {
        x: -cardDistance * 2,
        y: -verticalDistance,
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          // Move behind stack
          gsap.set(front, {
            x: (cards.length) * cardDistance,
            y: (cards.length) * verticalDistance,
            scale: 1 - cards.length * 0.03,
            opacity: 0,
            zIndex: 0,
          });
          gsap.to(front, {
            opacity: 1 - (cards.length - 1) * 0.04,
            duration: 0.3,
          });
        },
      });

      // Re-stack remaining cards
      cards.forEach((card, i) => {
        gsap.to(card, {
          x: i * cardDistance,
          y: i * verticalDistance,
          zIndex: total - i,
          scale: 1 - i * 0.03,
          opacity: 1 - i * 0.04,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.1,
        });
      });
    };

    intervalRef.current = setInterval(cycleCard, delay);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cardDistance, verticalDistance, delay]);

  const handleMouseEnter = () => {
    if (pauseOnHover) isPaused.current = true;
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) isPaused.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
}
