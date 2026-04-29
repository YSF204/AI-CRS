import React from 'react';
import CardSwap, { Card } from './CardSwap';

export { Card };

export default function CVShowcaseCarousel({ children }) {
  return (
    <div style={{ height: '700px', width: '100%', maxWidth: '500px', position: 'relative' }}>
      <CardSwap
        cardDistance={40}
        verticalDistance={28}
        delay={4000}
        pauseOnHover={false}
      >
        {children}
      </CardSwap>
    </div>
  );
}
