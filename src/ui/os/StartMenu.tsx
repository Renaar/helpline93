import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useBoot } from '../boot/bootStore.ts';
import { audio } from '../feel/audio.ts';
import { feelConfig } from '../feel/feel.config.ts';
import { Pressable } from '../feel/Pressable.tsx';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { useSettings } from '../settings/settingsStore.ts';
import { t } from '../strings/i18n.ts';
import { toStageRect, useStageGeometry } from '../theme/stageScale.ts';
import { APP_IDS, appInfo, type AppId } from './apps.ts';
import { useShell } from './shellStore.ts';
import styles from './StartMenu.module.css';
import { useWindows } from './windowStore.ts';

function StartMenuItem({ app }: { app: AppId }) {
  const slot = useRef<HTMLDivElement>(null);
  const geometry = useStageGeometry();
  return (
    <div ref={slot}>
      <Pressable
        className={styles.item}
        pressEffect="none"
        onPress={() => {
          const from = slot.current ? toStageRect(slot.current, geometry) : null;
          useShell.getState().closeStartMenu();
          useWindows.getState().open(app, from);
        }}
      >
        <PixelIcon name={appInfo[app].icon} size="sm" />
        <span>{t(appInfo[app].title)}</span>
      </Pressable>
    </div>
  );
}

/** Start menu: every application, then "shut down". Closes on outside click and Escape. */
export function StartMenu() {
  const open = useShell((state) => state.startMenuOpen);
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    audio.play('menu.open');
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      if (panel.current?.contains(target) || target.closest('[data-start-button]')) return;
      useShell.getState().closeStartMenu();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') useShell.getState().closeStartMenu();
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const transition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, ...feelConfig.menu.spring };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          className={styles.menu}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={transition}
        >
          <div className={styles.brand} aria-hidden="true">
            <span className={styles.brandText}>{t('os.brand')}</span>
          </div>
          <nav className={styles.items}>
            {APP_IDS.map((app) => (
              <StartMenuItem key={app} app={app} />
            ))}
            <hr className={styles.separator} />
            <Pressable
              className={styles.item}
              pressEffect="none"
              onPress={() => {
                useShell.getState().closeStartMenu();
                useBoot.getState().setPhase('off');
              }}
            >
              <PixelIcon name="power" size="sm" />
              <span>{t('os.shutdown')}</span>
            </Pressable>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
