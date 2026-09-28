import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { Dialogue, TranscriptEntry } from '../../../engine/dialogue/types.ts';
import { feelConfig, ms } from '../../feel/feel.config.ts';
import { useSettings } from '../../settings/settingsStore.ts';
import { formatClock } from '../../strings/format.ts';
import { t } from '../../strings/i18n.ts';
import styles from './Chat.module.css';
import { CallerText } from './CallerText.tsx';

function Line({ entry, dialogue }: { entry: TranscriptEntry; dialogue: Dialogue }) {
  if (entry.from === 'system') {
    return <p className={styles.system}>{t(`apps.chat.system.${entry.event}`)}</p>;
  }
  const caller = entry.from === 'caller';
  return (
    <div className={styles.line} data-from={entry.from}>
      <p className={styles.meta}>
        <span>{caller ? t('apps.chat.caller') : t('apps.chat.operator')}</span>
        {entry.from === 'operator' && (
          <span className={styles.verb}>{t(`apps.chat.verbs.${entry.verb}`)}</span>
        )}
        <span className={styles.time}>{formatClock(entry.minute)}</span>
      </p>
      <p className={styles.text}>
        {caller ? <CallerText text={entry.text} dialogue={dialogue} /> : entry.text}
      </p>
    </div>
  );
}

/** The written transcript (GDD 4.2): lines slide in, the typing indicator shows the rhythm. */
export function Transcript({ dialogue }: { dialogue: Dialogue }) {
  const scroller = useRef<HTMLDivElement>(null);
  const reducedMotion = useSettings((state) => state.reducedMotion);
  // Lines already there when the chat opens do not animate again (keyed by call in ChatApp).
  const [initialCount] = useState(dialogue.transcript.length);
  const count = dialogue.transcript.length;
  const lineTyping = dialogue.typing;

  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    box.scrollTo({ top: box.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [count, lineTyping, reducedMotion]);

  const { entrySpring, entryOffsetPx } = feelConfig.chat;
  return (
    <div
      ref={scroller}
      className={styles.transcript}
      role="log"
      aria-label={t('apps.chat.transcript')}
    >
      {dialogue.transcript.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={index < initialCount ? false : { opacity: 0, y: entryOffsetPx }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...entrySpring }}
        >
          <Line entry={entry} dialogue={dialogue} />
        </motion.div>
      ))}
      <AnimatePresence>
        {lineTyping && (
          <motion.p
            key="typing"
            className={styles.typing}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ms(feelConfig.hover.fadeOutMs) }}
          >
            {t('apps.chat.typing')}
            <span className={styles.dots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
