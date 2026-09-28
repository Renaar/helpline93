import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { Line } from '../../engine/phone.ts';
import { currentCallLine } from '../apps/currentCall.ts';
import { useEngineState } from '../engine/hooks.ts';
import { engine } from '../engine/runtime.ts';
import { Button95 } from '../feel/Button95.tsx';
import { feelConfig } from '../feel/feel.config.ts';
import { useSettings } from '../settings/settingsStore.ts';
import { formatDuration, formatPhoneNumber } from '../strings/format.ts';
import { t } from '../strings/i18n.ts';
import styles from './CallWidget.module.css';
import { Lamp } from './Lamp.tsx';

function Duration({ since }: { since: number }) {
  const [now, setNow] = useState(() => engine.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(engine.now());
    }, feelConfig.phone.widgetTickMs);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return <span className={styles.duration}>{formatDuration(now - since)}</span>;
}

function Widget({ line }: { line: Line }) {
  const call = line.call;
  if (!call) return null;
  const held = line.status === 'held';
  const dispatch = (type: 'HOLD_CALL' | 'RESUME_CALL' | 'HANG_UP') => () => {
    engine.dispatch({ type, line: line.id });
  };
  return (
    <>
      <Lamp mode={held ? 'slow' : 'on'} tone={call.type === 'urgent' ? 'alert' : 'highlight'} />
      <span className={styles.line}>{t('apps.phone.lineCode', { line: line.id })}</span>
      <span className={styles.number}>{formatPhoneNumber(call.number)}</span>
      {call.answeredAtMs !== null && <Duration key={call.id} since={call.answeredAtMs} />}
      {held ? (
        <Button95 onPress={dispatch('RESUME_CALL')}>{t('apps.phone.resume')}</Button95>
      ) : (
        <Button95 onPress={dispatch('HOLD_CALL')}>{t('apps.phone.hold')}</Button95>
      )}
      <Button95 onPress={dispatch('HANG_UP')}>{t('apps.phone.hangUp')}</Button95>
    </>
  );
}

/**
 * The call in progress, docked in the taskbar (Loïc's J2 feedback): line, number, duration,
 * hold / resume and hang up. It replaces the Phone window while a call is going on.
 */
export function CallWidget() {
  const line = useEngineState(currentCallLine);
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const transition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, ...feelConfig.phone.widgetSpring };
  return (
    <AnimatePresence>
      {line?.call && (
        <motion.div
          key={line.call.id}
          className={styles.widget}
          role="group"
          aria-label={t('apps.phone.widget', { line: line.id })}
          data-status={line.status}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={transition}
        >
          <Widget line={line} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
