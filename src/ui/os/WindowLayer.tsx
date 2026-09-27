import { AppContent } from '../apps/AppContent.tsx';
import { Window95 } from '../feel/Window95.tsx';
import { t } from '../strings/i18n.ts';
import { APP_IDS, appInfo } from './apps.ts';
import { focusedApp, useWindows } from './windowStore.ts';

/**
 * Every open window. The DOM order stays fixed (by application) and only the z-index follows
 * the stacking order: moving a node in the DOM would reset its scroll positions on focus.
 */
export function WindowLayer() {
  const windows = useWindows((state) => state.windows);
  const taskbarRects = useWindows((state) => state.taskbarRects);
  const { focus, minimize, close, closed, move, resize } = useWindows.getState();
  const focused = focusedApp(windows);
  const stable = [...windows].sort((a, b) => APP_IDS.indexOf(a.app) - APP_IDS.indexOf(b.app));

  return (
    <>
      {stable.map((entry) => (
        <Window95
          key={entry.app}
          title={t(appInfo[entry.app].title)}
          icon={appInfo[entry.app].icon}
          rect={entry.rect}
          active={entry.app === focused}
          zIndex={windows.indexOf(entry) + 1}
          phase={entry.phase}
          openFrom={entry.openFrom}
          minimizeTo={taskbarRects[entry.app] ?? null}
          minimizeLabel={t('os.minimize')}
          closeLabel={t('os.close')}
          onFocus={() => {
            if (windows.at(-1)?.app !== entry.app) focus(entry.app);
          }}
          onMinimize={() => {
            minimize(entry.app);
          }}
          onClose={() => {
            close(entry.app);
          }}
          onClosed={() => {
            closed(entry.app);
          }}
          onMove={(x, y) => {
            move(entry.app, x, y);
          }}
          onResize={(rect) => {
            resize(entry.app, rect);
          }}
        >
          <AppContent app={entry.app} />
        </Window95>
      ))}
    </>
  );
}
