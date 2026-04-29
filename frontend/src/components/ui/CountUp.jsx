import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2, // in seconds
  className = '',
  startCounting = true,
  separator = '',
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);
  
  // Create a spring to make the counting smooth
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
    restDelta: 0.001,
    restSpeed: 0.001,
  });
  
  const isInView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => {
    if (!startCounting || !isInView) return;

    // A simple timeout for the delay
    const timer = setTimeout(() => {
      motionValue.set(direction === 'down' ? from : to);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [to, from, direction, delay, startCounting, isInView, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        const formattedNumber = Intl.NumberFormat('en-US', {
          useGrouping: !!separator,
        }).format(Math.floor(latest));
        
        ref.current.textContent = separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
      }
    });

    return () => unsubscribe();
  }, [springValue, separator]);

  // Handle immediate visual representation on mount or change if not animating yet
  useEffect(() => {
    if (ref.current && !isInView) {
      ref.current.textContent = from;
    }
  }, [from, isInView]);

  return <span className={className} ref={ref} />;
}
