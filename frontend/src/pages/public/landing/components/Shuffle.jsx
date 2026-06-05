import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()1234567890';

export default function Shuffle({
  text = '',
  shuffleDirection = 'right',
  duration = 0.35,
  animationMode = 'evenodd', // dummy matching prop
  shuffleTimes = 1,
  ease = 'power3.out',
  stagger = 0.03,
  threshold = 0.1,
  triggerOnce = true,
  triggerOnHover = false,
  respectReducedMotion = true,
  loop = false,
  loopDelay = 0,
}) {
  const containerRef = useRef(null);
  const charsRef = useRef([]);
  const triggeredRef = useRef(false);

  const initScramble = useCallback(() => {
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const elements = charsRef.current.filter((el) => el && el.dataset.char !== ' ');

    let sortedEls = [...elements];
    if (shuffleDirection === 'left') {
      sortedEls.reverse();
    } else if (shuffleDirection === 'random') {
      sortedEls.sort(() => Math.random() - 0.5);
    }

    sortedEls.forEach((el, index) => {
      const original = el.dataset.char;

      let dummyInfo = { frame: 0 };
      gsap.killTweensOf(dummyInfo);

      gsap.to(dummyInfo, {
        frame: 10 + Math.random() * 10 * shuffleTimes,
        duration: duration,
        ease: ease,
        delay: index * stagger,
        onUpdate: () => {
          const progress = dummyInfo.frame;
          if (progress % 1 < 0.2) {
            el.innerText = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        },
        onComplete: () => {
          el.innerText = original;
        }
      });
    });
  }, [respectReducedMotion, shuffleDirection, shuffleTimes, duration, ease, stagger]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (triggerOnce && triggeredRef.current) return;
            triggeredRef.current = true;
            initScramble();
          }
        });
      },
      { threshold }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [threshold, triggerOnce, initScramble]);

  useEffect(() => {
    if (loop) {
      const interval = setInterval(() => {
        initScramble();
      }, (duration * 1000) + (text.length * stagger * 1000) + loopDelay);
      return () => clearInterval(interval);
    }
  }, [loop, loopDelay, duration, stagger, text.length, initScramble]);

  return (
    <span
      ref={containerRef}
      onMouseEnter={triggerOnHover ? initScramble : undefined}
      style={{ display: 'inline-block' }}
    >
      {text.split('').map((char, i) => (
        <span
          key={i}
          ref={el => charsRef.current[i] = el}
          data-char={char}
          style={{ display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
