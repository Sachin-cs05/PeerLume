import React from 'react';
import { ScrollProgressIndicator } from '../components/landing/ScrollProgressIndicator.js';
import { LandingNavbar } from '../components/landing/LandingNavbar.js';
import { HeroSection } from '../components/landing/HeroSection.js';
import { PlatformHighlights } from '../components/landing/PlatformHighlights.js';
import { ProblemSolutionSection } from '../components/landing/ProblemSolutionSection.js';
import { FeaturesSection } from '../components/landing/FeaturesSection.js';
import { HowItWorksSection } from '../components/landing/HowItWorksSection.js';
import { ProductShowcase } from '../components/landing/ProductShowcase.js';
import { WhyLearnPeerSection } from '../components/landing/WhyLearnPeerSection.js';
import { AudienceSection } from '../components/landing/AudienceSection.js';
import { BenefitsSection } from '../components/landing/BenefitsSection.js';
import { FAQSection } from '../components/landing/FAQSection.js';
import { FinalCTASection } from '../components/landing/FinalCTASection.js';
import { LandingFooter } from '../components/landing/LandingFooter.js';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-150 relative selection:bg-foreground selection:text-background">
      {/* 1. Subtle Monochrome Scroll Progress Indicator */}
      <ScrollProgressIndicator />

      {/* 2. Sticky Glassmorphic Monochrome Navbar with Scroll Spy */}
      <LandingNavbar />

      {/* 3. Main Landing Page Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Platform Highlights */}
        <PlatformHighlights />

        {/* Problem and Solution */}
        <ProblemSolutionSection />

        {/* 8-Feature Interactive Grid */}
        <FeaturesSection />

        {/* 4-Step How It Works Timeline */}
        <HowItWorksSection />

        {/* Interactive Multi-Tab Product Tour */}
        <ProductShowcase />

        {/* Why LearnPeer & Conceptual Values */}
        <WhyLearnPeerSection />

        {/* Student Audience Segments */}
        <AudienceSection />

        {/* Cognitive & Study Benefits */}
        <BenefitsSection />

        {/* Accessible Accordion FAQ */}
        <FAQSection />

        {/* High-Contrast Conversion CTA */}
        <FinalCTASection />
      </main>

      {/* 4. Complete Responsive Footer */}
      <LandingFooter />
    </div>
  );
};
