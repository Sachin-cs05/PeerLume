import React from 'react';
import {
  Compass,
  Users,
  MessageSquare,
  Video,
  Calendar,
  BookOpen,
  Code2,
  Presentation,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from './SpotlightCard.js';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  route: string;
  tag: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Compass className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />,
    title: 'Learning Partner Discovery',
    description:
      'Match with peers using algorithmic scoring that evaluates subject syllabus, target skills, semester, and availability.',
    linkText: 'Explore discovery',
    route: '/discover',
    tag: 'Matching Engine',
  },
  {
    icon: <Users className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110" />,
    title: 'Academic Friends & Network',
    description:
      'Manage study connections, view real-time online presence, and build focused learning circles across campuses.',
    linkText: 'View connections',
    route: '/connections',
    tag: 'Presence & Circles',
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />,
    title: 'Real-Time Messaging',
    description:
      'Direct peer messaging with code snippet formatting, read receipts, and instantaneous study coordination.',
    linkText: 'Open messages',
    route: '/chat',
    tag: 'Encrypted Chat',
  },
  {
    icon: <Video className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110" />,
    title: 'Direct Voice & Video Calls',
    description:
      'Integrated peer-to-peer WebRTC video and crystal-clear audio calling with zero third-party software required.',
    linkText: 'Start calling',
    route: '/chat',
    tag: 'WebRTC P2P',
  },
  {
    icon: <Calendar className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />,
    title: 'Structured Session Scheduling',
    description:
      'Propose and schedule study blocks with timezone awareness, calendar .ics export, and automated session reminders.',
    linkText: 'Manage schedule',
    route: '/sessions',
    tag: 'Smart Calendar',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />,
    title: 'Knowledge-Sharing Workspace',
    description:
      'Centralized hub for lecture notes, PDF study guides, references, and session-specific shared attachments.',
    linkText: 'Access workspace',
    route: '/workspace',
    tag: 'Resource Hub',
  },
  {
    icon: <Code2 className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />,
    title: 'Collaborative Code Editor',
    description:
      'Live multi-cursor Monaco code editor with Yjs CRDT synchronization, revision history, and 9+ programming languages.',
    linkText: 'Launch code editor',
    route: '/code',
    tag: 'Multi-Cursor Monaco',
  },
  {
    icon: <Presentation className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />,
    title: 'Interactive Study Rooms',
    description:
      'Virtual rooms featuring infinite whiteboard canvas for mathematical derivations, flowcharts, and architecture diagrams.',
    linkText: 'Join study rooms',
    route: '/study-rooms',
    tag: 'Infinite Whiteboard',
  },
];

export const FeaturesSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.08 });

  return (
    <section id="features" ref={ref} className="py-16 md:py-24 border-b border-border/40 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-4 mb-14 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
            <span>Built for Modern Learning</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Engineered for Effective Collaboration.
          </h2>
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            Every tool required to exchange knowledge, pair program, and maintain consistent academic
            momentum without tool fatigue.
          </p>
        </div>

        {/* 8-Card Grid with Spotlight and Staggered Cascade */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              style={{
                transitionDelay: `${index * 60}ms`,
              }}
              className={`transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <SpotlightCard className="p-5 sm:p-6 space-y-4 flex flex-col justify-between group h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center transition-colors group-hover:border-foreground/30">
                      {feature.icon}
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-hover/70 text-foreground-muted border border-border/60 transition-colors group-hover:text-foreground">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-foreground/90">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <Link
                    to={feature.route}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline group/link"
                  >
                    <span>{feature.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
