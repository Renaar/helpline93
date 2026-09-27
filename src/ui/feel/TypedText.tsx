import { useEffect, useEffectEvent, useState } from 'react';
import { useSettings } from '../settings/settingsStore.ts';
import { feelConfig } from './feel.config.ts';
import styles from './TypedText.module.css';

export interface TypedTextProps {
  text: string;
  /** Characters per second; defaults to feel.config. */
  charsPerSecond?: number;
  /** Show the whole text at once (skip). */
  instant?: boolean;
  onDone?: () => void;
  className?: string | undefined;
}

/** Text that types itself with an irregular, human rhythm, then hides its caret. */
export function TypedText({
  text,
  charsPerSecond = feelConfig.typing.charsPerSecond,
  instant = false,
  onDone,
  className,
}: TypedTextProps) {
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const skip = instant || reducedMotion;
  // Progress is stored with the text it belongs to, so a new text starts from zero.
  const [progress, setProgress] = useState({ text, count: 0 });
  const count = skip ? text.length : progress.text === text ? progress.count : 0;
  const notifyDone = useEffectEvent(() => {
    onDone?.();
  });

  useEffect(() => {
    if (skip) {
      notifyDone();
      return;
    }
    let index = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      index += 1;
      setProgress({ text, count: index });
      if (index >= text.length) {
        notifyDone();
        return;
      }
      const base = 1000 / charsPerSecond;
      const jitter = 1 + (Math.random() * 2 - 1) * feelConfig.typing.jitter;
      timer = setTimeout(step, base * jitter);
    };
    timer = setTimeout(step, 1000 / charsPerSecond);
    return () => {
      clearTimeout(timer);
    };
  }, [text, charsPerSecond, skip]);

  const typing = count < text.length;
  return (
    <span className={className}>
      {text.slice(0, count)}
      {typing && <span className={styles.caret} aria-hidden="true" />}
    </span>
  );
}
