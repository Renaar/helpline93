import { useEffect } from 'react';
import { audio } from '../feel/audio.ts';
import { feelConfig } from '../feel/feel.config.ts';
import { useEngineEvent, useEngineState } from '../engine/hooks.ts';
import { callApps, callLayout, recapLayout } from './apps.ts';
import { useWindows } from './windowStore.ts';

/**
 * Stages phone events (no visuals of its own): the ringing loop, handset sounds, and the
 * automatic window layouts (GDD 5.4): chat + manual + Notebook when a call is answered (the
 * Phone window gives way to the taskbar call widget), the ticket as a recap when it ends.
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
    const windows = useWindows.getState();
    windows.close('phone');
    windows.arrange(callLayout, callApps);
  });
  useEngineEvent('dialogue.ended', () => {
    const windows = useWindows.getState();
    windows.arrange(recapLayout, ['helpdesk']);
    if (windows.windows.some((w) => w.app === 'helpdesk')) windows.focus('helpdesk');
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
