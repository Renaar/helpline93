import { useEffect, useState } from 'react';
import { createEngine } from '../../engine/engine.ts';
import type { EngineEvent } from '../../engine/events.ts';
import { startEngineLoop } from '../../platform/engineLoop.ts';
import { createRealClock } from '../../platform/realClock.ts';
import { audio } from '../../ui/feel/audio.ts';
import { Button95 } from '../../ui/feel/Button95.tsx';
import { feelConfig } from '../../ui/feel/feel.config.ts';
import { Lamp } from '../../ui/os/Lamp.tsx';
import { formatNumber, t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

const LOG_LENGTH = 6;
const secondsFormat: Intl.NumberFormatOptions = {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
};

/** The engine decides *what* happens and when; the UI decides *how* to show it (GDD 8.2). */
export function EngineDemo() {
  const [engine] = useState(() => createEngine({ clock: createRealClock() }));
  const [log, setLog] = useState<EngineEvent[]>([]);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    let lampTimer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = engine.events.onAny((event) => {
      setLog((entries) => [event, ...entries].slice(0, LOG_LENGTH));
      if (event.type === 'debug.pong') {
        audio.play('ui.confirm');
        setLit(true);
        clearTimeout(lampTimer);
        lampTimer = setTimeout(() => {
          setLit(false);
        }, feelConfig.lamp.holdMs);
      }
    });
    engine.dispatch({ type: 'START' });
    const stopLoop = startEngineLoop(engine);
    return () => {
      stopLoop();
      unsubscribe();
      clearTimeout(lampTimer);
    };
  }, [engine]);

  const delay = formatNumber(feelConfig.debug.pingDelayMs / 1000, secondsFormat);

  return (
    <Section title={t('sandbox.engine.title')} hint={t('sandbox.engine.hint', { delay })}>
      <div className={styles.row}>
        <Button95
          onPress={() => {
            engine.dispatch({ type: 'DEBUG_PING', delayMs: feelConfig.debug.pingDelayMs });
          }}
        >
          {t('sandbox.engine.ping')}
        </Button95>
        <Lamp lit={lit} />
      </div>
      <h3 className={styles.subTitle}>{t('sandbox.engine.log')}</h3>
      <ol className={styles.log}>
        {log.length === 0 && <li>{t('sandbox.engine.empty')}</li>}
        {log.map((event) => (
          <li key={`${event.type}-${event.at}`}>
            {t('sandbox.engine.entry', {
              type: event.type,
              time: formatNumber(event.at / 1000, secondsFormat),
            })}
          </li>
        ))}
      </ol>
    </Section>
  );
}
