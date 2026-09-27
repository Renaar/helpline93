import { AppContent } from '../apps/AppContent.tsx';
import { Window95 } from '../feel/Window95.tsx';
import { t } from '../strings/i18n.ts';
import { appInfo } from './apps.ts';
import { focusedApp, useWindows } from './windowStore.ts';

/** Every open window, stacked in order. */
export function WindowLayer() {
  const windows = useWindows((state) => state.windows);
  const taskbarRects = useWindows((state) => state.taskbarRects);
  const { focus, minimize, close, closed, move } = useWindows.getState();
  const focused = focusedApp(windows);

  return (
    <>
      {windows.map((entry, index) => (
        <Window95
          key={entry.app}
          title={t(appInfo[entry.app].title)}
          icon={appInfo[entry.app].icon}
          rect={entry.rect}
          active={entry.app === focused}
          zIndex={index + 1}
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
        >
          <AppContent app={entry.app} />
        </Window95>
      ))}
    </>
  );
}
