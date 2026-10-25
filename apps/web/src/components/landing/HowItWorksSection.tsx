import React from 'react';
import { UserCheck, Compass, CalendarCheck, Rocket } from 'lucide-react';
import { Card } from '../ui/Card.js';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  detail: string;
}

const STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Specify your college, current semester, subjects of interest, and target skills.',
    icon: <UserCheck className="w-5 h-5 text-foreground" />,
    detail: 'Takes under 2 minutes with zero friction.',
  },
  {
    number: '02',
    title: 'Discover Students',
    description: 'Explore verified student peers using algorithmic matching and branch-specific filters.',
    icon: <Compass className="w-5 h-5 text-foreground" />,
    detail: 'Ranked by syllabus similarity and goals.',
  },
  {
    number: '03',
    title: 'Connect & Schedule',
    description: 'Send study connection requests and schedule focused sessions with calendar sync.',
    icon: <CalendarCheck className="w-5 h-5 text-foreground" />,
    detail: 'Automated reminders & timezone handling.',
  },
  {
    number: '04',
    title: 'Learn Together',
    description: 'Collaborate in live study rooms with synchronized code, whiteboard derivations, and voice.',
    icon: <Rocket className="w-5 h-5 text-foreground" />,
    detail: 'Turn complex concepts into mastered skills.',
  },
];

export const HowItWorksSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-16 md:py-24 bg-background-secondary/40 border-b border-border/40 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-4 mb-14 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            How LearnPeer Works.
          </h2>
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            A frictionless workflow designed to take you from studying in isolation to active,
            structured peer collaboration.
          </p>
        </div>

        {/* Steps Grid: Horizontal on Desktop, Vertical on Mobile */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative transition-all duration-700 delay-150 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {STEPS.map((step) => (
            <Card
              key={step.number}
              hoverEffect
              className="p-6 space-y-4 flex flex-col justify-between bg-card border border-border relative overflow-hidden"
            >
              {/* Step indicator & icon */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-extrabold text-foreground-muted/40 select-none">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-foreground-muted">
                {step.detail}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
