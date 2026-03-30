'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface ParseResult {
  ok: boolean;
  data: unknown;
  error: string | null;
  line?: number;
  column?: number;
}

function parseJSON(text: string): ParseResult {
  try {
    const parsed = JSON.parse(text);
    return { ok: true, data: parsed, error: null };
  } catch (e) {
    const err = e as Error;
    const result: ParseResult = { ok: false, data: null, error: err.message };
    const posMatch = err.message.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = text.substring(0, pos);
      const lines = before.split('\n');
      result.line = lines.length;
      result.column = lines[lines.length - 1].length + 1;
    }
    return result;
  }
}

export function JsonFormatter() {
  const t = useTranslations('Tools');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState<{ text: string; valid: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState('Copy');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hideError = useCallback(() => setError(null), []);

  const validate = useCallback((raw: string) => {
    if (!raw.trim()) {
      setError(null);
      setStatus(null);
      return;
    }
    const result = parseJSON(raw.trim());
    if (result.ok) {
      setError(null);
      setStatus({ text: 'Valid JSON', valid: true });
    } else {
      let detail = result.error || '';
      if (result.line) {
        detail += ` (line ${result.line}, column ${result.column})`;
      }
      setError(detail);
      setStatus({ text: 'Invalid', valid: false });
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => validate(value), 300);
  }, [validate]);

  const handleFormat = useCallback(() => {
    const raw = input.trim();
    if (!raw) {
      setOutput('');
      hideError();
      setStatus(null);
      return;
    }
    const result = parseJSON(raw);
    if (!result.ok) {
      let detail = result.error || '';
      if (result.line) detail += ` (line ${result.line}, column ${result.column})`;
      setError(detail);
      setStatus({ text: 'Invalid', valid: false });
      setOutput('');
      return;
    }
    hideError();
    setOutput(JSON.stringify(result.data, null, indent));
    setStatus({ text: 'Valid JSON', valid: true });
  }, [input, indent, hideError]);

  const handleMinify = useCallback(() => {
    const raw = input.trim();
    if (!raw) {
      setOutput('');
      hideError();
      setStatus(null);
      return;
    }
    const result = parseJSON(raw);
    if (!result.ok) {
      let detail = result.error || '';
      if (result.line) detail += ` (line ${result.line}, column ${result.column})`;
      setError(detail);
      setStatus({ text: 'Invalid', valid: false });
      setOutput('');
      return;
    }
    hideError();
    setOutput(JSON.stringify(result.data));
    setStatus({ text: 'Minified', valid: true });
  }, [input, hideError]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy'), 1500);
    });
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    hideError();
    setStatus(null);
  }, [hideError]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = ' '.repeat(indent);
      const newValue = textarea.value.substring(0, start) + spaces + textarea.value.substring(end);
      setInput(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      });
    }
  }, [indent]);

  const lineNumbers = output
    ? Array.from({ length: output.split('\n').length }, (_, i) => i + 1).join('\n')
    : '';

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
            <li className="text-primary">{t('jsonFormatter.title')}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading mb-2">{t('jsonFormatter.title')}</h1>
          <p className="text-on-surface/50">
            Format, validate, and beautify JSON data. Runs entirely in your browser.
          </p>
        </div>

        {/* Tool UI */}
        <div>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={handleFormat} className="btn-primary text-sm px-5 py-2.5">Format</button>
            <button onClick={handleMinify} className="btn-ghost text-sm px-5 py-2.5">Minify</button>
            <button onClick={handleCopy} className="btn-ghost text-sm px-5 py-2.5">{copyLabel}</button>
            <button onClick={handleClear} className="btn-ghost text-sm px-5 py-2.5">Clear</button>
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="indent-size" className="text-xs font-mono text-on-surface/40">Indent</label>
              <select
                id="indent-size"
                className="form-input py-1.5 px-3 w-20 text-sm font-mono"
                value={indent}
                onChange={(e) => setIndent(parseInt(e.target.value, 10))}
              >
                <option value="2">2 sp</option>
                <option value="4">4 sp</option>
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Input */}
            <div>
              <label htmlFor="json-input" className="block text-xs font-mono text-on-surface/40 mb-2 uppercase tracking-wider">
                Input
              </label>
              <textarea
                ref={inputRef}
                id="json-input"
                className="form-input font-mono text-sm h-80 resize-y"
                placeholder={'Paste your JSON here...\n{\n  "example": "value"\n}'}
                spellCheck={false}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono text-on-surface/40 uppercase tracking-wider">
                  Output
                </label>
                {status && (
                  <span className={`text-xs font-mono ${status.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {status.text}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="form-input font-mono text-sm h-80 overflow-auto whitespace-pre">
                  {output}
                </div>
                {lineNumbers && (
                  <div className="absolute top-0 left-0 w-10 h-80 overflow-hidden pointer-events-none font-mono text-xs text-on-surface/20 leading-[1.625] pt-3 pl-2">
                    {lineNumbers}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-4">
              <div className="card p-4" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-red-400 font-mono text-sm font-medium">Invalid JSON</p>
                    <p className="text-red-400/70 font-mono text-xs mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How to use */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold mb-4">How to Use</h2>
          <div className="text-on-surface/60 space-y-4 text-sm leading-relaxed">
            <p>Paste or type your JSON into the input field on the left. The tool validates your JSON in real time and shows any syntax errors with line and column numbers.</p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li><strong className="text-on-surface/80">Format</strong> — Pretty-prints your JSON with the selected indentation (2 or 4 spaces).</li>
              <li><strong className="text-on-surface/80">Minify</strong> — Compresses your JSON to a single line by removing all whitespace.</li>
              <li><strong className="text-on-surface/80">Copy</strong> — Copies the formatted output to your clipboard.</li>
              <li><strong className="text-on-surface/80">Clear</strong> — Resets both input and output fields.</li>
            </ol>
            <p>All processing happens client-side in your browser. Your data never leaves your machine.</p>
          </div>
        </section>

        {/* Related tools */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/base64" className="tag hover:text-secondary">Base64 Encoder</Link>
            <Link href="/tools/jwt-decoder" className="tag hover:text-secondary">JWT Decoder</Link>
            <Link href="/tools/regex-tester" className="tag hover:text-tertiary">Regex Tester</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
