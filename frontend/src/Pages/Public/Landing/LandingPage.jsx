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
        backgroundColor: 'var(--bg)',
        color: 'var(--fg)',
        backgroundImage: 'var(--paper-texture)',
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
