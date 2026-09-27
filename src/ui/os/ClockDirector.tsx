import { useEffect } from 'react';
import { canSkip } from '../../engine/schedule.ts';
import { useEngineEvent } from '../engine/hooks.ts';
import { engine } from '../engine/runtime.ts';
import { audio } from '../feel/audio.ts';
import { feelConfig } from '../feel/feel.config.ts';

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const;

/**
 * Stages the shift clock (GDD 2.2 / 4.1), without visuals of its own:
 * - a soft sound when a time jump starts;
 * - an automatic jump to the next event after a long inactivity, never during a call and
 *   never while the player reads, types or searches (any input resets the delay).
 */
export function ClockDirector() {
  useEngineEvent('shift.skipStarted', () => {
    audio.play('clock.skip');
  });

  useEffect(() => {
    let lastActivity = performance.now();
    const onActivity = () => {
      lastActivity = performance.now();
    };
    for (const type of ACTIVITY_EVENTS) window.addEventListener(type, onActivity, true);
    const timer = setInterval(() => {
      const idle = performance.now() - lastActivity >= feelConfig.clock.autoSkipIdleMs;
      if (!idle || !canSkip(engine.getState())) return;
      engine.dispatch({ type: 'SKIP_TO_NEXT_EVENT', durationMs: feelConfig.clock.skipDurationMs });
      lastActivity = performance.now();
    }, feelConfig.clock.idleCheckMs);
    return () => {
      clearInterval(timer);
      for (const type of ACTIVITY_EVENTS) window.removeEventListener(type, onActivity, true);
    };
  }, []);

  return null;
}
