import React from 'react';
import { Sparkles, Target, Zap, ShieldCheck } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard.js';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

interface WhyItem {
  icon: React.ReactNode;
  title: string;
  tagline: string;
  description: string;
}

const WHY_POINTS: WhyItem[] = [
  {
    icon: <Sparkles className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />,
    title: 'Peer-Based Active Learning',
    tagline: 'Deep comprehension through explanation',
    description:
      'Explaining a difficult concept to a fellow peer forces mental synthesis (the Feynman Technique), turning fragile memorization into genuine conceptual mastery.',
  },
  {
    icon: <Target className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />,
    title: 'Goal-Oriented Connections',
    tagline: 'Aligned incentives and mutual targets',
    description:
      'Unlike broad social networks, connections on PeerLearn are formed around specific academic subjects, imminent exams, and technical project milestones.',
  },
  {
    icon: <Zap className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />,
    title: 'Zero-Friction Collaboration',
    tagline: 'Built for study groups, not corporate meetings',
    description:
      'No more jumping across three separate apps to share a code snippet, sketch a diagram, and talk. Everything lives in one seamless, high-speed study room.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110" />,
    title: 'Accountability & Momentum',
    tagline: 'Consistent study habits that compound',
    description:
      'Scheduled peer sessions create positive social accountability. You show up prepared, stay focused, and achieve sustained study streaks without burnout.',
  },
];

export const WhyLearnPeerSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section id="why-peerlearn" ref={ref} className="py-16 md:py-24 border-b border-border/40 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-4 mb-14 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
            <span>The Value of Peer Collaboration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Why Learn Alone When You Can Learn Together?
          </h2>
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            Research consistently demonstrates that collaborative peer study outperforms solitary
            cramming. Here is how PeerLearn maximizes your academic growth.
          </p>
        </div>

        {/* 2x2 Grid with Spotlight & Staggered delays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WHY_POINTS.map((item, index) => (
            <div
              key={item.title}
              style={{
                transitionDelay: `${index * 80}ms`,
              }}
              className={`transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <SpotlightCard className="p-6 sm:p-8 space-y-4 group h-full">
                <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center transition-colors group-hover:border-foreground/30">
                  {item.icon}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-foreground-muted">{item.tagline}</p>
                  <p className="text-sm text-foreground-secondary leading-relaxed pt-2 font-normal">
                    {item.description}
                  </p>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const WhyPeerLearnSection = WhyLearnPeerSection;
