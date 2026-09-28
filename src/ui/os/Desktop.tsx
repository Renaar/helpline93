import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect } from 'react';
import { useEngineEvent } from '../engine/hooks.ts';
import { feelConfig, ms } from '../feel/feel.config.ts';
import { FlightLayer } from '../feel/flight/FlightLayer.tsx';
import { useSettings } from '../settings/settingsStore.ts';
import { CallStaging } from './CallStaging.tsx';
import { ClockDirector } from './ClockDirector.tsx';
import { DebugPanel } from './DebugPanel.tsx';
import { DialogueStaging } from './DialogueStaging.tsx';
import { NightStaging } from './NightStaging.tsx';
import { ShiftReportDialog } from './ShiftReportDialog.tsx';
import styles from './Desktop.module.css';
import { DesktopIcons } from './DesktopIcons.tsx';
import { FastForwardOverlay } from './FastForwardOverlay.tsx';
import { IncomingCall } from './IncomingCall.tsx';
import { useShell } from './shellStore.ts';
import { StartMenu } from './StartMenu.tsx';
import { Taskbar } from './Taskbar.tsx';
import { WindowLayer } from './WindowLayer.tsx';
import { useWindows } from './windowStore.ts';

/** Debug tools: always on the development server, and with `?debug` or `?mission=` elsewhere. */
const params = new URLSearchParams(window.location.search);
const debug = import.meta.env.DEV || params.has('debug') || params.has('mission');

/** The HelplineOS desktop: icons, windows, incoming calls, start menu and taskbar. */
export function Desktop() {
  const busy = useWindows((state) => state.loading.length > 0);
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const shakeX = useMotionValue(0);
  const skewX = useMotionValue(0);

  // VHS fast-forward: the whole screen shakes horizontally during a time jump, then snaps back.
  useEngineEvent('shift.skipStarted', (event) => {
    if (reducedMotion) return;
    const transition = { duration: ms(event.payload.durationMs), ease: 'linear' as const };
    void animate(shakeX, [...feelConfig.vhs.jitterPx], transition);
    void animate(skewX, [...feelConfig.vhs.skewDeg], transition);
  });

  // Pressing the empty desktop clears the icon selection.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest('[data-desktop-icon]')) {
        useShell.getState().selectIcon(null);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return (
    <motion.main
      className={styles.desktop}
      style={{ x: shakeX, skewX }}
      data-busy={busy || undefined}
    >
      <DesktopIcons />
      <WindowLayer />
      <IncomingCall />
      <StartMenu />
      <Taskbar />
      <FlightLayer />
      <FastForwardOverlay />
      <CallStaging />
      <DialogueStaging />
      <NightStaging />
      <ShiftReportDialog />
      <ClockDirector />
      {debug && <DebugPanel />}
    </motion.main>
  );
}
