'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface MatchInfo {
  text: string;
  index: number;
  groups: (string | undefined)[];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightMatches(text: string, regex: RegExp): string {
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  regex.lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    const matchText = escapeHtml(match[0]);
    parts.push(
      '<span class="rounded-cyber px-0.5" style="background: rgba(202, 190, 255, 0.2); border-bottom: 2px solid rgba(202, 190, 255, 0.6);">' +
        matchText +
        '</span>'
    );
    lastIndex = match.index + match[0].length;
    if (!regex.global) break;
  }

  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }

  return parts.join('');
}

export function RegexTester() {
  const t = useTranslations('Tools');
  const [pattern, setPattern] = useState('');
  const [testStr, setTestStr] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [outputHtml, setOutputHtml] = useState('<span class="text-on-surface/30 italic">Enter a pattern and test string above</span>');
  const [matchCount, setMatchCount] = useState('No matches');
  const [matchActive, setMatchActive] = useState(false);
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getFlags = useCallback(() => {
    let f = '';
    if (flags.g) f += 'g';
    if (flags.i) f += 'i';
    if (flags.m) f += 'm';
    if (flags.s) f += 's';
    return f;
  }, [flags]);

  const update = useCallback((p: string, ts: string, fl: typeof flags) => {
    let f = '';
    if (fl.g) f += 'g';
    if (fl.i) f += 'i';
    if (fl.m) f += 'm';
    if (fl.s) f += 's';

    setError(null);

    if (!p || !ts) {
      setOutputHtml('<span class="text-on-surface/30 italic">Enter a pattern and test string above</span>');
      setMatchCount('No matches');
      setMatchActive(false);
      setMatches([]);
      return;
    }

    let regex: RegExp;
    try {
      regex = new RegExp(p, f);
    } catch (e) {
      setError((e as Error).message);
      setOutputHtml('<span class="text-on-surface/30 italic">Fix the pattern error above</span>');
      setMatchCount('Invalid pattern');
      setMatchActive(false);
      setMatches([]);
      return;
    }

    // Find all matches
    const foundMatches: MatchInfo[] = [];
    const findFlags = f.includes('g') ? f : f + 'g';
    const findRegex = new RegExp(p, findFlags);
    findRegex.lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = findRegex.exec(ts)) !== null) {
      if (m.index === findRegex.lastIndex) {
        findRegex.lastIndex++;
      }
      const groups: (string | undefined)[] = [];
      for (let i = 1; i < m.length; i++) {
        groups.push(m[i]);
      }
      foundMatches.push({ text: m[0], index: m.index, groups });
      if (!f.includes('g')) break;
    }

    const count = foundMatches.length;
    setMatchCount(count === 0 ? 'No matches' : `${count} match${count === 1 ? '' : 'es'}`);
    setMatchActive(count > 0);
    setMatches(foundMatches);
    setOutputHtml(highlightMatches(ts, new RegExp(p, f)));
  }, []);

  const debouncedUpdate = useCallback((p: string, ts: string, fl: typeof flags) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update(p, ts, fl), 150);
  }, [update]);

  const handlePatternChange = useCallback((value: string) => {
    setPattern(value);
    debouncedUpdate(value, testStr, flags);
  }, [testStr, flags, debouncedUpdate]);

  const handleTestChange = useCallback((value: string) => {
    setTestStr(value);
    debouncedUpdate(pattern, value, flags);
  }, [pattern, flags, debouncedUpdate]);

  const handleFlagChange = useCallback((flag: keyof typeof flags) => {
    const newFlags = { ...flags, [flag]: !flags[flag] };
    setFlags(newFlags);
    debouncedUpdate(pattern, testStr, newFlags);
  }, [pattern, testStr, flags, debouncedUpdate]);

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 font-mono text-xs text-on-surface/40">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link href="/tools" className="hover:text-primary transition-colors">Tools</Link></li>
            <li>/</li>
            <li className="text-primary">{t('regexTester.title')}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading mb-2">{t('regexTester.title')}</h1>
          <p className="text-on-surface/50">
            Test regular expressions with live match highlighting, capture groups, and flag support.
          </p>
        </div>

        {/* Tool UI */}
        <div className="space-y-6">
          {/* Pattern input */}
          <div className="card p-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-on-surface/50 mb-3">Pattern</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-on-surface/30 font-mono text-lg">/</span>
                <input
                  type="text"
                  className="form-input font-mono flex-1"
                  placeholder="Enter regex pattern..."
                  spellCheck={false}
                  autoComplete="off"
                  value={pattern}
                  onChange={(e) => handlePatternChange(e.target.value)}
                />
                <span className="text-on-surface/30 font-mono text-lg">/</span>
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-4 mt-4">
              {(['g', 'i', 'm', 's'] as const).map((flag) => {
                const labels = { g: 'global', i: 'insensitive', m: 'multiline', s: 'dotAll' };
                return (
                  <label key={flag} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={flags[flag]}
                      onChange={() => handleFlagChange(flag)}
                      className="w-4 h-4 rounded-cyber accent-primary bg-surface-base border-outline"
                    />
                    <span className="text-sm font-mono text-on-surface/60 group-hover:text-on-surface transition-colors">
                      {flag} <span className="text-on-surface/30">{labels[flag]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Test string */}
          <div className="card p-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-on-surface/50 mb-3">Test String</label>
            <textarea
              className="form-input font-mono min-h-[120px] resize-y"
              placeholder="Enter test string..."
              spellCheck={false}
              value={testStr}
              onChange={(e) => handleTestChange(e.target.value)}
            />
          </div>

          {/* Match count */}
          <div className="flex items-center gap-3 text-sm font-mono text-on-surface/40">
            <span className={`w-2 h-2 rounded-full ${matchActive ? 'bg-secondary-container' : error ? 'bg-red-500' : 'bg-on-surface/20'}`} />
            <span>{matchCount}</span>
          </div>

          {/* Highlighted output */}
          <div className="card p-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-on-surface/50 mb-3">Match Highlighting</label>
            <div
              className="font-mono text-sm whitespace-pre-wrap break-all min-h-[80px] text-on-surface/70 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: outputHtml }}
            />
          </div>

          {/* Match details */}
          {matches.length > 0 && (
            <div className="card p-6">
              <label className="block text-xs font-mono uppercase tracking-wider text-on-surface/50 mb-3">Match Details</label>
              <div className="space-y-3">
                {matches.map((m, i) => (
                  <div key={i} className="p-3 rounded-cyber" style={{ background: 'rgba(19, 19, 19, 0.5)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-primary">Match {i + 1}</span>
                      <span className="text-xs font-mono text-on-surface/30">index {m.index}</span>
                    </div>
                    <div className="font-mono text-sm text-on-surface/80 break-all">{m.text}</div>
                    {m.groups.length > 0 && m.groups.map((g, gi) => (
                      <div key={gi} className="ml-4 text-on-surface/40">
                        <span className="text-secondary">Group {gi + 1}:</span>{' '}
                        <span className="text-on-surface/70">{g === undefined ? 'undefined' : g}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="card p-4 border-red-500/30 text-red-400 text-sm font-mono">
              {error}
            </div>
          )}
        </div>

        {/* How to use */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold mb-4">How to Use</h2>
          <div className="space-y-4 text-on-surface/60 text-sm leading-relaxed">
            <p><strong className="text-on-surface/80">1. Enter your pattern</strong> — Type a regular expression into the pattern field. No delimiters needed; just the raw pattern.</p>
            <p><strong className="text-on-surface/80">2. Set flags</strong> — Toggle global (g), case-insensitive (i), multiline (m), or dotAll (s) flags using the checkboxes.</p>
            <p><strong className="text-on-surface/80">3. Add test text</strong> — Paste or type your test string. Matches are highlighted in real time as you type.</p>
            <p><strong className="text-on-surface/80">4. Review matches</strong> — The match details section shows each match with its full text, capture groups, and character index.</p>
          </div>
        </section>

        {/* Related tools */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="tag hover:text-secondary">JSON Formatter</Link>
            <Link href="/tools/base64" className="tag hover:text-secondary">Base64 Encoder</Link>
            <Link href="/tools/cron-explainer" className="tag hover:text-secondary">Cron Explainer</Link>
            <Link href="/tools/jwt-decoder" className="tag hover:text-secondary">JWT Decoder</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
