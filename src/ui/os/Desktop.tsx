import { useEffect } from 'react';
import { CallStaging } from './CallStaging.tsx';
import { ClockDirector } from './ClockDirector.tsx';
import { DebugPanel } from './DebugPanel.tsx';
import styles from './Desktop.module.css';
import { DesktopIcons } from './DesktopIcons.tsx';
import { IncomingCall } from './IncomingCall.tsx';
import { useShell } from './shellStore.ts';
import { StartMenu } from './StartMenu.tsx';
import { Taskbar } from './Taskbar.tsx';
import { WindowLayer } from './WindowLayer.tsx';
import { useWindows } from './windowStore.ts';

const debug = new URLSearchParams(window.location.search).has('debug');

/** The HelplineOS desktop: icons, windows, incoming calls, start menu and taskbar. */
export function Desktop() {
  const busy = useWindows((state) => state.loading.length > 0);

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
    <main className={styles.desktop} data-busy={busy || undefined}>
      <DesktopIcons />
      <WindowLayer />
      <IncomingCall />
      <StartMenu />
      <Taskbar />
      <CallStaging />
      <ClockDirector />
      {debug && <DebugPanel />}
    </main>
  );
}
