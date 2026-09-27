import { Pressable } from '../feel/Pressable.tsx';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { t } from '../strings/i18n.ts';
import { useShell } from './shellStore.ts';
import styles from './Taskbar.module.css';
import { TaskbarButton } from './TaskbarButton.tsx';
import { Tray } from './Tray.tsx';
import { useWindows } from './windowStore.ts';

export function Taskbar() {
  const taskOrder = useWindows((state) => state.taskOrder);
  const startMenuOpen = useShell((state) => state.startMenuOpen);
  return (
    <footer className={styles.taskbar} aria-label={t('os.taskbar')}>
      <span data-start-button>
        <Pressable
          className={styles.start}
          pressEffect="none"
          toggled={startMenuOpen}
          pressSound="ui.press"
          onPress={() => {
            useShell.getState().toggleStartMenu();
          }}
        >
          <PixelIcon name="start" size="sm" />
          <span>{t('os.start')}</span>
        </Pressable>
      </span>
      <div className={styles.tasks}>
        {taskOrder.map((app) => (
          <TaskbarButton key={app} app={app} />
        ))}
      </div>
      <Tray />
    </footer>
  );
}
