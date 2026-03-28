// ── Tech Stack Quiz ──────────────────────────────────────────────

const quizLang = document.documentElement.lang || 'en';

const questionsByLang = {
  en: [
    {
      question: 'What type of project are you building?',
      options: [
        { label: 'SaaS / Web App', value: 'saas' },
        { label: 'E-commerce / Marketplace', value: 'ecommerce' },
        { label: 'Internal Tool / Admin Dashboard', value: 'internal' },
        { label: 'API / Backend Service', value: 'api' },
        { label: 'Content Site / Blog / Portfolio', value: 'content' },
      ],
    },
    {
      question: 'How large is your team?',
      options: [
        { label: 'Solo developer', value: 'solo' },
        { label: 'Small team (2-5)', value: 'small' },
        { label: 'Medium team (6-15)', value: 'medium' },
        { label: 'Large / Enterprise (15+)', value: 'large' },
      ],
    },
    {
      question: 'What matters most for this project?',
      options: [
        { label: 'Ship fast — MVP in weeks', value: 'speed' },
        { label: 'Performance — milliseconds matter', value: 'performance' },
        { label: 'Scalability — millions of users', value: 'scale' },
        { label: 'Maintainability — long-term codebase', value: 'maintain' },
      ],
    },
    {
      question: 'How do you feel about DevOps complexity?',
      options: [
        { label: 'Keep it simple — minimal ops', value: 'simple' },
        { label: 'Some ops is fine — I know Docker', value: 'moderate' },
        { label: 'Full control — Kubernetes, CI/CD, the works', value: 'full' },
      ],
    },
    {
      question: "What's your preferred language ecosystem?",
      options: [
        { label: 'JavaScript / TypeScript', value: 'js' },
        { label: 'Python', value: 'python' },
        { label: 'Go', value: 'go' },
        { label: 'PHP', value: 'php' },
        { label: 'No preference — pick the best fit', value: 'any' },
      ],
    },
  ],
  de: [
    {
      question: 'Welche Art von Projekt entwickeln Sie?',
      options: [
        { label: 'SaaS / Web-App', value: 'saas' },
        { label: 'E-Commerce / Marktplatz', value: 'ecommerce' },
        { label: 'Internes Tool / Admin-Dashboard', value: 'internal' },
        { label: 'API / Backend-Service', value: 'api' },
        { label: 'Content-Seite / Blog / Portfolio', value: 'content' },
      ],
    },
    {
      question: 'Wie groß ist Ihr Team?',
      options: [
        { label: 'Solo-Entwickler', value: 'solo' },
        { label: 'Kleines Team (2-5)', value: 'small' },
        { label: 'Mittleres Team (6-15)', value: 'medium' },
        { label: 'Groß / Enterprise (15+)', value: 'large' },
      ],
    },
    {
      question: 'Was ist für dieses Projekt am wichtigsten?',
      options: [
        { label: 'Schnell liefern — MVP in Wochen', value: 'speed' },
        { label: 'Performance — jede Millisekunde zählt', value: 'performance' },
        { label: 'Skalierbarkeit — Millionen Nutzer', value: 'scale' },
        { label: 'Wartbarkeit — langfristige Codebasis', value: 'maintain' },
      ],
    },
    {
      question: 'Wie stehen Sie zu DevOps-Komplexität?',
      options: [
        { label: 'Einfach halten — minimaler Betrieb', value: 'simple' },
        { label: 'Etwas Ops ist okay — ich kenne Docker', value: 'moderate' },
        { label: 'Volle Kontrolle — Kubernetes, CI/CD, alles', value: 'full' },
      ],
    },
    {
      question: 'Welches Sprach-Ökosystem bevorzugen Sie?',
      options: [
        { label: 'JavaScript / TypeScript', value: 'js' },
        { label: 'Python', value: 'python' },
        { label: 'Go', value: 'go' },
        { label: 'PHP', value: 'php' },
        { label: 'Keine Präferenz — das Beste wählen', value: 'any' },
      ],
    },
  ],
  pl: [
    {
      question: 'Jaki typ projektu tworzysz?',
      options: [
        { label: 'SaaS / Aplikacja webowa', value: 'saas' },
        { label: 'E-commerce / Marketplace', value: 'ecommerce' },
        { label: 'Narzędzie wewnętrzne / Panel admina', value: 'internal' },
        { label: 'API / Serwis backendowy', value: 'api' },
        { label: 'Strona contentowa / Blog / Portfolio', value: 'content' },
      ],
    },
    {
      question: 'Jak duży jest Twój zespół?',
      options: [
        { label: 'Solo developer', value: 'solo' },
        { label: 'Mały zespół (2-5)', value: 'small' },
        { label: 'Średni zespół (6-15)', value: 'medium' },
        { label: 'Duży / Enterprise (15+)', value: 'large' },
      ],
    },
    {
      question: 'Co jest najważniejsze w tym projekcie?',
      options: [
        { label: 'Szybkie wdrożenie — MVP w tygodnie', value: 'speed' },
        { label: 'Wydajność — liczy się każda milisekunda', value: 'performance' },
        { label: 'Skalowalność — miliony użytkowników', value: 'scale' },
        { label: 'Łatwość utrzymania — długoterminowy kod', value: 'maintain' },
      ],
    },
    {
      question: 'Jak podchodzisz do złożoności DevOps?',
      options: [
        { label: 'Prosto — minimum operacji', value: 'simple' },
        { label: 'Trochę ops jest ok — znam Dockera', value: 'moderate' },
        { label: 'Pełna kontrola — Kubernetes, CI/CD, wszystko', value: 'full' },
      ],
    },
    {
      question: 'Jaki ekosystem języka preferujesz?',
      options: [
        { label: 'JavaScript / TypeScript', value: 'js' },
        { label: 'Python', value: 'python' },
        { label: 'Go', value: 'go' },
        { label: 'PHP', value: 'php' },
        { label: 'Bez preferencji — wybierz najlepszy', value: 'any' },
      ],
    },
  ],
};

const questions = questionsByLang[quizLang] || questionsByLang.en;

const archetypes = {
  'lean-startup': {
    name: 'The Lean Startup Stack',
    subtitle: 'Ship fast, iterate faster',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Vercel', 'Tailwind CSS'],
    reasoning: [
      'You need to move fast and validate ideas. Next.js gives you full-stack capabilities with React, server-side rendering for SEO, and API routes — all in one framework.',
      'Vercel or a similar platform handles deployment, scaling, and CDN so you can focus on building features instead of managing infrastructure.',
      "PostgreSQL is your data layer — it scales well, has excellent tooling, and you won't outgrow it anytime soon. Add Prisma or Drizzle as your ORM for type safety.",
    ],
  },
  'enterprise-monolith': {
    name: 'The Enterprise Monolith',
    subtitle: 'Built to last, designed for teams',
    stack: ['Java / Spring Boot', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    reasoning: [
      'With a larger team and long-term maintainability as a priority, you need a stack that enforces structure. Spring Boot gives you dependency injection, strong typing, and a mature ecosystem.',
      'The monolith-first approach lets your team work in one codebase with clear module boundaries. Extract services later if and when you need to.',
      'Docker + Kubernetes give you the deployment flexibility a large team needs without premature microservice complexity.',
    ],
  },
  'performance-machine': {
    name: 'The Performance Machine',
    subtitle: 'When every millisecond counts',
    stack: ['Go', 'PostgreSQL', 'Redis', 'gRPC', 'Docker'],
    reasoning: [
      "Go compiles to native binaries, has excellent concurrency primitives, and delivers consistent low-latency performance. It's the sweet spot between developer productivity and raw speed.",
      'Redis handles caching and real-time data. PostgreSQL with proper indexing handles your persistent storage.',
      'gRPC for internal communication gives you type-safe, high-performance service-to-service calls when you need them.',
    ],
  },
  'python-powerhouse': {
    name: 'The Python Powerhouse',
    subtitle: 'Data-driven and pragmatic',
    stack: ['FastAPI', 'Python', 'PostgreSQL', 'Redis', 'Docker'],
    reasoning: [
      'FastAPI gives you a modern, async-capable Python framework with automatic OpenAPI documentation and type validation via Pydantic.',
      "Python's ecosystem shines for data processing, ML integration, and scripting automation. If your project touches data science or AI, this is the natural choice.",
      'Docker containerization keeps deployment consistent and makes it easy to add worker processes, scheduled jobs, or ML model serving later.',
    ],
  },
  'php-pragmatist': {
    name: 'The PHP Pragmatist',
    subtitle: 'Proven, practical, gets it done',
    stack: ['Laravel', 'PHP 8', 'MySQL', 'Redis', 'Forge / Docker'],
    reasoning: [
      "Laravel is one of the most productive web frameworks ever built. Authentication, queues, caching, broadcasting — it's all built in and works out of the box.",
      "PHP 8 with JIT compilation delivers excellent performance. Combined with Laravel's elegant ORM (Eloquent) and MySQL, you have a battle-tested stack that powers millions of production apps.",
      'Laravel Forge or Docker-based deployment gives you a smooth path from development to production without DevOps overhead.',
    ],
  },
  'static-speed': {
    name: 'The Static Speed Demon',
    subtitle: 'Simple, fast, nearly free to host',
    stack: ['Astro / 11ty', 'Tailwind CSS', 'Markdown', 'Cloudflare Pages'],
    reasoning: [
      'For content-focused sites, a static site generator gives you the best of all worlds: blazing performance, perfect SEO, near-zero hosting costs, and git-based content management.',
      'Astro or 11ty compile your content to pure HTML at build time. No JavaScript shipped to the client unless you explicitly opt in.',
      'Cloudflare Pages or Netlify deploy your site globally with automatic SSL, CDN, and continuous deployment from git. Total cost: $0.',
    ],
  },
  'scale-ready': {
    name: 'The Scale-Ready Architecture',
    subtitle: 'Built for millions from day one',
    stack: ['Node.js / TypeScript', 'PostgreSQL', 'Redis', 'Kafka', 'Kubernetes'],
    reasoning: [
      'At scale, you need event-driven architecture. Kafka (or a managed equivalent) gives you a reliable event backbone that decouples your services and provides audit trails.',
      'Node.js with TypeScript balances developer productivity with runtime performance. The async I/O model handles high concurrency well.',
      'Kubernetes orchestrates your services, handles auto-scaling, and gives your team independent deployment pipelines. Only choose this if you have the team to manage it.',
    ],
  },
  'fullstack-js': {
    name: 'The Full-Stack JavaScript',
    subtitle: 'One language to rule them all',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Docker'],
    reasoning: [
      'TypeScript across the entire stack means shared types between frontend and backend, easier code reviews, and a lower cognitive overhead for your team.',
      'Next.js App Router gives you server components, API routes, and React — all with excellent DX. Prisma provides type-safe database access.',
      'This stack has the largest talent pool, the most learning resources, and the fastest iteration speed. Sometimes the most popular choice is popular for a reason.',
    ],
  },
};

// ── Scoring logic ────────────────────────────────────────────────

function determineArchetype(answers) {
  const scores = {};
  Object.keys(archetypes).forEach((k) => (scores[k] = 0));

  const [project, team, priority, ops, lang] = answers;

  // Project type scoring
  if (project === 'saas') {
    scores['lean-startup'] += 3;
    scores['fullstack-js'] += 2;
    scores['scale-ready'] += 1;
  } else if (project === 'ecommerce') {
    scores['php-pragmatist'] += 3;
    scores['fullstack-js'] += 2;
    scores['lean-startup'] += 1;
  } else if (project === 'internal') {
    scores['php-pragmatist'] += 2;
    scores['python-powerhouse'] += 2;
    scores['fullstack-js'] += 1;
  } else if (project === 'api') {
    scores['performance-machine'] += 3;
    scores['python-powerhouse'] += 2;
    scores['enterprise-monolith'] += 1;
  } else if (project === 'content') {
    scores['static-speed'] += 5;
    scores['lean-startup'] += 1;
  }

  // Team size scoring
  if (team === 'solo') {
    scores['lean-startup'] += 3;
    scores['static-speed'] += 2;
    scores['php-pragmatist'] += 1;
  } else if (team === 'small') {
    scores['fullstack-js'] += 2;
    scores['lean-startup'] += 1;
    scores['python-powerhouse'] += 1;
  } else if (team === 'medium') {
    scores['enterprise-monolith'] += 2;
    scores['fullstack-js'] += 1;
    scores['scale-ready'] += 1;
  } else if (team === 'large') {
    scores['enterprise-monolith'] += 3;
    scores['scale-ready'] += 2;
  }

  // Priority scoring
  if (priority === 'speed') {
    scores['lean-startup'] += 3;
    scores['php-pragmatist'] += 2;
    scores['static-speed'] += 1;
  } else if (priority === 'performance') {
    scores['performance-machine'] += 4;
    scores['scale-ready'] += 1;
  } else if (priority === 'scale') {
    scores['scale-ready'] += 4;
    scores['performance-machine'] += 1;
  } else if (priority === 'maintain') {
    scores['enterprise-monolith'] += 3;
    scores['fullstack-js'] += 2;
  }

  // Ops complexity
  if (ops === 'simple') {
    scores['lean-startup'] += 2;
    scores['static-speed'] += 3;
    scores['php-pragmatist'] += 1;
  } else if (ops === 'moderate') {
    scores['fullstack-js'] += 1;
    scores['python-powerhouse'] += 1;
  } else if (ops === 'full') {
    scores['enterprise-monolith'] += 2;
    scores['scale-ready'] += 3;
    scores['performance-machine'] += 1;
  }

  // Language preference (strong boost)
  if (lang === 'js') {
    scores['lean-startup'] += 3;
    scores['fullstack-js'] += 4;
    scores['scale-ready'] += 2;
  } else if (lang === 'python') {
    scores['python-powerhouse'] += 5;
  } else if (lang === 'go') {
    scores['performance-machine'] += 5;
  } else if (lang === 'php') {
    scores['php-pragmatist'] += 5;
  }
  // 'any' gets no language boost — let other factors decide

  // Find highest score
  let best = '';
  let bestScore = -1;
  for (const [key, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best;
}

// ── DOM manipulation ─────────────────────────────────────────────

const introEl = document.getElementById('quiz-intro');
const questionsEl = document.getElementById('quiz-questions');
const resultsEl = document.getElementById('quiz-results');
const startBtn = document.getElementById('quiz-start');
const restartBtn = document.getElementById('quiz-restart');
const shareBtn = document.getElementById('quiz-share');
const questionText = document.getElementById('quiz-question-text');
const optionsEl = document.getElementById('quiz-options');
const progressBar = document.getElementById('quiz-progress-bar');
const progressPct = document.getElementById('quiz-progress-pct');
const currentNum = document.getElementById('quiz-current');
const totalNum = document.getElementById('quiz-total');

let currentQuestion = 0;
let answers = [];

totalNum.textContent = questions.length;

function showQuestion(idx) {
  const q = questions[idx];
  currentNum.textContent = idx + 1;
  const pct = Math.round((idx / questions.length) * 100);
  progressBar.style.width = pct + '%';
  progressPct.textContent = pct + '%';

  questionText.textContent = q.question;

  optionsEl.innerHTML = q.options
    .map(
      (opt, i) => `
    <button class="quiz-option w-full text-left p-4 card hover:border-primary-container/40 transition-all duration-200 cursor-pointer group"
            data-value="${opt.value}" style="animation-delay: ${i * 60}ms">
      <span class="font-body text-sm group-hover:text-primary transition-colors">${opt.label}</span>
    </button>`
    )
    .join('');

  // Attach click handlers
  optionsEl.querySelectorAll('.quiz-option').forEach((btn) => {
    btn.addEventListener('click', () => selectOption(btn.dataset.value));
  });
}

function selectOption(value) {
  answers.push(value);

  // Highlight selected option briefly
  const selected = optionsEl.querySelector(`[data-value="${value}"]`);
  if (selected) {
    selected.classList.add('border-primary-container/50');
    selected.querySelector('span').classList.add('text-primary');
  }

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      showQuestion(currentQuestion);
    } else {
      showResults();
    }
  }, 300);
}

function showResults() {
  questionsEl.classList.add('hidden');
  resultsEl.classList.remove('hidden');

  progressBar.style.width = '100%';
  progressPct.textContent = '100%';

  const archetypeKey = determineArchetype(answers);
  const result = archetypes[archetypeKey];

  document.getElementById('result-archetype').textContent = result.name;
  document.getElementById('result-subtitle').textContent = result.subtitle;

  document.getElementById('result-stack').innerHTML = result.stack
    .map((tech) => `<span class="tag text-sm px-4 py-1.5">${tech}</span>`)
    .join('');

  document.getElementById('result-reasoning').innerHTML = result.reasoning
    .map((p) => `<p>${p}</p>`)
    .join('');

  // Store result for sharing
  resultsEl.dataset.archetype = archetypeKey;
}

function restart() {
  currentQuestion = 0;
  answers = [];
  resultsEl.classList.add('hidden');
  questionsEl.classList.add('hidden');
  introEl.classList.remove('hidden');
}

// ── Event listeners ──────────────────────────────────────────────

startBtn.addEventListener('click', () => {
  introEl.classList.add('hidden');
  questionsEl.classList.remove('hidden');
  showQuestion(0);
});

restartBtn.addEventListener('click', restart);

const quizUi = {
  en: { copied: 'Copied!', share: 'Share Result', got: 'I got' },
  de: { copied: 'Kopiert!', share: 'Ergebnis teilen', got: 'Mein Ergebnis' },
  pl: { copied: 'Skopiowano!', share: 'Udostępnij wynik', got: 'Mój wynik' },
}[quizLang] || { copied: 'Copied!', share: 'Share Result', got: 'I got' };

shareBtn.addEventListener('click', async () => {
  const archetypeKey = resultsEl.dataset.archetype;
  const result = archetypes[archetypeKey];
  const text = `${quizUi.got} "${result.name}" on the Tech Stack Quiz! ${result.stack.join(', ')}`;
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: result.name, text, url });
    } catch {
      // User cancelled or share failed
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      shareBtn.textContent = quizUi.copied;
      setTimeout(() => (shareBtn.textContent = quizUi.share), 2000);
    } catch {
      // Clipboard not available
    }
  }
});
