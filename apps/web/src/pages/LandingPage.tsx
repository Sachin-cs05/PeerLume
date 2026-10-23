import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  ArrowRight,
  Code2,
  BookOpen,
  Presentation,
  Calendar,
  Video,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { APP_TAGLINE } from '@peerlume/shared';

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Find a study partner',
    description: 'Match with fellow students based on skills you want to learn and subjects you can teach.',
    icon: <Compass className="w-6 h-6 text-brand-400" />,
  },
  {
    step: '02',
    title: 'Study together',
    description: 'Collaborate in live study rooms with whiteboards, real-time code editors, and quick voice calls.',
    icon: <Presentation className="w-6 h-6 text-purple-400" />,
  },
  {
    step: '03',
    title: 'Track your progress',
    description: 'Schedule peer sessions, share helpful notes and snippets, and achieve your academic goals.',
    icon: <Calendar className="w-6 h-6 text-emerald-400" />,
  },
];

const FEATURES = [
  {
    title: 'Smart Peer Matching',
    description: 'Find classmates by subject, skills, and academic goals to learn from each other.',
    icon: <Users className="w-5 h-5 text-brand-400" />,
  },
  {
    title: 'Study Rooms & Whiteboard',
    description: 'Sketch diagrams, work out formulas, and brainstorm ideas together on an interactive canvas.',
    icon: <Presentation className="w-5 h-5 text-rose-400" />,
  },
  {
    title: 'Collaborative Code Editor',
    description: 'Write, debug, and review code side-by-side in real time with syntax highlighting.',
    icon: <Code2 className="w-5 h-5 text-indigo-400" />,
  },
  {
    title: 'Voice & Video Calls',
    description: 'Hop into high-quality audio or video calls with your study partner anytime you need to talk.',
    icon: <Video className="w-5 h-5 text-blue-400" />,
  },
  {
    title: 'Session Scheduling',
    description: 'Plan study sessions with calendar sync and automatic reminders so you never miss a meetup.',
    icon: <Calendar className="w-5 h-5 text-emerald-400" />,
  },
  {
    title: 'Knowledge Workspace',
    description: 'Organize study notes, external links, and useful resources in a shared student workspace.',
    icon: <BookOpen className="w-5 h-5 text-amber-400" />,
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-10 md:py-16 space-y-24">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-purple-600/15 to-teal-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[300px] bg-gradient-to-br from-indigo-500/10 via-brand-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* 1. Hero Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Peer-to-Peer Learning Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          {APP_TAGLINE.split('.')[0]}.<br />
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
            {APP_TAGLINE.split('.')[1] || 'Grow Together.'}
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Connect with fellow students, collaborate in real time with shared whiteboards and code,
          and master your coursework through peer learning.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get started
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              Log in
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How it works</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Three simple steps to connect, collaborate, and excel with study buddies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <Card key={step.step} className="p-6 space-y-4 relative border-slate-800 bg-slate-900/60" hoverEffect>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-2xl font-black text-slate-700 select-none">{step.step}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Features Grid (At most 6 cards in simple student language) */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Everything you need to study together
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Built from the ground up for students who want focused, productive collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-6 space-y-3 border-slate-800 bg-slate-900/60" hoverEffect>
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-white">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Final Call-to-Action */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-950/60 via-slate-900 to-indigo-950/50 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to study smarter together?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Create your student profile in less than two minutes. Connect with peers who share your goals and start learning today.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get started for free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
