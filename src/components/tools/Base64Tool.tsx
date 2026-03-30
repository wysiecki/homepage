'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function Base64Tool() {
  const t = useTranslations('Tools');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [charCount, setCharCount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState('Copy Result');

  const process = useCallback((raw: string, currentMode: 'encode' | 'decode') => {
    setError(null);
    if (!raw) {
      setOutput('');
      setCharCount('');
      return;
    }
    try {
      let result: string;
      if (currentMode === 'encode') {
        result = utf8ToBase64(raw);
      } else {
        const cleaned = raw.replace(/\s/g, '');
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
          throw new Error('Invalid Base64: contains characters outside the Base64 alphabet (A-Z, a-z, 0-9, +, /, =).');
        }
        if (cleaned.length % 4 !== 0) {
          throw new Error('Invalid Base64: string length must be a multiple of 4. Got ' + cleaned.length + ' characters.');
        }
        result = base64ToUtf8(cleaned);
      }
      setOutput(result);
      setCharCount(result.length + ' chars');
    } catch (e) {
      setOutput('');
      setCharCount('');
      setError((e as Error).message);
    }
  }, []);

  const handleModeChange = useCallback((newMode: 'encode' | 'decode') => {
    setMode(newMode);
    process(input, newMode);
  }, [input, process]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    process(value, mode);
  }, [mode, process]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy Result'), 1500);
    });
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setCharCount('');
    setError(null);
  }, []);

  const encodeActive = mode === 'encode';

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
            <li className="text-primary">{t('base64.title')}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading mb-2">Base64 Encoder / Decoder</h1>
          <p className="text-on-surface/50">
            Encode and decode Base64 strings with full UTF-8 support. Runs entirely in your browser.
          </p>
        </div>

        {/* Tool UI */}
        <div>
          {/* Mode toggle + actions */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex rounded-cyber overflow-hidden" style={{ border: '1px solid rgba(72, 69, 83, 0.3)' }}>
              <button
                onClick={() => handleModeChange('encode')}
                className={`px-5 py-2.5 text-sm font-body font-medium tracking-wide transition-all duration-200 ${encodeActive ? 'bg-primary text-on-primary' : 'text-on-surface/60 hover:text-on-surface'}`}
              >
                Encode
              </button>
              <button
                onClick={() => handleModeChange('decode')}
                className={`px-5 py-2.5 text-sm font-body font-medium tracking-wide transition-all duration-200 ${!encodeActive ? 'bg-primary text-on-primary' : 'text-on-surface/60 hover:text-on-surface'}`}
              >
                Decode
              </button>
            </div>
            <button onClick={handleCopy} className="btn-ghost text-sm px-5 py-2.5">{copyLabel}</button>
            <button onClick={handleClear} className="btn-ghost text-sm px-5 py-2.5">Clear</button>
            <div className="ml-auto flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-on-surface/30">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                UTF-8
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Input */}
            <div>
              <label htmlFor="b64-input" className="block text-xs font-mono text-on-surface/40 mb-2 uppercase tracking-wider">
                {encodeActive ? 'Text Input' : 'Base64 Input'}
              </label>
              <textarea
                id="b64-input"
                className="form-input font-mono text-sm h-64 resize-y"
                placeholder={encodeActive ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                spellCheck={false}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono text-on-surface/40 uppercase tracking-wider">
                  {encodeActive ? 'Base64 Output' : 'Text Output'}
                </label>
                {charCount && (
                  <span className="text-xs font-mono text-on-surface/30">{charCount}</span>
                )}
              </div>
              <textarea
                className="form-input font-mono text-sm h-64 resize-y"
                readOnly
                placeholder="Result will appear here..."
                value={output}
              />
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
                  <p className="text-red-400 font-mono text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How to use */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold mb-4">How to Use</h2>
          <div className="text-on-surface/60 space-y-4 text-sm leading-relaxed">
            <p>Base64 encoding converts binary data into an ASCII string format using a set of 64 characters. It is commonly used to embed binary data in text-based formats like JSON, HTML, or email.</p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li><strong className="text-on-surface/80">Encode</strong> — Select the Encode mode, paste or type your text, and the Base64 encoded result appears instantly.</li>
              <li><strong className="text-on-surface/80">Decode</strong> — Switch to Decode mode, paste a Base64 string, and see the decoded text output.</li>
              <li><strong className="text-on-surface/80">Copy Result</strong> — Copies the output to your clipboard with one click.</li>
            </ol>
            <p>This tool handles UTF-8 text correctly, including multi-byte characters like emojis and non-Latin scripts. All processing runs client-side in your browser.</p>
          </div>
        </section>

        {/* Related tools */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="tag hover:text-primary">JSON Formatter</Link>
            <Link href="/tools/jwt-decoder" className="tag hover:text-secondary">JWT Decoder</Link>
            <Link href="/tools/color-converter" className="tag hover:text-tertiary">Color Converter</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
