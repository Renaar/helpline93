import { AnimatePresence, motion } from 'motion/react';
import { Button95 } from '../feel/Button95.tsx';
import { feelConfig } from '../feel/feel.config.ts';
import { Pressable } from '../feel/Pressable.tsx';
import { engine } from '../engine/runtime.ts';
import { useEngineState } from '../engine/hooks.ts';
import { Glyph } from '../icons/Glyph.tsx';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { Lamp } from './Lamp.tsx';
import { useSettings } from '../settings/settingsStore.ts';
import { formatClock, formatPhoneNumber } from '../strings/format.ts';
import { t } from '../strings/i18n.ts';
import styles from './IncomingCall.module.css';
import { useShell } from './shellStore.ts';
import { useWindows } from './windowStore.ts';

/**
 * "Incoming call — Line 2": slides in from the bottom-right corner (GDD 5.4).
 * Not shown while the Phone window is on screen: its blinking line and "Answer" button already
 * say it, and the notification would cover them.
 */
export function IncomingCall() {
  const phone = useEngineState((state) => state.phone);
  const hiddenCallId = useShell((state) => state.hiddenCallId);
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const phoneOnScreen = useWindows((state) =>
    state.windows.some((w) => w.app === 'phone' && w.phase === 'open'),
  );
  const line = phoneOnScreen
    ? undefined
    : phone.lines.find((l) => l.status === 'ringing' && l.call?.id !== hiddenCallId);
  const call = line?.call;

  const transition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, ...feelConfig.phone.toastSpring };

  return (
    <AnimatePresence>
      {line && call && (
        <motion.section
          key={call.id}
          className={styles.toast}
          data-urgent={call.type === 'urgent' || undefined}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={transition}
        >
          <header className={styles.titlebar}>
            <Lamp mode="blink" tone={call.type === 'urgent' ? 'alert' : 'highlight'} />
            <h2 className={styles.title}>
              {t(call.type === 'urgent' ? 'apps.incoming.urgentTitle' : 'apps.incoming.title', {
                line: line.id,
              })}
            </h2>
            <Pressable
              className={styles.hide}
              label={t('apps.incoming.hide')}
              pressEffect="none"
              onPress={() => {
                useShell.getState().hideCall(call.id);
              }}
            >
              <Glyph name="close" />
            </Pressable>
          </header>
          <div className={styles.body}>
            <PixelIcon name="incoming-call" size="lg" />
            <dl className={styles.details}>
              <dt>{t('apps.incoming.number')}</dt>
              <dd className={styles.mono}>{formatPhoneNumber(call.number)}</dd>
              <dt>{t('apps.incoming.time')}</dt>
              <dd className={styles.mono}>{formatClock(call.ringingSince)}</dd>
            </dl>
          </div>
          <p className={styles.note}>{t('apps.incoming.transferred')}</p>
          <div className={styles.actions}>
            <Button95
              variant="primary"
              pressSound="phone.pickup"
              releaseSound="ui.release"
              onPress={() => {
                engine.dispatch({ type: 'ANSWER_CALL', line: line.id });
              }}
            >
              {t('apps.incoming.answer')}
            </Button95>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
