import React from 'react';
import { ThemeProvider } from '../../../context/ThemeContext';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import QuoteSection from './QuoteSection';
import TeamSection from './TeamSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
        <Navbar />
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <QuoteSection />
        <TeamSection />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
