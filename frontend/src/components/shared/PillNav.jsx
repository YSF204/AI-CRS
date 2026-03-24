import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';

export default function PillNav({
  logo,
  items,
  activeHref,
  ease = 'power2.easeOut',
  baseColor = '#000000',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#000000',
  pillTextColor = '#ffffff',
  theme = 'light',
  initialLoadAnimation = false,
  rightActions, // Custom addition to easily put buttons on the right
}) {
  const containerRef = useRef(null);
  const navItemsContainerRef = useRef(null);
  const pillRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const itemRefs = useRef([]);

  // Active item index
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
        autoAlpha: 1, // Opacity 1 + visibility visible
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
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [initialLoadAnimation]);

  const navBorderColor = theme === 'dark' ? '#333' : '#0a0a0a';
  const shadowColor = theme === 'dark' ? '#0a0a0a' : '#0a0a0a';
  const pillBorderColor = theme === 'dark' ? '#0a0a0a' : '#0a0a0a';

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1rem',
        borderRadius: '999px',
        backgroundColor: baseColor,
        border: `3px solid ${navBorderColor}`,
        boxShadow: `4px 4px 0 ${shadowColor}`,
        maxWidth: 950,
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
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
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
            backgroundColor: pillColor,
            borderRadius: '999px',
            border: `2px solid ${pillBorderColor}`,
            boxShadow: `2px 2px 0 ${pillBorderColor}`,
            zIndex: 0,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />

        {items.map((item, i) => {
          const isHovered = i === hoveredIndex;
          const isActive = i === activeIndex && hoveredIndex === null;
          const isHighlight = isHovered || isActive;

          return (
            <a
              key={item.href}
              href={item.href}
              ref={(el) => (itemRefs.current[i] = el)}
              onMouseEnter={() => setHoveredIndex(i)}
              style={{
                position: 'relative',
                zIndex: 1,
                textDecoration: 'none',
                padding: '0.45rem 1.25rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isHighlight ? hoveredPillTextColor : pillTextColor,
                transition: 'color 0.2s ease',
              }}
            >
              {item.label}
            </a>
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
