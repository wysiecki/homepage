'use client';

import { useState, useRef, useCallback, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { TurnstileWidget } from './TurnstileWidget';

const FORM_RESET_MS = 3000;

export function ContactForm() {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const tokenRef = useRef('');

  const onTurnstileVerify = useCallback((token: string) => {
    tokenRef.current = token;
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    if (!tokenRef.current) {
      setStatus('error');
      setErrorMsg(t('captcha'));
      setTimeout(() => setStatus('idle'), FORM_RESET_MS);
      return;
    }

    setStatus('sending');

    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      'cf-turnstile-response': tokenRef.current,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || 'Something went wrong.');
      }

      setStatus('sent');
      form.reset();
      tokenRef.current = '';
    } catch (err) {
      setStatus('error');
      const isNetwork = err instanceof TypeError;
      setErrorMsg(isNetwork ? t('network') : (err as Error).message || t('fallback'));
    }

    setTimeout(() => setStatus('idle'), FORM_RESET_MS);
  }

  const buttonText = {
    idle: t('send'),
    sending: t('sending'),
    sent: t('sent'),
    error: errorMsg,
  }[status];

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 card p-8 md:p-10">
      <div>
        <label
          htmlFor="name"
          className="font-mono text-xs uppercase tracking-[0.2em] text-on-surface/40 mb-2 block"
        >
          {t('name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          autoComplete="name"
          className="form-input"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="font-mono text-xs uppercase tracking-[0.2em] text-on-surface/40 mb-2 block"
        >
          {t('email')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          className="form-input"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="font-mono text-xs uppercase tracking-[0.2em] text-on-surface/40 mb-2 block"
        >
          {t('message')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="form-input resize-none"
        />
      </div>
      <TurnstileWidget onVerify={onTurnstileVerify} />
      <div className="text-center">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-primary w-full sm:w-auto"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
}
