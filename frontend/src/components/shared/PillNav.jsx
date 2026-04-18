import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

/**
 * PillNav — Canonical navbar component with Paper design system.
 * Explicit anatomy: logo slot, primary links rail, secondary actions rail, theme-safe active indicator.
 *
 * @param {Object} logo - Logo component/slot
 * @param {Array} items - Navigation items [{ label, href }]
 * @param {string} activeHref - Currently active route
 * @param {Function} ease - GSAP easing function
 * @param {string} theme - 'light' | 'dark'
 * @param {boolean} initialLoadAnimation - Enable entrance animation
 * @param {React.ReactNode} rightActions - Secondary actions (theme toggle, user menu, etc.)
 */
export default function PillNav({
  logo,
  items = [],
  activeHref,
  ease = 'power2.easeOut',
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

  // Sliding pill animation with Paper motion constraints
  useEffect(() => {
    if (!pillRef.current || !navItemsContainerRef.current) return;

    let targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

    if (targetIndex !== -1 && itemRefs.current[targetIndex]) {
      const el = itemRefs.current[targetIndex];
      const parentBounds = navItemsContainerRef.current.getBoundingClientRect();
      const bounds = el.getBoundingClientRect();

      const x = bounds.left - parentBounds.left;
      const width = bounds.width;

      // Use Paper motion tokens: short duration, clean easing
      const durationRaw = getComputedStyle(document.documentElement).getPropertyValue('--nav-pill-animation-duration');
      const duration = durationRaw ? parseFloat(durationRaw) : 0.25;
      
      gsap.to(pillRef.current, {
        x,
        width,
        duration: duration,
        ease: getComputedStyle(document.documentElement).getPropertyValue('--nav-pill-animation-easing') || 'power2.easeOut',
        autoAlpha: 1,
      });
    } else {
      const durationRaw = getComputedStyle(document.documentElement).getPropertyValue('--nav-pill-animation-duration');
      const duration = durationRaw ? parseFloat(durationRaw) : 0.25;
      gsap.to(pillRef.current, {
        autoAlpha: 0,
        duration: duration,
        ease: ease,
      });
    }
  }, [hoveredIndex, activeIndex, ease, items]);

  // Entrance animation with reduced motion support
  useEffect(() => {
    if (initialLoadAnimation && containerRef.current) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set(containerRef.current, { y: 0, opacity: 1 });
      } else {
        gsap.fromTo(
          containerRef.current,
          { y: -60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
        );
      }
    }
  }, [initialLoadAnimation]);

  // Render nav item with Paper design system
  const renderNavItem = (item, index) => {
    const isHovered = index === hoveredIndex;
    const isActive = index === activeIndex && hoveredIndex === null;
    const isHighlight = isHovered || isActive;

    const commonProps = {
      ref: (el) => (itemRefs.current[index] = el),
      onMouseEnter: () => setHoveredIndex(index),
      className: `nav-item ${isHighlight ? 'active' : ''}`,
    };

    if (typeof item.href === 'string' && item.href.startsWith('#')) {
      return (
        <a key={item.href} href={item.href} {...commonProps}>
          {item.label}
        </a>
      );
    }

    return (
      <Link key={item.href} to={item.href} {...commonProps}>
        {item.label}
      </Link>
    );
  };

  return (
    <div
      ref={containerRef}
      className="pill-nav-container"
    >
      {/* Left side: Logo slot */}
      <div className="nav-logo">
        {logo}
      </div>

      {/* Middle: Primary links rail */}
      <nav
        ref={navItemsContainerRef}
        className="nav-items-rail hidden md:flex"
        onMouseLeave={() => setHoveredIndex(null)}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Animated pill background - theme-safe active indicator */}
        <div
          ref={pillRef}
          className="nav-pill-background"
          aria-hidden="true"
        />

        {items.map((item, index) => renderNavItem(item, index))}
      </nav>

      {/* Right side: Secondary actions rail */}
      <div className="nav-actions-rail">
        {rightActions}
      </div>
    </div>
  );
}
