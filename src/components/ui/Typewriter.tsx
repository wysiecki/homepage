'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const TYPE_MS = 80;
const DELETE_MS = 40;
const PAUSE_MS = 2200;
const GAP_MS = 400;

export function Typewriter({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState('');
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const tick = useCallback(() => {
    const phrase = phrases[phraseIdx.current];

    if (deleting.current) {
      charIdx.current--;
      setText(phrase.substring(0, charIdx.current));
    } else {
      charIdx.current++;
      setText(phrase.substring(0, charIdx.current));
    }

    if (!deleting.current && charIdx.current === phrase.length) {
      timeoutRef.current = setTimeout(() => {
        deleting.current = true;
        tick();
      }, PAUSE_MS);
      return;
    }

    if (deleting.current && charIdx.current === 0) {
      deleting.current = false;
      phraseIdx.current = (phraseIdx.current + 1) % phrases.length;
      timeoutRef.current = setTimeout(tick, GAP_MS);
      return;
    }

    timeoutRef.current = setTimeout(tick, deleting.current ? DELETE_MS : TYPE_MS);
  }, [phrases]);

  useEffect(() => {
    tick();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tick]);

  return (
    <span className="font-mono text-sm tracking-wide text-on-surface/50">
      <span>{text}</span>
      <span className="animate-blink text-primary">|</span>
    </span>
  );
}
