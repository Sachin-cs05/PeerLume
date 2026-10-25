import React from 'react';
import { Compass, Users, Presentation, Calendar } from 'lucide-react';
import { Card } from '../ui/Card.js';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

interface HighlightItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    icon: <Compass className="w-5 h-5 text-foreground" />,
    title: 'Discover Learning Partners',
    description:
      'Match algorithmically with peers based on courses, target skills, and complementary study goals.',
  },
  {
    icon: <Users className="w-5 h-5 text-foreground" />,
    title: 'Connect with Students',
    description:
      'Build your verified academic circle, track real-time study presence, and coordinate in direct chats.',
  },
  {
    icon: <Presentation className="w-5 h-5 text-foreground" />,
    title: 'Collaborate in Real Time',
    description:
      'Engage in interactive rooms equipped with multi-cursor code workspaces, canvas whiteboard, and audio.',
  },
  {
    icon: <Calendar className="w-5 h-5 text-foreground" />,
    title: 'Organize Study Sessions',
    description:
      'Schedule structured study blocks with timezone awareness, calendar exports (.ics), and reminders.',
  },
];

export const PlatformHighlights: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={ref} className="py-12 md:py-16 bg-background-secondary/60 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {HIGHLIGHTS.map((item, index) => (
            <Card
              key={item.title}
              hoverEffect
              className={`p-5 space-y-3 bg-card border border-border transition-all duration-300 delay-[${index * 75}ms]`}
            >
              <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center">
                {item.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
