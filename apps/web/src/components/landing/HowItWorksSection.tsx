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
    icon: <UserCheck className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110" />,
    detail: 'Takes under 2 minutes with zero friction.',
  },
  {
    number: '02',
    title: 'Discover Students',
    description: 'Explore verified student peers using algorithmic matching and branch-specific filters.',
    icon: <Compass className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />,
    detail: 'Ranked by syllabus similarity and goals.',
  },
  {
    number: '03',
    title: 'Connect & Schedule',
    description: 'Send study connection requests and schedule focused sessions with calendar sync.',
    icon: <CalendarCheck className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />,
    detail: 'Automated reminders & timezone handling.',
  },
  {
    number: '04',
    title: 'Learn Together',
    description: 'Collaborate in live study rooms with synchronized code, whiteboard derivations, and voice.',
    icon: <Rocket className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />,
    detail: 'Turn complex concepts into mastered skills.',
  },
];

export const HowItWorksSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-16 md:py-24 bg-background-secondary/40 border-b border-border/40 scroll-mt-16 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
            How PeerLearn Works.
          </h2>
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            A frictionless workflow designed to take you from studying in isolation to active,
            structured peer collaboration.
          </p>
        </div>

        {/* Steps Grid: Horizontal on Desktop with Connecting Track, Vertical on Mobile */}
        <div className="relative">
          {/* Subtle Desktop Timeline Connecting Bar */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-px border-t border-dashed border-border/80 -translate-y-12 pointer-events-none z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                style={{
                  transitionDelay: `${index * 90}ms`,
                }}
                className={`transition-all duration-700 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <Card
                  hoverEffect
                  className="p-6 space-y-4 flex flex-col justify-between bg-card border border-border relative overflow-hidden group h-full transition-all duration-300 hover:border-border-strong hover:-translate-y-1.5"
                >
                  {/* Step indicator & icon */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center transition-colors group-hover:border-foreground/30">
                        {step.icon}
                      </div>
                      <span className="font-mono text-2xl font-extrabold text-foreground-muted/40 transition-colors group-hover:text-foreground/70 select-none">
                        {step.number}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-foreground-muted transition-colors group-hover:text-foreground-secondary">
                    {step.detail}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
