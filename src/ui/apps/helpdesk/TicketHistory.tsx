import { useEngineState } from '../../engine/hooks.ts';
import { audio } from '../../feel/audio.ts';
import { Pressable } from '../../feel/Pressable.tsx';
import { formatClock } from '../../strings/format.ts';
import { formatNumber, t } from '../../strings/i18n.ts';
import appStyles from '../apps.module.css';
import styles from './HelpDesk.module.css';
import { useHelpDesk } from './helpdeskStore.ts';

/** Every ticket of the night, newest first (GDD 4.3). */
export function TicketHistory() {
  const tickets = useEngineState((state) => state.tickets);
  return (
    <div className={appStyles.pane}>
      {tickets.length === 0 ? (
        <p className={styles.hint}>{t('apps.helpdesk.historyEmpty')}</p>
      ) : (
        <div className={styles.history} role="table">
          <div className={styles.historyHead} role="row">
            <span>{t('apps.helpdesk.columns.number')}</span>
            <span>{t('apps.helpdesk.columns.time')}</span>
            <span>{t('apps.helpdesk.columns.status')}</span>
            <span>{t('apps.helpdesk.columns.code')}</span>
          </div>
          {[...tickets].reverse().map((ticket) => (
            <Pressable
              key={ticket.id}
              className={styles.historyRow}
              pressEffect="none"
              onPress={() => {
                audio.play('viewer.jump');
                useHelpDesk.getState().pick(ticket.id);
              }}
            >
              <span className={appStyles.mono}>
                {formatNumber(ticket.number, { useGrouping: false })}
              </span>
              <span className={appStyles.mono}>{formatClock(ticket.openedAt)}</span>
              <span>{t(`apps.helpdesk.status.${ticket.status}`)}</span>
              <span className={appStyles.mono}>{ticket.code ?? t('apps.helpdesk.unknown')}</span>
            </Pressable>
          ))}
        </div>
      )}
    </div>
  );
}
