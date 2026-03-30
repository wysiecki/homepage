'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

// ── Option value mappings (match the original quiz.js scoring) ─────

const OPTION_VALUES = [
  // Q0: project type
  ['saas', 'ecommerce', 'internal', 'api', 'content'],
  // Q1: team size
  ['solo', 'small', 'medium', 'large'],
  // Q2: priority
  ['speed', 'performance', 'scale', 'maintain'],
  // Q3: ops complexity
  ['simple', 'moderate', 'full'],
  // Q4: language preference
  ['js', 'python', 'go', 'php', 'any'],
];

type ArchetypeKey =
  | 'lean-startup'
  | 'enterprise'
  | 'performance'
  | 'python'
  | 'php'
  | 'static'
  | 'scale'
  | 'fullstack';

const ALL_ARCHETYPES: ArchetypeKey[] = [
  'lean-startup',
  'enterprise',
  'performance',
  'python',
  'php',
  'static',
  'scale',
  'fullstack',
];

// Reasoning data (not translated — kept in English as in the original)
const REASONING: Record<ArchetypeKey, string[]> = {
  'lean-startup': [
    'You need to move fast and validate ideas. Next.js gives you full-stack capabilities with React, server-side rendering for SEO, and API routes \u2014 all in one framework.',
    'Vercel or a similar platform handles deployment, scaling, and CDN so you can focus on building features instead of managing infrastructure.',
    "PostgreSQL is your data layer \u2014 it scales well, has excellent tooling, and you won't outgrow it anytime soon. Add Prisma or Drizzle as your ORM for type safety.",
  ],
  enterprise: [
    'With a larger team and long-term maintainability as a priority, you need a stack that enforces structure. Spring Boot gives you dependency injection, strong typing, and a mature ecosystem.',
    'The monolith-first approach lets your team work in one codebase with clear module boundaries. Extract services later if and when you need to.',
    'Docker + Kubernetes give you the deployment flexibility a large team needs without premature microservice complexity.',
  ],
  performance: [
    "Go compiles to native binaries, has excellent concurrency primitives, and delivers consistent low-latency performance. It's the sweet spot between developer productivity and raw speed.",
    'Redis handles caching and real-time data. PostgreSQL with proper indexing handles your persistent storage.',
    'gRPC for internal communication gives you type-safe, high-performance service-to-service calls when you need them.',
  ],
  python: [
    'FastAPI gives you a modern, async-capable Python framework with automatic OpenAPI documentation and type validation via Pydantic.',
    "Python's ecosystem shines for data processing, ML integration, and scripting automation. If your project touches data science or AI, this is the natural choice.",
    'Docker containerization keeps deployment consistent and makes it easy to add worker processes, scheduled jobs, or ML model serving later.',
  ],
  php: [
    "Laravel is one of the most productive web frameworks ever built. Authentication, queues, caching, broadcasting \u2014 it's all built in and works out of the box.",
    "PHP 8 with JIT compilation delivers excellent performance. Combined with Laravel's elegant ORM (Eloquent) and MySQL, you have a battle-tested stack that powers millions of production apps.",
    'Laravel Forge or Docker-based deployment gives you a smooth path from development to production without DevOps overhead.',
  ],
  static: [
    'For content-focused sites, a static site generator gives you the best of all worlds: blazing performance, perfect SEO, near-zero hosting costs, and git-based content management.',
    'Astro or 11ty compile your content to pure HTML at build time. No JavaScript shipped to the client unless you explicitly opt in.',
    'Cloudflare Pages or Netlify deploy your site globally with automatic SSL, CDN, and continuous deployment from git. Total cost: $0.',
  ],
  scale: [
    'At scale, you need event-driven architecture. Kafka (or a managed equivalent) gives you a reliable event backbone that decouples your services and provides audit trails.',
    'Node.js with TypeScript balances developer productivity with runtime performance. The async I/O model handles high concurrency well.',
    'Kubernetes orchestrates your services, handles auto-scaling, and gives your team independent deployment pipelines. Only choose this if you have the team to manage it.',
  ],
  fullstack: [
    'TypeScript across the entire stack means shared types between frontend and backend, easier code reviews, and a lower cognitive overhead for your team.',
    'Next.js App Router gives you server components, API routes, and React \u2014 all with excellent DX. Prisma provides type-safe database access.',
    'This stack has the largest talent pool, the most learning resources, and the fastest iteration speed. Sometimes the most popular choice is popular for a reason.',
  ],
};

// ── Scoring logic (exact port from quiz.js) ────────────────────────

function determineArchetype(answers: string[]): ArchetypeKey {
  const scores: Record<ArchetypeKey, number> = {
    'lean-startup': 0,
    enterprise: 0,
    performance: 0,
    python: 0,
    php: 0,
    static: 0,
    scale: 0,
    fullstack: 0,
  };

  const [project, team, priority, ops, lang] = answers;

  // Project type scoring
  if (project === 'saas') {
    scores['lean-startup'] += 3;
    scores['fullstack'] += 2;
    scores['scale'] += 1;
  } else if (project === 'ecommerce') {
    scores['php'] += 3;
    scores['fullstack'] += 2;
    scores['lean-startup'] += 1;
  } else if (project === 'internal') {
    scores['php'] += 2;
    scores['python'] += 2;
    scores['fullstack'] += 1;
  } else if (project === 'api') {
    scores['performance'] += 3;
    scores['python'] += 2;
    scores['enterprise'] += 1;
  } else if (project === 'content') {
    scores['static'] += 5;
    scores['lean-startup'] += 1;
  }

  // Team size scoring
  if (team === 'solo') {
    scores['lean-startup'] += 3;
    scores['static'] += 2;
    scores['php'] += 1;
  } else if (team === 'small') {
    scores['fullstack'] += 2;
    scores['lean-startup'] += 1;
    scores['python'] += 1;
  } else if (team === 'medium') {
    scores['enterprise'] += 2;
    scores['fullstack'] += 1;
    scores['scale'] += 1;
  } else if (team === 'large') {
    scores['enterprise'] += 3;
    scores['scale'] += 2;
  }

  // Priority scoring
  if (priority === 'speed') {
    scores['lean-startup'] += 3;
    scores['php'] += 2;
    scores['static'] += 1;
  } else if (priority === 'performance') {
    scores['performance'] += 4;
    scores['scale'] += 1;
  } else if (priority === 'scale') {
    scores['scale'] += 4;
    scores['performance'] += 1;
  } else if (priority === 'maintain') {
    scores['enterprise'] += 3;
    scores['fullstack'] += 2;
  }

  // Ops complexity
  if (ops === 'simple') {
    scores['lean-startup'] += 2;
    scores['static'] += 3;
    scores['php'] += 1;
  } else if (ops === 'moderate') {
    scores['fullstack'] += 1;
    scores['python'] += 1;
  } else if (ops === 'full') {
    scores['enterprise'] += 2;
    scores['scale'] += 3;
    scores['performance'] += 1;
  }

  // Language preference (strong boost)
  if (lang === 'js') {
    scores['lean-startup'] += 3;
    scores['fullstack'] += 4;
    scores['scale'] += 2;
  } else if (lang === 'python') {
    scores['python'] += 5;
  } else if (lang === 'go') {
    scores['performance'] += 5;
  } else if (lang === 'php') {
    scores['php'] += 5;
  }
  // 'any' gets no language boost

  // Find highest score
  let best: ArchetypeKey = 'lean-startup';
  let bestScore = -1;
  for (const key of ALL_ARCHETYPES) {
    if (scores[key] > bestScore) {
      bestScore = scores[key];
      best = key;
    }
  }
  return best;
}

// ── Component ──────────────────────────────────────────────────────

type Phase = 'intro' | 'questions' | 'results';

export function Quiz() {
  const t = useTranslations('Quiz');

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [resultKey, setResultKey] = useState<ArchetypeKey | null>(null);
  const [shareText, setShareText] = useState<string | null>(null);

  const questionCount = 5; // fixed at 5 questions

  const startQuiz = useCallback(() => {
    setPhase('questions');
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedIdx(null);
    setResultKey(null);
  }, []);

  const selectOption = useCallback(
    (optionIndex: number) => {
      const value = OPTION_VALUES[currentQuestion][optionIndex];
      setSelectedIdx(optionIndex);

      setTimeout(() => {
        const newAnswers = [...answers, value];
        setAnswers(newAnswers);
        setSelectedIdx(null);

        if (currentQuestion + 1 < questionCount) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          const key = determineArchetype(newAnswers);
          setResultKey(key);
          setPhase('results');
        }
      }, 300);
    },
    [currentQuestion, answers],
  );

  const restart = useCallback(() => {
    setPhase('intro');
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedIdx(null);
    setResultKey(null);
    setShareText(null);
  }, []);

  const handleShare = useCallback(async () => {
    if (!resultKey) return;

    const name = t(`archetypes.${resultKey}.name`);
    const stack: string[] = [];
    // Read stack items from translations
    let i = 0;
    while (true) {
      try {
        const item = t(`archetypes.${resultKey}.stack.${i}`);
        if (!item) break;
        stack.push(item);
        i++;
      } catch {
        break;
      }
    }

    const text = `${t('ui.got')} "${name}" on the Tech Stack Quiz! ${stack.join(', ')}`;
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: name, text, url });
        return;
      } catch {
        // User cancelled or share failed
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareText(t('ui.copied'));
      setTimeout(() => setShareText(null), 2000);
    } catch {
      // Clipboard not available
    }
  }, [resultKey, t]);

  const progressPct =
    phase === 'results' ? 100 : Math.round((currentQuestion / questionCount) * 100);

  // Read translated question options
  const getOptions = (qIdx: number): string[] => {
    const opts: string[] = [];
    let i = 0;
    while (true) {
      try {
        const opt = t(`questions.${qIdx}.options.${i}`);
        if (!opt) break;
        opts.push(opt);
        i++;
      } catch {
        break;
      }
    }
    return opts;
  };

  // Read translated stack items for result
  const getStack = (key: ArchetypeKey): string[] => {
    const stack: string[] = [];
    let i = 0;
    while (true) {
      try {
        const item = t(`archetypes.${key}.stack.${i}`);
        if (!item) break;
        stack.push(item);
        i++;
      } catch {
        break;
      }
    }
    return stack;
  };

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-8">
      {/* Intro */}
      {phase === 'intro' && (
        <div className="reveal revealed text-center">
          <p className="section-label">{t('title')}</p>
          <h1 className="section-heading mb-6">
            What Stack
            <br />
            <span className="text-primary">Should You Use?</span>
          </h1>
          <p className="text-on-surface/50 text-lg mb-10 max-w-md mx-auto">{t('subtitle')}</p>
          <button className="btn-primary text-base px-10 py-4" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      )}

      {/* Questions */}
      {phase === 'questions' && (
        <div>
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs text-on-surface/40">
                Question <span>{currentQuestion + 1}</span> of{' '}
                <span>{questionCount}</span>
              </span>
              <span className="font-mono text-xs text-primary">{progressPct}%</span>
            </div>
            <div className="h-1 rounded-full bg-surface-highest overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(135deg, #2b7cc6, #5ba8e0)',
                }}
              />
            </div>
          </div>

          {/* Question container */}
          <div className="card p-8 md:p-10">
            <h2 className="font-display text-2xl font-semibold mb-8">
              {t(`questions.${currentQuestion}.question`)}
            </h2>
            <div className="space-y-3">
              {getOptions(currentQuestion).map((label, i) => (
                <button
                  key={i}
                  className={`quiz-option w-full text-left p-4 card hover:border-primary-container/40 transition-all duration-200 cursor-pointer group${
                    selectedIdx === i ? ' border-primary-container/50' : ''
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => selectOption(i)}
                  disabled={selectedIdx !== null}
                >
                  <span
                    className={`font-body text-sm group-hover:text-primary transition-colors${
                      selectedIdx === i ? ' text-primary' : ''
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {phase === 'results' && resultKey && (
        <div>
          {/* Progress bar at 100% */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs text-on-surface/40">
                Question {questionCount} of {questionCount}
              </span>
              <span className="font-mono text-xs text-primary">100%</span>
            </div>
            <div className="h-1 rounded-full bg-surface-highest overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2b7cc6, #5ba8e0)',
                }}
              />
            </div>
          </div>

          <div className="text-center mb-10">
            <p className="section-label">{t('ui.yourStack')}</p>
            <h2 className="section-heading mb-2">{t(`archetypes.${resultKey}.name`)}</h2>
            <p className="text-on-surface/50 text-lg">
              {t(`archetypes.${resultKey}.subtitle`)}
            </p>
          </div>

          <div className="card p-8 md:p-10 mb-8">
            <h3 className="font-display text-xl font-semibold mb-6 text-primary">
              Recommended Stack
            </h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {getStack(resultKey).map((tech) => (
                <span key={tech} className="tag text-sm px-4 py-1.5">
                  {tech}
                </span>
              ))}
            </div>
            <div className="text-on-surface/50 leading-relaxed space-y-4">
              {REASONING[resultKey].map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Share & Restart */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary" onClick={handleShare}>
              {shareText || t('ui.share')}
            </button>
            <button className="btn-ghost" onClick={restart}>
              {t('ui.startOver')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
