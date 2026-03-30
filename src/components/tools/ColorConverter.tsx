'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function rgbToHex(r: number, g: number, b: number): string {
  return [r, g, b]
    .map((v) => Math.round(v).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return null;
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  function hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function ColorConverter() {
  const t = useTranslations('Tools');
  const [hexVal, setHexVal] = useState('5BA8E0');
  const [rgb, setRgb] = useState({ r: 91, g: 168, b: 224 });
  const [hsl, setHsl] = useState({ h: 205, s: 71, l: 62 });
  const [error, setError] = useState<string | null>(null);
  const [copyLabels, setCopyLabels] = useState<Record<string, string>>({ hex: 'Copy', rgb: 'Copy', hsl: 'Copy', css: 'Copy All' });

  const getCssOutput = useCallback((r: number, g: number, b: number, h: number, s: number, l: number, hex: string) => {
    return `#${hex}\nrgb(${r}, ${g}, ${b})\nhsl(${h}, ${s}%, ${l}%)`;
  }, []);

  const handleHexChange = useCallback((raw: string) => {
    const cleaned = raw.replace(/^#/, '').trim();
    setHexVal(cleaned);
    if (!cleaned) return;

    const result = hexToRgb(cleaned);
    if (!result) {
      setError('Invalid HEX value. Use 3 or 6 hex digits (e.g. FFF or 5BA8E0).');
      return;
    }
    setError(null);
    const h = rgbToHsl(result.r, result.g, result.b);
    setRgb(result);
    setHsl(h);
  }, []);

  const handleRgbChange = useCallback((channel: 'r' | 'g' | 'b', value: string) => {
    const num = clamp(parseInt(value, 10) || 0, 0, 255);
    const newRgb = { ...rgb, [channel]: num };
    setRgb(newRgb);
    setError(null);

    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    const h = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    setHexVal(hex);
    setHsl(h);
  }, [rgb]);

  const handleHslChange = useCallback((channel: 'h' | 's' | 'l', value: string) => {
    const maxVal = channel === 'h' ? 360 : 100;
    const num = clamp(parseInt(value, 10) || 0, 0, maxVal);
    const newHsl = { ...hsl, [channel]: num };
    setHsl(newHsl);
    setError(null);

    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setRgb(newRgb);
    setHexVal(hex);
  }, [hsl]);

  const handleCopy = useCallback((format: string) => {
    let text = '';
    if (format === 'hex') text = '#' + hexVal;
    else if (format === 'rgb') text = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    else if (format === 'hsl') text = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    else if (format === 'css') text = getCssOutput(rgb.r, rgb.g, rgb.b, hsl.h, hsl.s, hsl.l, hexVal);

    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      setCopyLabels((prev) => ({ ...prev, [format]: 'Copied!' }));
      setTimeout(() => {
        const defaultLabels: Record<string, string> = { hex: 'Copy', rgb: 'Copy', hsl: 'Copy', css: 'Copy All' };
        setCopyLabels((prev) => ({ ...prev, [format]: defaultLabels[format] }));
      }, 1500);
    });
  }, [hexVal, rgb, hsl, getCssOutput]);

  const previewColor = '#' + (hexToRgb(hexVal) ? rgbToHex(rgb.r, rgb.g, rgb.b) : '000000');
  const cssOutput = getCssOutput(rgb.r, rgb.g, rgb.b, hsl.h, hsl.s, hsl.l, rgbToHex(rgb.r, rgb.g, rgb.b));

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
            <li className="text-primary">{t('colorConverter.title')}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading mb-2">{t('colorConverter.title')}</h1>
          <p className="text-on-surface/50">
            Convert between HEX, RGB, and HSL color formats. All conversions happen in real-time in your browser.
          </p>
        </div>

        {/* Tool UI */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Color Preview */}
          <div className="card p-6 md:row-span-2 flex flex-col">
            <h2 className="font-display text-sm font-semibold mb-3">Preview</h2>
            <div
              className="flex-1 min-h-[12rem] rounded-cyber border border-on-surface/10"
              style={{ backgroundColor: previewColor }}
            />
          </div>

          {/* HEX Input */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold text-primary">HEX</h2>
              <button onClick={() => handleCopy('hex')} className="btn-ghost text-xs py-1 px-3">{copyLabels.hex}</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-on-surface/40 text-sm">#</span>
              <input
                type="text"
                className="form-input flex-1 font-mono text-sm uppercase"
                value={hexVal}
                onChange={(e) => handleHexChange(e.target.value)}
                maxLength={6}
                spellCheck={false}
              />
            </div>
          </div>

          {/* RGB Input */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold text-secondary">RGB</h2>
              <button onClick={() => handleCopy('rgb')} className="btn-ghost text-xs py-1 px-3">{copyLabels.rgb}</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-mono text-xs text-on-surface/40 mb-1">R</label>
                <input type="number" className="form-input w-full font-mono text-sm" min={0} max={255} value={rgb.r} onChange={(e) => handleRgbChange('r', e.target.value)} />
              </div>
              <div>
                <label className="block font-mono text-xs text-on-surface/40 mb-1">G</label>
                <input type="number" className="form-input w-full font-mono text-sm" min={0} max={255} value={rgb.g} onChange={(e) => handleRgbChange('g', e.target.value)} />
              </div>
              <div>
                <label className="block font-mono text-xs text-on-surface/40 mb-1">B</label>
                <input type="number" className="form-input w-full font-mono text-sm" min={0} max={255} value={rgb.b} onChange={(e) => handleRgbChange('b', e.target.value)} />
              </div>
            </div>
          </div>

          {/* HSL Input */}
          <div className="card p-6 md:col-start-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold text-tertiary">HSL</h2>
              <button onClick={() => handleCopy('hsl')} className="btn-ghost text-xs py-1 px-3">{copyLabels.hsl}</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-mono text-xs text-on-surface/40 mb-1">H</label>
                <input type="number" className="form-input w-full font-mono text-sm" min={0} max={360} value={hsl.h} onChange={(e) => handleHslChange('h', e.target.value)} />
              </div>
              <div>
                <label className="block font-mono text-xs text-on-surface/40 mb-1">S%</label>
                <input type="number" className="form-input w-full font-mono text-sm" min={0} max={100} value={hsl.s} onChange={(e) => handleHslChange('s', e.target.value)} />
              </div>
              <div>
                <label className="block font-mono text-xs text-on-surface/40 mb-1">L%</label>
                <input type="number" className="form-input w-full font-mono text-sm" min={0} max={100} value={hsl.l} onChange={(e) => handleHslChange('l', e.target.value)} />
              </div>
            </div>
          </div>

          {/* CSS Output */}
          <div className="card p-6 md:col-start-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold">CSS Output</h2>
              <button onClick={() => handleCopy('css')} className="btn-ghost text-xs py-1 px-3">{copyLabels.css}</button>
            </div>
            <pre className="font-mono text-xs text-on-surface/70 whitespace-pre-wrap bg-surface-base/50 rounded-cyber p-3">
              {cssOutput}
            </pre>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card p-4 border border-red-500/30 mt-4">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </div>
        )}

        {/* How to use */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold mb-4">How to Use</h2>
          <div className="text-on-surface/60 space-y-3 text-sm leading-relaxed">
            <p><strong className="text-on-surface/80">1. Enter a color</strong> in any format — HEX, RGB, or HSL. All other fields update automatically as you type.</p>
            <p><strong className="text-on-surface/80">2. Preview the color</strong> in the large swatch on the left. The preview updates in real-time with every change.</p>
            <p><strong className="text-on-surface/80">3. Copy the CSS value</strong> you need using the Copy button on each format card, or use &quot;Copy All&quot; for all three CSS formats at once.</p>
            <p><strong className="text-on-surface/80">Supported formats:</strong> 3-digit and 6-digit HEX (e.g. <code className="font-mono text-primary/80">#FFF</code> or <code className="font-mono text-primary/80">#5BA8E0</code>), RGB values 0-255, and HSL with hue 0-360, saturation and lightness 0-100%.</p>
          </div>
        </section>

        {/* Related tools */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="tag">JSON Formatter</Link>
            <Link href="/tools/base64" className="tag">Base64 Encoder</Link>
            <Link href="/tools/regex-tester" className="tag">Regex Tester</Link>
            <Link href="/tools/jwt-decoder" className="tag">JWT Decoder</Link>
            <Link href="/tools/cron-explainer" className="tag">Cron Explainer</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
