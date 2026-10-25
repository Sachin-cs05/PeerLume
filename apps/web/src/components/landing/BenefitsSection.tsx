import React from 'react';
import { Check, Brain, Users2, Flame, BookMarked } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BENEFITS: BenefitItem[] = [
  {
    icon: <Brain className="w-5 h-5 text-foreground" />,
    title: 'Multi-Perspective Conceptual Breakdown',
    description:
      'When two students approach a complex algorithm or derivation from different angles, both gain a far more resilient mental model than reading a textbook alone.',
  },
  {
    icon: <Flame className="w-5 h-5 text-foreground" />,
    title: 'Accelerated Debugging & Troubleshooting',
    description:
      'What might consume three frustrating hours of solitary hair-pulling can often be solved in five minutes through peer rubber-ducking and collaborative code inspection.',
  },
  {
    icon: <Users2 className="w-5 h-5 text-foreground" />,
    title: 'Mutual Accountability & Study Consistency',
    description:
      'Knowing a fellow peer is waiting in a scheduled study room provides the psychological commitment needed to defeat procrastination and sustain high-volume learning.',
  },
  {
    icon: <BookMarked className="w-5 h-5 text-foreground" />,
    title: 'Consolidated Knowledge Hub',
    description:
      'Stop searching through disorganized chat exports. Keep lecture slides, revision notes, algorithm code, and session whiteboard logs neatly unified.',
  },
];

export const BenefitsSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={ref} className="py-16 md:py-24 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Value Prop */}
          <div
            className={`lg:col-span-5 space-y-6 text-center lg:text-left transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
              <span>Backed by Learning Science</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              The Real Benefits of Learning Together.
            </h2>
            <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
              Peer instruction has been shown to double conceptual understanding compared to
              passive lectures alone. LearnPeer provides the digital infrastructure to make it work.
            </p>

            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2 text-xs text-foreground-secondary">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Zero Ads, Spam, or Commercial Clutter</span>
              </div>
              <p className="pl-6 text-foreground-muted">
                Every feature is purpose-built to help you understand tough material faster and
                build strong academic bonds.
              </p>
            </div>
          </div>

          {/* Right Column: 4 Benefit Cards */}
          <div
            className={`lg:col-span-7 space-y-4 transition-all duration-700 delay-150 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="p-5 sm:p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-start gap-4 hover:border-border-strong hover:bg-surface-hover/30 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
