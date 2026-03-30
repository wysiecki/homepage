'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration Time',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
};

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  const decoded = atob(base64);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

function formatDelta(ms: number): string {
  const abs = Math.abs(ms);
  const seconds = Math.floor(abs / 1000) % 60;
  const minutes = Math.floor(abs / 60000) % 60;
  const hours = Math.floor(abs / 3600000) % 24;
  const days = Math.floor(abs / 86400000);
  const parts: string[] = [];
  if (days > 0) parts.push(days + 'd');
  if (hours > 0) parts.push(hours + 'h');
  if (minutes > 0) parts.push(minutes + 'm');
  parts.push(seconds + 's');
  return parts.join(' ');
}

interface TokenStatus {
  color: string;
  text: string;
  textColor: string;
  countdown: string;
}

interface ClaimRow {
  key: string;
  value: string;
  description: string;
}

export function JwtDecoder() {
  const t = useTranslations('Tools');
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TokenStatus | null>(null);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [copyLabels, setCopyLabels] = useState<Record<string, string>>({ header: 'Copy', payload: 'Copy', signature: 'Copy' });
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const payloadDataRef = useRef<Record<string, unknown> | null>(null);

  const clearOutput = useCallback(() => {
    setHeader('');
    setPayload('');
    setSignature('');
    setStatus(null);
    setClaims([]);
    setError(null);
    clearInterval(countdownRef.current);
  }, []);

  const updateStatus = useCallback((payloadObj: Record<string, unknown>) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = payloadObj.exp as number | undefined;
    const nbf = payloadObj.nbf as number | undefined;

    if (!exp && !nbf) {
      setStatus(null);
      return;
    }

    clearInterval(countdownRef.current);

    if (nbf && now < nbf) {
      setStatus({
        color: 'bg-yellow-400',
        text: 'Not yet valid — becomes valid ' + formatTimestamp(nbf),
        textColor: 'text-yellow-400',
        countdown: 'in ' + formatDelta((nbf - now) * 1000),
      });
    } else if (exp && now >= exp) {
      setStatus({
        color: 'bg-red-400',
        text: 'Expired — ' + formatTimestamp(exp),
        textColor: 'text-red-400',
        countdown: formatDelta((now - exp) * 1000) + ' ago',
      });
    } else if (exp) {
      setStatus({
        color: 'bg-green-400',
        text: 'Valid — expires ' + formatTimestamp(exp),
        textColor: 'text-green-400',
        countdown: 'in ' + formatDelta((exp - now) * 1000),
      });

      countdownRef.current = setInterval(() => {
        const n = Math.floor(Date.now() / 1000);
        if (n >= exp) {
          setStatus({
            color: 'bg-red-400',
            text: 'Expired — ' + formatTimestamp(exp),
            textColor: 'text-red-400',
            countdown: 'just now',
          });
          clearInterval(countdownRef.current);
        } else {
          setStatus((prev) =>
            prev ? { ...prev, countdown: 'in ' + formatDelta((exp - n) * 1000) } : null
          );
        }
      }, 1000);
    }
  }, []);

  const buildClaimsTable = useCallback((payloadObj: Record<string, unknown>) => {
    const knownClaims = Object.keys(CLAIM_DESCRIPTIONS);
    const found = knownClaims.filter((k) => payloadObj[k] !== undefined);

    if (found.length === 0) {
      setClaims([]);
      return;
    }

    setClaims(
      found.map((key) => {
        const val = payloadObj[key];
        let displayVal: string;
        if (['exp', 'nbf', 'iat'].includes(key) && typeof val === 'number') {
          displayVal = formatTimestamp(val) + ' (' + val + ')';
        } else if (typeof val === 'object') {
          displayVal = JSON.stringify(val);
        } else {
          displayVal = String(val);
        }
        return { key, value: displayVal, description: CLAIM_DESCRIPTIONS[key] };
      })
    );
  }, []);

  const decode = useCallback((token: string) => {
    if (!token.trim()) {
      clearOutput();
      return;
    }

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      setError(`Invalid JWT format. Expected 3 parts separated by dots (header.payload.signature), got ${parts.length}.`);
      setHeader('');
      setPayload('');
      setSignature('');
      setStatus(null);
      setClaims([]);
      return;
    }

    setError(null);

    let headerObj: Record<string, unknown>;
    try {
      const headerJson = base64urlDecode(parts[0]);
      headerObj = JSON.parse(headerJson);
      setHeader(JSON.stringify(headerObj, null, 2));
    } catch (e) {
      setError('Failed to decode header: ' + (e as Error).message);
      return;
    }

    let payloadObj: Record<string, unknown>;
    try {
      const payloadJson = base64urlDecode(parts[1]);
      payloadObj = JSON.parse(payloadJson);
      setPayload(JSON.stringify(payloadObj, null, 2));
      payloadDataRef.current = payloadObj;
    } catch (e) {
      setError('Failed to decode payload: ' + (e as Error).message);
      return;
    }

    setSignature(parts[2]);
    updateStatus(payloadObj);
    buildClaimsTable(payloadObj);
  }, [clearOutput, updateStatus, buildClaimsTable]);

  useEffect(() => {
    return () => clearInterval(countdownRef.current);
  }, []);

  const handleCopy = useCallback((section: string) => {
    let text = '';
    if (section === 'header') text = header;
    else if (section === 'payload') text = payload;
    else if (section === 'signature') text = signature;

    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      setCopyLabels((prev) => ({ ...prev, [section]: 'Copied!' }));
      setTimeout(() => {
        setCopyLabels((prev) => ({ ...prev, [section]: 'Copy' }));
      }, 1500);
    });
  }, [header, payload, signature]);

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
            <li className="text-primary">{t('jwtDecoder.title')}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading mb-2">{t('jwtDecoder.title')}</h1>
          <p className="text-on-surface/50">
            Paste a JSON Web Token to decode and inspect its header, payload, and signature. Everything runs client-side.
          </p>
        </div>

        {/* Tool UI */}
        <div className="space-y-6">
          {/* Input */}
          <div className="card p-6">
            <label htmlFor="jwt-input" className="block font-display text-sm font-semibold mb-2">
              JWT Token
            </label>
            <textarea
              id="jwt-input"
              className="form-input w-full h-32 font-mono text-sm resize-y"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              spellCheck={false}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                decode(e.target.value);
              }}
            />
          </div>

          {/* Token Status */}
          {status && (
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <span className={`flex-shrink-0 w-3 h-3 rounded-full ${status.color}`} />
                <span className={`font-mono text-sm ${status.textColor}`}>{status.text}</span>
                <span className="ml-auto font-mono text-xs text-on-surface/40">{status.countdown}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="card p-4 border border-red-500/30">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Decoded sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Header */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-sm font-semibold text-primary">Header</h2>
                <button onClick={() => handleCopy('header')} className="btn-ghost text-xs py-1 px-3">{copyLabels.header}</button>
              </div>
              <pre className="font-mono text-sm text-on-surface/70 whitespace-pre-wrap break-all min-h-[4rem] bg-surface-base/50 rounded-cyber p-3">
                {header}
              </pre>
            </div>

            {/* Payload */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-sm font-semibold text-secondary">Payload</h2>
                <button onClick={() => handleCopy('payload')} className="btn-ghost text-xs py-1 px-3">{copyLabels.payload}</button>
              </div>
              <pre className="font-mono text-sm text-on-surface/70 whitespace-pre-wrap break-all min-h-[4rem] bg-surface-base/50 rounded-cyber p-3">
                {payload}
              </pre>
            </div>
          </div>

          {/* Signature */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold text-tertiary">Signature</h2>
              <button onClick={() => handleCopy('signature')} className="btn-ghost text-xs py-1 px-3">{copyLabels.signature}</button>
            </div>
            <pre className="font-mono text-sm text-on-surface/70 whitespace-pre-wrap break-all bg-surface-base/50 rounded-cyber p-3">
              {signature}
            </pre>
          </div>

          {/* Claims Table */}
          {claims.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display text-sm font-semibold mb-3">Registered Claims</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-on-surface/40 border-b border-on-surface/10">
                      <th className="pb-2 pr-4 font-mono">Claim</th>
                      <th className="pb-2 pr-4">Value</th>
                      <th className="pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {claims.map((claim) => (
                      <tr key={claim.key} className="border-b border-on-surface/5">
                        <td className="py-2 pr-4 text-primary/80">{claim.key}</td>
                        <td className="py-2 pr-4 text-on-surface/70 break-all">{claim.value}</td>
                        <td className="py-2 text-on-surface/40">{claim.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* How to use */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold mb-4">How to Use</h2>
          <div className="text-on-surface/60 space-y-3 text-sm leading-relaxed">
            <p><strong className="text-on-surface/80">1. Paste your JWT token</strong> into the input field above. The decoder accepts tokens in the standard <code className="font-mono text-primary/80">header.payload.signature</code> format.</p>
            <p><strong className="text-on-surface/80">2. Inspect the decoded output.</strong> The header shows the algorithm and token type. The payload contains claims like issuer, subject, audience, and expiration.</p>
            <p><strong className="text-on-surface/80">3. Check token validity.</strong> If the token has an <code className="font-mono text-primary/80">exp</code> claim, the decoder shows whether it is expired, valid, or not yet valid. Timestamps are converted to human-readable dates.</p>
            <p><strong className="text-on-surface/80">4. Copy individual sections</strong> using the Copy buttons next to each decoded section.</p>
            <p className="text-on-surface/40 text-xs">This tool does not verify JWT signatures — it only decodes the Base64url-encoded content. No data leaves your browser.</p>
          </div>
        </section>

        {/* Related tools */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="tag">JSON Formatter</Link>
            <Link href="/tools/base64" className="tag">Base64 Encoder</Link>
            <Link href="/tools/regex-tester" className="tag">Regex Tester</Link>
            <Link href="/tools/color-converter" className="tag">Color Converter</Link>
            <Link href="/tools/cron-explainer" className="tag">Cron Explainer</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
