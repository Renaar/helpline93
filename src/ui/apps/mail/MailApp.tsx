import { useEngineState } from '../../engine/hooks.ts';
import { engine } from '../../engine/runtime.ts';
import { audio } from '../../feel/audio.ts';
import { Pressable } from '../../feel/Pressable.tsx';
import { formatClock } from '../../strings/format.ts';
import { t } from '../../strings/i18n.ts';
import appStyles from '../apps.module.css';
import { EmptyState } from '../EmptyState.tsx';
import styles from './Mail.module.css';
import { MailBody } from './MailBody.tsx';
import { useMail } from './mailStore.ts';

/** Mail (GDD 4.5): start-of-shift e-mails, internal notes, messages that arrive during the night. */
export function MailApp() {
  const inbox = useEngineState((state) => state.inbox);
  const selected = useMail((state) => state.selected);
  const unread = inbox.filter((e) => !e.read).length;
  const open = inbox.find((e) => e.id === selected);
  const email = open ? engine.content.emails[open.id] : undefined;

  return (
    <div className={appStyles.app}>
      <div className={appStyles.toolbar}>
        <span className={appStyles.caption}>{t('apps.mail.inbox')}</span>
        <span className={styles.count}>{t('apps.mail.unread', { count: unread })}</span>
      </div>
      {inbox.length === 0 ? (
        <div className={appStyles.pane}>
          <EmptyState icon="mail" title={t('apps.mail.empty')} />
        </div>
      ) : (
        <div className={styles.split}>
          <div className={`${appStyles.pane} ${styles.list}`}>
            {[...inbox].reverse().map((entry) => {
              const message = engine.content.emails[entry.id];
              if (!message) return null;
              return (
                <Pressable
                  key={entry.id}
                  className={styles.row}
                  pressEffect="none"
                  toggled={entry.id === selected}
                  onPress={() => {
                    audio.play('page.turn');
                    useMail.getState().select(entry.id);
                    engine.dispatch({ type: 'READ_EMAIL', emailId: entry.id });
                  }}
                >
                  <span className={styles.dot} data-unread={!entry.read || undefined} />
                  <span className={styles.rowText}>
                    <span className={styles.sender}>{message.from || t('apps.mail.noSender')}</span>
                    <span className={styles.subject}>{message.subject}</span>
                  </span>
                  <span className={styles.time}>{formatClock(entry.minute)}</span>
                </Pressable>
              );
            })}
          </div>
          <div className={`${appStyles.pane} ${styles.reader}`}>
            {email && open ? (
              <article>
                <dl className={styles.headers}>
                  <dt>{t('apps.mail.from')}</dt>
                  <dd>
                    {email.from || t('apps.mail.noSender')}
                    {email.address !== undefined && (
                      <span className={styles.address}>{` <${email.address}>`}</span>
                    )}
                  </dd>
                  <dt>{t('apps.mail.subject')}</dt>
                  <dd className={styles.subjectLine}>{email.subject}</dd>
                  <dt>{t('apps.mail.received')}</dt>
                  <dd>{formatClock(open.minute)}</dd>
                </dl>
                <MailBody body={email.body} />
              </article>
            ) : (
              <EmptyState icon="mail" title={t('apps.mail.noSelection')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
