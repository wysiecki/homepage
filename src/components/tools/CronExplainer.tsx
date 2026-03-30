'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'];
const FIELD_RANGES: [number, number][] = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7],
];

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function parseField(field: string, min: number, max: number): number[] {
  const values = new Set<number>();
  const parts = field.split(',');
  for (const part of parts) {
    if (part === '*') {
      for (let i = min; i <= max; i++) values.add(i);
    } else if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) throw new Error('Invalid step: ' + part);
      let start = min;
      let end = max;
      if (range !== '*') {
        if (range.includes('-')) {
          const [a, b] = range.split('-').map(Number);
          start = a;
          end = b;
        } else {
          start = parseInt(range, 10);
        }
      }
      for (let i = start; i <= end; i += step) values.add(i);
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      if (isNaN(a) || isNaN(b)) throw new Error('Invalid range: ' + part);
      for (let i = a; i <= b; i++) values.add(i);
    } else {
      const val = parseInt(part, 10);
      if (isNaN(val)) throw new Error('Invalid value: ' + part);
      values.add(val);
    }
  }
  for (const v of values) {
    if (v < min || v > max) {
      const idx = FIELD_RANGES.findIndex((r) => r[0] === min && r[1] === max);
      throw new Error(`Value ${v} out of range for ${FIELD_NAMES[idx]} (${min}-${max})`);
    }
  }
  return Array.from(values).sort((a, b) => a - b);
}

function describeField(field: string, fieldIndex: number): string {
  if (field === '*') return '';
  if (field.includes('/')) {
    const [range, step] = field.split('/');
    if (range === '*') {
      return 'every ' + step + ' ' + FIELD_NAMES[fieldIndex] + (parseInt(step) > 1 ? 's' : '');
    }
    return 'every ' + step + ' ' + FIELD_NAMES[fieldIndex] + 's from ' + range;
  }
  if (field.includes(',')) {
    const vals = field.split(',');
    if (fieldIndex === 4) return vals.map((v) => DOW_NAMES[parseInt(v)] || v).join(', ');
    if (fieldIndex === 3) return vals.map((v) => MONTH_NAMES[parseInt(v)] || v).join(', ');
    return vals.join(', ');
  }
  if (field.includes('-')) {
    const [a, b] = field.split('-');
    if (fieldIndex === 4) return (DOW_NAMES[parseInt(a)] || a) + ' through ' + (DOW_NAMES[parseInt(b)] || b);
    if (fieldIndex === 3) return (MONTH_NAMES[parseInt(a)] || a) + ' through ' + (MONTH_NAMES[parseInt(b)] || b);
    return a + ' through ' + b;
  }
  if (fieldIndex === 4) return DOW_NAMES[parseInt(field)] || field;
  if (fieldIndex === 3) return MONTH_NAMES[parseInt(field)] || field;
  return field;
}

function generateDescription(fields: string[]): string {
  const [minute, hour, dom, month, dow] = fields;
  const parts: string[] = [];

  if (minute === '*' && hour === '*') {
    parts.push('Every minute');
  } else if (minute === '*') {
    parts.push('Every minute');
    if (hour !== '*') parts.push('during hour ' + describeField(hour, 1));
  } else if (hour === '*') {
    if (minute.includes('/')) {
      const desc = describeField(minute, 0);
      parts.push(desc.charAt(0).toUpperCase() + desc.slice(1));
    } else {
      parts.push('At minute ' + describeField(minute, 0) + ' of every hour');
    }
  } else {
    const hourVal = hour.includes(',') || hour.includes('-') || hour.includes('/') ? null : parseInt(hour);
    const minVal = minute.includes(',') || minute.includes('-') || minute.includes('/') ? null : parseInt(minute);

    if (hourVal !== null && minVal !== null && !isNaN(hourVal) && !isNaN(minVal)) {
      const h = hourVal % 12 || 12;
      const ampm = hourVal < 12 ? 'AM' : 'PM';
      const m = minVal.toString().padStart(2, '0');
      parts.push('At ' + h + ':' + m + ' ' + ampm);
    } else {
      if (minute.includes('/')) {
        const desc = describeField(minute, 0);
        parts.push(desc.charAt(0).toUpperCase() + desc.slice(1));
      } else {
        parts.push('At minute ' + describeField(minute, 0));
      }
      if (hour !== '*') parts.push('past hour ' + describeField(hour, 1));
    }
  }

  if (dom !== '*') parts.push('on day ' + describeField(dom, 2) + ' of the month');
  if (month !== '*') parts.push('in ' + describeField(month, 3));
  if (dow !== '*') {
    const dowDesc = describeField(dow, 4);
    if (dom === '*') parts.push('on ' + dowDesc);
    else parts.push('and on ' + dowDesc);
  }

  return parts.join(', ') + '.';
}

function getNextRuns(fields: string[], n: number): Date[] {
  const [minuteVals, hourVals, domVals, monthVals, dowVals] = fields.map((f, i) =>
    parseField(f, FIELD_RANGES[i][0], FIELD_RANGES[i][1])
  );

  const normalizedDow = dowVals.map((d) => (d === 7 ? 0 : d));
  const dowSet = new Set(normalizedDow);
  const monthSet = new Set(monthVals);
  const domSet = new Set(domVals);
  const hourSet = new Set(hourVals);
  const minuteSet = new Set(minuteVals);

  const runs: Date[] = [];
  const candidate = new Date();
  candidate.setSeconds(0);
  candidate.setMilliseconds(0);
  candidate.setMinutes(candidate.getMinutes() + 1);

  const maxIterations = 525600;
  let iterations = 0;

  while (runs.length < n && iterations < maxIterations) {
    iterations++;
    if (
      monthSet.has(candidate.getMonth() + 1) &&
      domSet.has(candidate.getDate()) &&
      dowSet.has(candidate.getDay()) &&
      hourSet.has(candidate.getHours()) &&
      minuteSet.has(candidate.getMinutes())
    ) {
      runs.push(new Date(candidate));
    }
    candidate.setMinutes(candidate.getMinutes() + 1);
  }

  return runs;
}

function formatDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = date.getHours();
  const h12 = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${h12}:${date.getMinutes().toString().padStart(2, '0')} ${ampm}`;
}

function relativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return 'in ' + diffMin + ' min';
  if (diffHour < 24) return 'in ' + diffHour + 'h ' + (diffMin % 60) + 'm';
  if (diffDay < 7) return 'in ' + diffDay + ' day' + (diffDay > 1 ? 's' : '');
  return 'in ' + Math.floor(diffDay / 7) + ' week' + (Math.floor(diffDay / 7) > 1 ? 's' : '');
}

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Weekdays at 9 AM', value: '0 9 * * 1-5' },
  { label: 'Weekly on Sunday', value: '0 0 * * 0' },
  { label: 'Monthly on the 1st', value: '0 0 1 * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 2 hours', value: '0 */2 * * *' },
  { label: '1st and 15th at 4:30 AM', value: '30 4 1,15 * *' },
];

export function CronExplainer() {
  const t = useTranslations('Tools');
  const [cronInput, setCronInput] = useState('0 9 * * 1-5');
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [fieldValues, setFieldValues] = useState<string[]>(['0', '9', '*', '*', '1-5']);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const update = useCallback((raw: string) => {
    setError(null);
    if (!raw.trim()) {
      setDescription('Enter a cron expression above.');
      setNextRuns([]);
      setFieldValues(['', '', '', '', '']);
      return;
    }

    const fields = raw.trim().split(/\s+/);
    if (fields.length !== 5) {
      setError(`Expected 5 fields (minute hour day-of-month month day-of-week), got ${fields.length}.`);
      setDescription('');
      setNextRuns([]);
      return;
    }

    setFieldValues(fields);

    try {
      fields.forEach((f, i) => parseField(f, FIELD_RANGES[i][0], FIELD_RANGES[i][1]));
      setDescription(generateDescription(fields));
      const runs = getNextRuns(fields, 5);
      setNextRuns(runs);
    } catch (e) {
      setError((e as Error).message);
      setDescription('');
      setNextRuns([]);
    }
  }, []);

  const debouncedUpdate = useCallback((raw: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update(raw), 150);
  }, [update]);

  // Initial render
  useEffect(() => {
    update('0 9 * * 1-5');
  }, [update]);

  const handleInputChange = useCallback((value: string) => {
    setCronInput(value);
    debouncedUpdate(value);
  }, [debouncedUpdate]);

  const handlePreset = useCallback((value: string) => {
    setCronInput(value);
    update(value);
  }, [update]);

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
            <li className="text-primary">{t('cronExplainer.title')}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading mb-2">{t('cronExplainer.title')}</h1>
          <p className="text-on-surface/50">
            Parse cron expressions into human-readable descriptions with next scheduled run times.
          </p>
        </div>

        {/* Tool UI */}
        <div className="space-y-6">
          {/* Cron input */}
          <div className="card p-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-on-surface/50 mb-3">Cron Expression</label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                className="form-input font-mono flex-1 text-lg"
                placeholder="* * * * *"
                value={cronInput}
                onChange={(e) => handleInputChange(e.target.value)}
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            {/* Field labels */}
            <div className="grid grid-cols-5 gap-2 mt-4 text-center">
              {['Minute', 'Hour', 'Day (month)', 'Month', 'Day (week)'].map((label) => (
                <div key={label} className="text-[10px] font-mono text-on-surface/30 uppercase tracking-wider">{label}</div>
              ))}
            </div>

            {/* Visual field breakdown */}
            <div className="grid grid-cols-5 gap-2 mt-1">
              {fieldValues.map((f, i) => (
                <div key={i} className="text-center py-2 rounded-cyber font-mono text-sm" style={{ background: 'rgba(202, 190, 255, 0.1)' }}>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="card p-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-on-surface/50 mb-3">Common Presets</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePreset(preset.value)}
                  className="tag cursor-pointer hover:text-secondary transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-on-surface/50 mb-3">Description</label>
            <p className="text-lg text-on-surface/80 leading-relaxed">{description}</p>
          </div>

          {/* Next run times */}
          <div className="card p-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-on-surface/50 mb-3">Next 5 Scheduled Runs</label>
            <div className="space-y-2">
              {nextRuns.length === 0 && !error && (
                <p className="text-on-surface/30 text-sm italic">No upcoming runs found within the next year.</p>
              )}
              {nextRuns.map((date, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-cyber" style={{ background: 'rgba(19, 19, 19, 0.3)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-primary w-4">{i + 1}</span>
                    <span className="text-sm font-mono text-on-surface/70">{formatDate(date)}</span>
                  </div>
                  <span className="text-xs font-mono text-on-surface/30">{relativeTime(date)}</span>
                </div>
              ))}
            </div>
          </div>

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
            <p><strong className="text-on-surface/80">1. Enter an expression</strong> — Type a standard 5-field cron expression (minute, hour, day of month, month, day of week).</p>
            <p><strong className="text-on-surface/80">2. Or pick a preset</strong> — Click any preset button to fill in common schedules instantly.</p>
            <p><strong className="text-on-surface/80">3. Read the description</strong> — The tool translates the expression into plain English so you can verify it does what you expect.</p>
            <p><strong className="text-on-surface/80">4. Check run times</strong> — The next 5 scheduled runs are calculated from the current date and time.</p>
          </div>
          <div className="mt-6 card p-4">
            <p className="text-xs font-mono text-on-surface/40 mb-2">Cron field reference:</p>
            <pre className="text-xs font-mono text-on-surface/50 leading-relaxed">{`*    *    *    *    *
|    |    |    |    |
|    |    |    |    +-- Day of week  (0-7, Sun=0 or 7)
|    |    |    +------- Month        (1-12)
|    |    +------------ Day of month (1-31)
|    +----------------- Hour         (0-23)
+---------------------- Minute       (0-59)

Special characters: * (any) , (list) - (range) / (step)`}</pre>
          </div>
        </section>

        {/* Related tools */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="tag hover:text-secondary">JSON Formatter</Link>
            <Link href="/tools/regex-tester" className="tag hover:text-secondary">Regex Tester</Link>
            <Link href="/tools/base64" className="tag hover:text-secondary">Base64 Encoder</Link>
            <Link href="/tools/jwt-decoder" className="tag hover:text-secondary">JWT Decoder</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
