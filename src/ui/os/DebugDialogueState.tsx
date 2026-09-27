import { currentDialogue } from '../apps/currentCall.ts';
import { useEngineState } from '../engine/hooks.ts';
import { engine } from '../engine/runtime.ts';
import { t } from '../strings/i18n.ts';
import styles from './DebugPanel.module.css';

const list = (items: readonly string[]) =>
  items.length === 0 ? t('debug.state.none') : items.join(', ');

/** State of the current conversation, for writers testing a mission (GDD 7.10). */
export function DebugDialogueState() {
  const dialogue = useEngineState(currentDialogue);
  const flags = useEngineState((state) => state.flags);
  const vars = useEngineState((state) => state.vars);
  const ticket = useEngineState((state) =>
    state.tickets.find((tk) => tk.id === dialogue?.ticketId),
  );
  if (!dialogue) return null;
  const mission = engine.content.missions[dialogue.missionId];
  const rows: [string, string][] = [
    [t('debug.state.mission'), `${dialogue.missionId} · ${mission?.title ?? ''}`],
    [t('debug.state.mood'), String(dialogue.mood)],
    [t('debug.state.flags'), list(flags)],
    [
      t('debug.state.vars'),
      Object.entries(vars)
        .map(([name, value]) => `${name} ${String(value)}`)
        .join(' · '),
    ],
    [t('debug.state.captured'), list(dialogue.captured)],
    [t('debug.state.asked'), list(dialogue.asked)],
    [t('debug.state.done'), list(dialogue.done)],
    [t('debug.state.pages'), list(dialogue.pages)],
    [
      t('debug.state.ticket'),
      ticket ? `${ticket.status}${ticket.code ? ` · ${ticket.code}` : ''}` : t('debug.state.none'),
    ],
  ];
  return (
    <section className={styles.state}>
      <h3 className={styles.stateTitle}>{t('debug.state.title')}</h3>
      <dl className={styles.stateList}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.stateRow}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
