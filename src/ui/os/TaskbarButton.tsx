import { useLayoutEffect, useRef } from 'react';
import { Pressable } from '../feel/Pressable.tsx';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { t } from '../strings/i18n.ts';
import { toStageRect, useStageGeometry } from '../theme/stageScale.ts';
import { appInfo, type AppId } from './apps.ts';
import styles from './Taskbar.module.css';
import { focusedApp, useWindows } from './windowStore.ts';

/** One button per open window: focus, minimize or restore it. */
export function TaskbarButton({ app }: { app: AppId }) {
  const slot = useRef<HTMLSpanElement>(null);
  const geometry = useStageGeometry();
  const phase = useWindows((state) => state.windows.find((w) => w.app === app)?.phase);
  const focused = useWindows((state) => focusedApp(state.windows) === app);

  // Remember where this button is, so the window can fold into it.
  useLayoutEffect(() => {
    if (slot.current)
      useWindows.getState().setTaskbarRect(app, toStageRect(slot.current, geometry));
  });

  const onPress = () => {
    const store = useWindows.getState();
    if (phase === 'minimized') store.restore(app);
    else if (focused) store.minimize(app);
    else store.focus(app);
  };

  return (
    <span ref={slot} className={styles.taskSlot}>
      <Pressable className={styles.task} pressEffect="none" toggled={focused} onPress={onPress}>
        <PixelIcon name={appInfo[app].icon} size="sm" className={styles.taskIcon} />
        <span className={styles.taskLabel}>{t(appInfo[app].title)}</span>
      </Pressable>
    </span>
  );
}
