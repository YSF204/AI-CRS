import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function PillNav({
  logo,
  items,
  activeHref,
  ease = 'power2.easeOut',
  baseColor,
  pillColor,
  hoveredPillTextColor,
  pillTextColor,
  theme = 'light',
  initialLoadAnimation = false,
  rightActions,
}) {
  const containerRef = useRef(null);
  const navItemsContainerRef = useRef(null);
  const pillRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const itemRefs = useRef([]);

  const activeIndex = items.findIndex((item) => item.href === activeHref);

  useEffect(() => {
    if (!pillRef.current || !navItemsContainerRef.current) return;

    let targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

    if (targetIndex !== -1 && itemRefs.current[targetIndex]) {
      const el = itemRefs.current[targetIndex];
      const parentBounds = navItemsContainerRef.current.getBoundingClientRect();
      const bounds = el.getBoundingClientRect();

      const x = bounds.left - parentBounds.left;
      const width = bounds.width;

      gsap.to(pillRef.current, {
        x,
        width,
        duration: 0.35,
        ease: ease,
        autoAlpha: 1,
      });
    } else {
      gsap.to(pillRef.current, {
        autoAlpha: 0,
        duration: 0.35,
        ease: ease,
      });
    }
  }, [hoveredIndex, activeIndex, ease, items]);

  useEffect(() => {
    if (initialLoadAnimation && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, [initialLoadAnimation]);

  /* Paper design: use CSS variables for theming */
  const navBg = baseColor || (theme === 'dark' ? 'rgba(28, 25, 23, 0.92)' : 'rgba(255, 255, 255, 0.92)');
  const navBorder = theme === 'dark' ? 'rgba(61, 53, 48, 0.6)' : 'rgba(214, 207, 196, 0.8)';
  const pillBg = pillColor || 'var(--accent-light)';
  const pillText = hoveredPillTextColor || 'var(--accent)';
  const defaultText = pillTextColor || 'var(--fg-muted)';

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        borderRadius: '999px',
        backgroundColor: navBg,
        border: `1px solid ${navBorder}`,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        maxWidth: '100%',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Left side (Logo) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>{logo}</div>

      {/* Middle Nav Items */}
      <div
        ref={navItemsContainerRef}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.15rem' }}
        onMouseLeave={() => setHoveredIndex(null)}
        className="hidden md:flex"
      >
        {/* Animated Pill Background */}
        <div
          ref={pillRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            height: '100%',
            backgroundColor: pillBg,
            borderRadius: '999px',
            zIndex: 0,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'background-color 0.2s ease',
          }}
        />

        {items.map((item, i) => {
          const isHovered = i === hoveredIndex;
          const isActive = i === activeIndex && hoveredIndex === null;
          const isHighlight = isHovered || isActive;

          const commonStyle = {
            position: 'relative',
            zIndex: 1,
            textDecoration: 'none',
            padding: '0.4rem 1.1rem',
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 600,
            fontSize: '0.82rem',
            letterSpacing: '0.02em',
            color: isHighlight ? pillText : defaultText,
            transition: 'color 0.2s ease',
          };

          if (typeof item.href === 'string' && item.href.startsWith('#')) {
            return (
              <a
                key={item.href}
                href={item.href}
                ref={(el) => (itemRefs.current[i] = el)}
                onMouseEnter={() => setHoveredIndex(i)}
                style={commonStyle}
              >
                {item.label}
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              ref={(el) => (itemRefs.current[i] = el)}
              onMouseEnter={() => setHoveredIndex(i)}
              style={commonStyle}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {rightActions}
      </div>
    </div>
  );
}
