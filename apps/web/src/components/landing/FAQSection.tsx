import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is LearnPeer?',
    answer:
      'LearnPeer is a dedicated peer-to-peer student collaboration platform. It helps students connect with study partners, schedule focused academic blocks, chat in real time, pair-program using a shared multi-cursor code editor, and collaborate on infinite digital whiteboards.',
  },
  {
    id: 'faq-2',
    question: 'How does the partner discovery algorithm find matching peers?',
    answer:
      'LearnPeer matches students based on several academic dimensions: currently enrolled courses, shared learning goals, complementary skills (e.g. one student strong in Algorithms helping another who excels in Databases), university branch, semester, and overlapping availability.',
  },
  {
    id: 'faq-3',
    question: 'Can I connect with classmates from my own college?',
    answer:
      'Yes. When setting up your profile, you can specify your university or college. You can search specifically for peers within your own institution or connect with students across other colleges studying the same curriculum.',
  },
  {
    id: 'faq-4',
    question: 'Is LearnPeer free to use for students?',
    answer:
      'Yes, LearnPeer is completely free for students. Our mission is to democratize high-quality academic peer collaboration with zero subscription paywalls, ads, or commercial distractions.',
  },
  {
    id: 'faq-5',
    question: 'Does LearnPeer support built-in audio and video calling?',
    answer:
      'Yes. LearnPeer integrates native peer-to-peer WebRTC audio and video calling directly in your browser. You can talk through tough derivations and code reviews with sub-30ms latency without installing third-party meeting software.',
  },
  {
    id: 'faq-6',
    question: 'Can we write code collaboratively in real time?',
    answer:
      'Absolutely. LearnPeer includes a collaborative Monaco Editor (the same technology behind VS Code) powered by Yjs CRDT synchronization. Multiple students can edit the same files simultaneously with distinct color-coded cursors across 9+ programming languages including TypeScript, Python, C++, and Java.',
  },
  {
    id: 'faq-7',
    question: 'How does session scheduling work?',
    answer:
      'You can propose a study session with a specific topic, time, and agenda. Your partner receives an instant notification to accept, decline, or suggest an alternate time. Confirmed sessions automatically sync with calendar apps via .ics exports and dispatch timely reminder alerts.',
  },
  {
    id: 'faq-8',
    question: 'How does LearnPeer protect student privacy and account safety?',
    answer:
      'Student security is foundational. All passwords are encrypted using state-of-the-art Argon2id hashing, API endpoints are safeguarded with strict JWT session verification and Helmet headers, and personal contact details are never exposed to advertisers or third parties.',
  },
];

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" ref={ref} className="py-16 md:py-24 bg-background-secondary/30 border-b border-border/40 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center space-y-4 mb-12 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions.
          </h2>
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            Everything you need to know about the platform, collaborative features, and security.
          </p>
        </div>

        {/* Accordion List */}
        <div
          className={`space-y-3 transition-all duration-700 delay-150 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-border-strong bg-card'
                    : 'border-border bg-card/60 hover:bg-card hover:border-border-strong/70'
                }`}
              >
                <button
                  type="button"
                  id={`btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${faq.id}`}
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
                >
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-lg bg-surface-hover border border-border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-foreground" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`panel-${faq.id}`}
                    role="region"
                    aria-labelledby={`btn-${faq.id}`}
                    className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-foreground-secondary leading-relaxed animate-fade-in border-t border-border/40 pt-3"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
