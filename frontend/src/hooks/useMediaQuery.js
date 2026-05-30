import { useState, useEffect } from 'react';

/**
 * Reactive hook that returns true when the given media query matches.
 * Updates in real-time as the viewport resizes.
 *
 * @param {string} query - A CSS media query string, e.g. '(max-width: 767px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    // Use addEventListener for modern browsers, addListener for legacy
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, [query]);

  return matches;
}
