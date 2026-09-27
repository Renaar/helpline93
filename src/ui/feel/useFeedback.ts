import { animate, useMotionValue, type MotionValue } from 'motion/react';
import { useCallback, useMemo } from 'react';
import type { SoundId } from '../../audio/soundDefinitions.ts';
import { useSettings } from '../settings/settingsStore.ts';
import { audio } from './audio.ts';
import { feelConfig, ms } from './feel.config.ts';

export interface Feedback {
  /** Spread on a `motion.*` element: the transforms driven by sink and deny. */
  motionStyle: { x: MotionValue<number>; scale: MotionValue<number> };
  play: (id: SoundId) => void;
  /** Shrinks (true) or pops back (false) the element with a spring. Interruptible. */
  sink: (down: boolean) => void;
  /** Refusal: dull sound + small horizontal shake. */
  deny: () => void;
}

/**
 * Combines sound + animation feedback for one element (GDD 8.3).
 * It animates motion values (not DOM nodes), so any `motion.*` element can wear it.
 */
export function useFeedback(): Feedback {
  const x = useMotionValue(0);
  const scale = useMotionValue(1);
  const reducedMotion = useSettings((state) => state.reducedMotion);

  const play = useCallback((id: SoundId) => {
    audio.play(id);
  }, []);

  const sink = useCallback(
    (down: boolean) => {
      const { sinkScale, sinkSpring, releaseSpring } = feelConfig.press;
      const target = down ? sinkScale : 1;
      if (reducedMotion) void animate(scale, target, { duration: 0 });
      else void animate(scale, target, { type: 'spring', ...(down ? sinkSpring : releaseSpring) });
    },
    [scale, reducedMotion],
  );

  const deny = useCallback(() => {
    audio.play('ui.deny');
    const { shakeOffsets, durationMs, reducedAmplitude } = feelConfig.deny;
    const amplitude = reducedMotion ? reducedAmplitude : 1;
    void animate(
      x,
      shakeOffsets.map((offset) => offset * amplitude),
      { duration: ms(durationMs), ease: 'easeOut' },
    );
  }, [x, reducedMotion]);

  return useMemo(
    () => ({ motionStyle: { x, scale }, play, sink, deny }),
    [x, scale, play, sink, deny],
  );
}
