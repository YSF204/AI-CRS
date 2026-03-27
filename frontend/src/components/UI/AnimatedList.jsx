import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AnimatedList
 *
 * Props:
 *  items              – array of anything (strings or objects)
 *  renderItem         – optional (item, index, isSelected) => ReactNode
 *                       if omitted, items are rendered as plain text
 *  onItemSelect       – (item, index) => void
 *  showGradients      – boolean  – top/bottom fade overlays
 *  enableArrowNavigation – boolean – ↑ / ↓ keyboard nav
 *  displayScrollbar   – boolean  – show native scrollbar
 *  className          – extra class on the wrapper
 *  itemHeight         – px height hint for scroll calculations (default 72)
 */
export default function AnimatedList({
  items = [],
  renderItem,
  onItemSelect,
  showGradients = false,
  enableArrowNavigation = false,
  displayScrollbar = false,
  className = '',
  itemHeight = 72,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hovered, setHovered] = useState(null);
  const scrollRef = useRef(null);

  /* ── Arrow key navigation ── */
  const handleKey = useCallback(
    (e) => {
      if (!enableArrowNavigation) return;
      if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return;
      e.preventDefault();

      setSelectedIndex((prev) => {
        let next = prev ?? -1;
        if (e.key === 'ArrowDown') next = Math.min(next + 1, items.length - 1);
        if (e.key === 'ArrowUp')   next = Math.max(next - 1, 0);
        if (e.key === 'Enter' && next >= 0) onItemSelect?.(items[next], next);

        // scroll selected item into view
        if (scrollRef.current) {
          const el = scrollRef.current.children[next];
          el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        return next;
      });
    },
    [enableArrowNavigation, items, onItemSelect],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  /* ── helpers ── */
  const handleClick = (item, index) => {
    setSelectedIndex(index);
    onItemSelect?.(item, index);
  };

  const defaultRender = (item, _index, isSelected) => (
    <span
      className="block px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-colors"
      style={{ color: isSelected ? '#0a0a0a' : 'var(--fg)' }}
    >
      {String(item)}
    </span>
  );

  const renderFn = renderItem ?? defaultRender;

  return (
    <div
      className={`relative ${className}`}
      style={{ outline: 'none' }}
      tabIndex={enableArrowNavigation ? 0 : undefined}
    >
      {/* Gradient overlays */}
      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10"
            style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10"
            style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }}
          />
        </>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 overflow-y-auto"
        style={{
          maxHeight: '520px',
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          msOverflowStyle: displayScrollbar ? 'auto' : 'none',
        }}
      >
        <AnimatePresence initial={false}>
          {items.map((item, index) => {
            const isSelected = selectedIndex === index;
            const isHovered  = hovered === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{
                  duration: 0.32,
                  delay: index * 0.055,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => handleClick(item, index)}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                className="brutal-card cursor-pointer select-none overflow-hidden"
                style={{
                  background: isSelected
                    ? 'var(--teal)'
                    : isHovered
                    ? 'var(--card-bg-hover, var(--card-bg))'
                    : 'var(--card-bg)',
                  transform: isHovered && !isSelected ? 'translate(-2px, -2px)' : 'translate(0,0)',
                  boxShadow: isSelected
                    ? '4px 4px 0 #0a0a0a'
                    : isHovered
                    ? '6px 6px 0 #0a0a0a'
                    : '3px 3px 0 #0a0a0a',
                  transition: 'background 0.15s ease, transform 0.12s ease, box-shadow 0.12s ease',
                }}
              >
                {renderFn(item, index, isSelected)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
