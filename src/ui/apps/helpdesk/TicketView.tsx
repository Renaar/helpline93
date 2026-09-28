import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { CaptureField } from '../../../content/schemas.ts';
import type { Ticket } from '../../../engine/dialogue/types.ts';
import { engine } from '../../engine/runtime.ts';
import { audio } from '../../feel/audio.ts';
import { Button95 } from '../../feel/Button95.tsx';
import { feelConfig } from '../../feel/feel.config.ts';
import { Pressable } from '../../feel/Pressable.tsx';
import { scrollIntoList } from '../../feel/scrollIntoList.ts';
import { useSettings } from '../../settings/settingsStore.ts';
import { formatClock, formatPhoneNumber } from '../../strings/format.ts';
import { formatNumber, t, type UiStringKey } from '../../strings/i18n.ts';
import appStyles from '../apps.module.css';
import styles from './HelpDesk.module.css';
import { useHelpDesk } from './helpdeskStore.ts';

/** Ticket fields filled by captures, in display order ("model" goes with the product). */
const CAPTURE_ROWS: { key: UiStringKey; fields: CaptureField[]; optional: boolean }[] = [
  { key: 'apps.helpdesk.fields.product', fields: ['product', 'model'], optional: false },
  { key: 'apps.helpdesk.fields.serial', fields: ['serial'], optional: false },
  { key: 'apps.helpdesk.fields.symptoms', fields: ['symptom'], optional: false },
  { key: 'apps.helpdesk.fields.name', fields: ['name'], optional: true },
  { key: 'apps.helpdesk.fields.place', fields: ['place'], optional: true },
  { key: 'apps.helpdesk.fields.reference', fields: ['reference'], optional: true },
  { key: 'apps.helpdesk.fields.error', fields: ['error'], optional: true },
];

function Stamp({ code, animated }: { code: string; animated: boolean }) {
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const { stampSpring, stampFromScale, stampAngleDeg } = feelConfig.ticket;
  return (
    <motion.div
      className={styles.stamp}
      initial={animated ? { opacity: 0, scale: reducedMotion ? 1 : stampFromScale } : false}
      animate={{ opacity: 1, scale: 1, rotate: stampAngleDeg }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...stampSpring }}
    >
      {t('apps.helpdesk.stamp', { code })}
    </motion.div>
  );
}

function Closure({ ticket }: { ticket: Ticket }) {
  const chosen = useHelpDesk((state) => state.codes[ticket.id] ?? null);
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const section = useRef<HTMLElement>(null);
  const ready = ticket.status === 'awaiting_closure';
  // The call just ended: bring the resolution codes into view.
  useEffect(() => {
    if (ready && section.current) scrollIntoList(section.current, !reducedMotion);
  }, [ready, reducedMotion]);
  return (
    <section ref={section} className={styles.closure}>
      <h3 className={appStyles.caption}>{t('apps.helpdesk.closure')}</h3>
      <p className={styles.hint}>
        {ready ? t('apps.helpdesk.closureChoose') : t('apps.helpdesk.closureWait')}
      </p>
      <div className={styles.codes} role="listbox">
        {engine.content.codes.map((code) => (
          <Pressable
            key={code.id}
            className={styles.code}
            pressEffect="none"
            disabled={!ready}
            toggled={chosen === code.id}
            onPress={() => {
              useHelpDesk.getState().chooseCode(ticket.id, code.id);
            }}
          >
            <span className={appStyles.mono}>{code.id}</span>
            <span>{code.label}</span>
          </Pressable>
        ))}
      </div>
      <div className={styles.closeRow}>
        <Button95
          variant="primary"
          disabled={!ready || chosen === null}
          onPress={() => {
            if (chosen === null) return;
            engine.dispatch({ type: 'CLOSE_TICKET', ticketId: ticket.id, code: chosen });
            audio.play('ticket.stamp');
          }}
        >
          {t('apps.helpdesk.close')}
        </Button95>
      </div>
    </section>
  );
}

/** One ticket: header, fields filled by captures, and the closure (GDD 4.3). */
export function TicketView({ ticket }: { ticket: Ticket }) {
  const flashing = useHelpDesk((state) => state.flashing);
  // A ticket closed while on screen gets the stamp animation; one already closed does not.
  const [openAtMount] = useState(ticket.status !== 'closed');
  const unknown = t('apps.helpdesk.unknown');
  const number = formatNumber(ticket.number, { useGrouping: false });
  const fixed: [string, string][] = [
    [t('apps.helpdesk.fields.opened'), formatClock(ticket.openedAt)],
    [t('apps.helpdesk.fields.line'), t('apps.phone.lineCode', { line: ticket.line })],
    [t('apps.helpdesk.fields.caller'), formatPhoneNumber(ticket.phone)],
  ];
  const captured = CAPTURE_ROWS.flatMap((row) => {
    const values = row.fields.flatMap((field) => ticket.fields[field] ?? []);
    if (row.optional && values.length === 0) return [];
    return [{ ...row, values, flash: row.fields.some((f) => flashing.includes(f)) }];
  });
  return (
    <div className={styles.ticket}>
      <div className={appStyles.toolbar}>
        <strong className={appStyles.mono}>{t('apps.helpdesk.ticket', { number })}</strong>
        <span className={styles.spacer} />
        <span className={styles.status} data-status={ticket.status}>
          {t(`apps.helpdesk.status.${ticket.status}`)}
        </span>
      </div>
      <div className={`${appStyles.pane} ${appStyles.padded} ${styles.scroll}`} data-scroll-list>
        <dl className={styles.fields} data-flight-target="ticket-fields">
          {fixed.map(([label, value]) => (
            <div key={label} className={styles.field}>
              <dt>{label}</dt>
              <dd className={appStyles.mono}>{value}</dd>
            </div>
          ))}
          {captured.map((row) => (
            <div key={row.key} className={styles.field} data-flash={row.flash || undefined}>
              <dt>{t(row.key)}</dt>
              <dd className={appStyles.mono}>
                {row.values.length === 0
                  ? unknown
                  : row.values.map((value) => <span key={value}>{value}</span>)}
              </dd>
            </div>
          ))}
        </dl>
        {ticket.status === 'open' && (
          <p className={styles.hint}>{t('apps.helpdesk.captureHint')}</p>
        )}
        {ticket.status === 'closed' && ticket.code !== null ? (
          <Stamp code={ticket.code} animated={openAtMount} />
        ) : (
          <Closure ticket={ticket} />
        )}
      </div>
    </div>
  );
}
