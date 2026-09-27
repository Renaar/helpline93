import { useEngineState } from '../engine/hooks.ts';
import { Button95 } from '../feel/Button95.tsx';
import { formatClock, formatPhoneNumber } from '../strings/format.ts';
import { formatNumber, t } from '../strings/i18n.ts';
import styles from './apps.module.css';
import { currentCallLine } from './currentCall.ts';
import { EmptyState } from './EmptyState.tsx';
import helpdeskStyles from './HelpDeskApp.module.css';

/** Ticketing (GDD 4.3). J1: the ticket of the current call; fields and closure arrive in J2. */
export function HelpDeskApp() {
  const line = useEngineState(currentCallLine);
  const call = line?.call;
  if (!line || !call) {
    return (
      <EmptyState
        icon="helpdesk"
        title={t('apps.helpdesk.empty')}
        hint={t('apps.helpdesk.emptyHint')}
      />
    );
  }
  const ticketNumber = formatNumber(Number(call.id.replace(/\D/g, '')), {
    minimumIntegerDigits: 4,
    useGrouping: false,
  });
  const unknown = t('apps.helpdesk.unknown');
  const fields: [string, string][] = [
    [t('apps.helpdesk.fields.opened'), formatClock(call.answeredAt ?? call.ringingSince)],
    [t('apps.helpdesk.fields.line'), t('apps.phone.lineCode', { line: line.id })],
    [t('apps.helpdesk.fields.caller'), formatPhoneNumber(call.number)],
    [t('apps.helpdesk.fields.product'), unknown],
    [t('apps.helpdesk.fields.symptoms'), unknown],
  ];

  return (
    <div className={styles.app}>
      <div className={styles.toolbar}>
        <strong className={styles.mono}>
          {t('apps.helpdesk.ticket', { number: ticketNumber })}
        </strong>
        <span className={helpdeskStyles.spacer} />
        <Button95 disabled>{t('apps.helpdesk.close')}</Button95>
      </div>
      <dl className={`${styles.pane} ${styles.padded} ${helpdeskStyles.fields}`}>
        {fields.map(([label, value]) => (
          <div key={label} className={helpdeskStyles.field}>
            <dt>{label}</dt>
            <dd className={styles.mono}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
