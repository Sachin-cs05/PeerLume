import React from 'react';
import { GraduationCap, Code2, Cpu, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card.js';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

interface AudienceItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}

const AUDIENCES: AudienceItem[] = [
  {
    icon: <GraduationCap className="w-5 h-5 text-foreground" />,
    title: 'University & College Students',
    subtitle: 'Undergraduates & Postgraduates',
    description:
      'Balancing demanding engineering, mathematics, computer science, and scientific coursework with fellow university classmates.',
    badge: 'Campus Academics',
  },
  {
    icon: <Code2 className="w-5 h-5 text-foreground" />,
    title: 'Collaborative Coders',
    subtitle: 'Software & Algorithm Learners',
    description:
      'Pair-programming through complex data structures, debugging tricky algorithms, and building full-stack portfolio applications together.',
    badge: 'Pair Programming',
  },
  {
    icon: <Cpu className="w-5 h-5 text-foreground" />,
    title: 'Self-Directed Skill Builders',
    subtitle: 'Technology & Tool Enthusiasts',
    description:
      'Expanding technical horizons in modern domains like AI/ML, cloud architecture, backend systems, and systems programming.',
    badge: 'Tech Skills',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-foreground" />,
    title: 'Exam & Interview Study Circles',
    subtitle: 'Focused Test Preparation',
    description:
      'Forming committed study blocks for semester exams, technical coding rounds, aptitude tests, and competitive assessments.',
    badge: 'Test Prep',
  },
];

export const AudienceSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-background-secondary/30 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-4 mb-14 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
            <span>Tailored for Every Learner</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Who Is LearnPeer For?
          </h2>
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            Whether preparing for high-stakes university exams or mastering modern software development,
            LearnPeer provides your collaborative backbone.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-150 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {AUDIENCES.map((item) => (
            <Card
              key={item.title}
              hoverEffect
              className="p-6 space-y-4 flex flex-col justify-between bg-card border border-border"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-hover border border-border text-foreground-muted">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground tracking-tight">{item.title}</h3>
                  <p className="text-xs font-mono text-foreground-muted">{item.subtitle}</p>
                </div>

                <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal pt-1">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 text-[11px] text-foreground-muted">
                Student-tested workflows &amp; zero fluff.
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
