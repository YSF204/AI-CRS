import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import TeamSection from './TeamSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--nm-bg)',
        color: 'var(--nm-text-primary)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TeamSection />
      <Footer />
    </div>
  );
}
