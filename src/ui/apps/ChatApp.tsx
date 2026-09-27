import { useEngineState } from '../engine/hooks.ts';
import { TypedText } from '../feel/TypedText.tsx';
import { formatPhoneNumber } from '../strings/format.ts';
import { t } from '../strings/i18n.ts';
import styles from './apps.module.css';
import { currentCallLine } from './currentCall.ts';
import { EmptyState } from './EmptyState.tsx';

/** Operator chat (GDD 4.2). J1: shell only; the transcript and the three verbs arrive in J2. */
export function ChatApp() {
  const line = useEngineState(currentCallLine);
  if (!line?.call) {
    return <EmptyState icon="chat" title={t('apps.chat.idle')} hint={t('apps.chat.idleHint')} />;
  }
  return (
    <div className={styles.app}>
      <div className={styles.toolbar}>
        <span className={styles.mono}>
          {t('apps.chat.connected', { line: line.id, number: formatPhoneNumber(line.call.number) })}
        </span>
      </div>
      <div className={`${styles.pane} ${styles.padded}`}>
        <TypedText key={line.call.id} className={styles.mono} text={t('apps.chat.waiting')} />
      </div>
    </div>
  );
}
