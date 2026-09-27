import { useEffect } from 'react';
import { audio } from '../feel/audio.ts';
import { feelConfig } from '../feel/feel.config.ts';
import { useEngineEvent, useEngineState } from '../engine/hooks.ts';
import { callApps, callLayout } from './apps.ts';
import { useWindows } from './windowStore.ts';

/**
 * Stages phone events (no visuals of its own): the ringing loop, handset sounds, and the
 * automatic window layout when a call is answered (GDD 5.4).
 */
export function CallStaging() {
  const ringing = useEngineState((state) => state.phone).lines.some((l) => l.status === 'ringing');

  useEffect(() => {
    if (!ringing) return;
    audio.play('phone.ring');
    const timer = setInterval(() => {
      audio.play('phone.ring');
    }, feelConfig.phone.ringIntervalMs);
    return () => {
      clearInterval(timer);
    };
  }, [ringing]);

  useEngineEvent('call.answered', () => {
    useWindows.getState().arrange(callLayout, callApps);
  });
  useEngineEvent('call.held', () => {
    audio.play('phone.hold');
  });
  useEngineEvent('call.resumed', (event) => {
    if (event.payload.held !== null) audio.play('phone.hold');
  });
  useEngineEvent('call.ended', () => {
    audio.play('phone.hangup');
  });

  return null;
}
