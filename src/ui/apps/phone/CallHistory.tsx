import type { CallRecord } from '../../../engine/phone.ts';
import { formatClock, formatPhoneNumber } from '../../strings/format.ts';
import { t } from '../../strings/i18n.ts';
import styles from './PhoneApp.module.css';
import appStyles from '../apps.module.css';

export function CallHistory({ history }: { history: readonly CallRecord[] }) {
  return (
    <section className={styles.history}>
      <h3 className={appStyles.caption}>{t('apps.phone.history')}</h3>
      <div className={appStyles.pane}>
        {history.length === 0 ? (
          <p className={styles.historyEmpty}>{t('apps.phone.historyEmpty')}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('apps.phone.columns.time')}</th>
                <th>{t('apps.phone.columns.line')}</th>
                <th>{t('apps.phone.columns.number')}</th>
                <th>{t('apps.phone.columns.duration')}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => {
                const minutes = record.endedAt - (record.answeredAt ?? record.endedAt);
                return (
                  <tr key={record.callId}>
                    <td>{formatClock(record.answeredAt ?? record.ringingSince)}</td>
                    <td>{t('apps.phone.lineCode', { line: record.line })}</td>
                    <td>{formatPhoneNumber(record.number)}</td>
                    <td>{t('apps.phone.duration', { count: minutes })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
