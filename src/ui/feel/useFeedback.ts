import { useAnimate } from 'motion/react';
import { useCallback, useMemo } from 'react';
import type { SoundId } from '../../audio/soundDefinitions.ts';
import { useSettings } from '../settings/settingsStore.ts';
import { audio } from './audio.ts';
import { feelConfig, ms } from './feel.config.ts';

export interface Feedback<T extends HTMLElement> {
  /** Attach to the element that should move (sink, shake). */
  scope: ReturnType<typeof useAnimate<T>>[0];
  play: (id: SoundId) => void;
  /** Shrinks (true) or pops back (false) the element with a spring. Interruptible. */
  sink: (down: boolean) => void;
  /** Refusal: dull sound + small horizontal shake. */
  deny: () => void;
}

/** Combines sound + animation feedback for one element (GDD 8.3). */
export function useFeedback<T extends HTMLElement = HTMLElement>(): Feedback<T> {
  const [scope, animate] = useAnimate<T>();
  const reducedMotion = useSettings((state) => state.reducedMotion);

  const play = useCallback((id: SoundId) => {
    audio.play(id);
  }, []);

  const sink = useCallback(
    (down: boolean) => {
      // The scope is empty until the element is mounted.
      const element = scope.current as T | null;
      if (!element) return;
      const { sinkScale, sinkSpring, releaseSpring } = feelConfig.press;
      const target = { scale: down ? sinkScale : 1 };
      if (reducedMotion) void animate(element, target, { duration: 0 });
      else
        void animate(element, target, { type: 'spring', ...(down ? sinkSpring : releaseSpring) });
    },
    [animate, scope, reducedMotion],
  );

  const deny = useCallback(() => {
    audio.play('ui.deny');
    const element = scope.current as T | null;
    if (!element) return;
    const { shakeOffsets, durationMs, reducedAmplitude } = feelConfig.deny;
    const amplitude = reducedMotion ? reducedAmplitude : 1;
    void animate(
      element,
      { x: shakeOffsets.map((offset) => offset * amplitude) },
      { duration: ms(durationMs), ease: 'easeOut' },
    );
  }, [animate, scope, reducedMotion]);

  return useMemo(() => ({ scope, play, sink, deny }), [scope, play, sink, deny]);
}
