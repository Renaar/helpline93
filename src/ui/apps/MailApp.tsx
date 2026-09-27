import { t } from '../strings/i18n.ts';
import styles from './apps.module.css';
import { EmptyState } from './EmptyState.tsx';

/** Mail (GDD 4.5). J1: empty inbox; e-mails arrive with the night planner in J3. */
export function MailApp() {
  return (
    <div className={styles.app}>
      <div className={styles.toolbar}>
        <span className={styles.caption}>{t('apps.mail.inbox')}</span>
      </div>
      <div className={styles.pane}>
        <EmptyState icon="mail" title={t('apps.mail.empty')} />
      </div>
    </div>
  );
}
