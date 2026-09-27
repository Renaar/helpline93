import { Button95 } from '../feel/Button95.tsx';
import { engine } from '../engine/runtime.ts';
import { useEngineState } from '../engine/hooks.ts';
import { formatClock } from '../strings/format.ts';
import { t } from '../strings/i18n.ts';
import styles from './DebugPanel.module.css';

/** `?debug`: out-of-fiction tools for testing, never shown to players. */
export function DebugPanel() {
  const minute = useEngineState((state) => state.shift.minute);
  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>{t('debug.title')}</h2>
      <Button95
        onPress={() => {
          engine.dispatch({ type: 'DEBUG_INCOMING_CALL' });
        }}
      >
        {t('debug.incomingCall')}
      </Button95>
      <Button95
        onPress={() => {
          engine.dispatch({ type: 'DEBUG_INCOMING_CALL', callType: 'urgent' });
        }}
      >
        {t('debug.urgentCall')}
      </Button95>
      <p className={styles.info}>{t('debug.minute', { minute: formatClock(minute) })}</p>
    </aside>
  );
}
