import { useEngineState } from '../../engine/hooks.ts';
import { TypedText } from '../../feel/TypedText.tsx';
import { formatPhoneNumber } from '../../strings/format.ts';
import { t } from '../../strings/i18n.ts';
import appStyles from '../apps.module.css';
import { currentCallLine, currentDialogue } from '../currentCall.ts';
import { EmptyState } from '../EmptyState.tsx';
import styles from './Chat.module.css';
import { ReplyZone } from './ReplyZone.tsx';
import { Transcript } from './Transcript.tsx';

/** Operator Chat (GDD 4.2): the written transcript of the call and the three reply verbs. */
export function ChatApp() {
  const line = useEngineState(currentCallLine);
  const dialogue = useEngineState(currentDialogue);
  const ticket = useEngineState((state) =>
    state.tickets.find((tk) => tk.id === dialogue?.ticketId),
  );

  if (!dialogue || !ticket) {
    if (!line?.call) {
      return <EmptyState icon="chat" title={t('apps.chat.idle')} hint={t('apps.chat.idleHint')} />;
    }
    return (
      <div className={appStyles.app}>
        <div className={appStyles.toolbar}>
          <span className={appStyles.mono}>
            {t('apps.chat.connected', {
              line: line.id,
              number: formatPhoneNumber(line.call.number),
            })}
          </span>
        </div>
        <div className={`${appStyles.pane} ${appStyles.padded}`}>
          <TypedText key={line.call.id} className={appStyles.mono} text={t('apps.chat.silent')} />
        </div>
      </div>
    );
  }

  return (
    <div className={appStyles.app}>
      <div className={appStyles.toolbar}>
        <span className={appStyles.mono}>
          {t('apps.chat.connected', {
            line: ticket.line,
            number: formatPhoneNumber(ticket.phone),
          })}
        </span>
      </div>
      <div className={styles.body}>
        <Transcript key={dialogue.callId} dialogue={dialogue} />
        <ReplyZone dialogue={dialogue} />
      </div>
    </div>
  );
}
