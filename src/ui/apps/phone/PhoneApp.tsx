import { canSkip } from '../../../engine/schedule.ts';
import { useEngineState } from '../../engine/hooks.ts';
import { engine } from '../../engine/runtime.ts';
import { Button95 } from '../../feel/Button95.tsx';
import { feelConfig } from '../../feel/feel.config.ts';
import { t } from '../../strings/i18n.ts';
import styles from '../apps.module.css';
import { CallHistory } from './CallHistory.tsx';
import { PhoneLine } from './PhoneLine.tsx';
import phoneStyles from './PhoneApp.module.css';

/** Software switchboard (GDD 5.3): lines with lamps, answer / hold / hang up, history. */
export function PhoneApp() {
  const phone = useEngineState((state) => state.phone);
  const waitable = useEngineState(canSkip);
  return (
    <div className={styles.app}>
      <div className={phoneStyles.header}>
        <p className={phoneStyles.switchboard}>{t('apps.phone.switchboard')}</p>
        <Button95
          disabled={!waitable}
          onPress={() => {
            engine.dispatch({
              type: 'SKIP_TO_NEXT_EVENT',
              durationMs: feelConfig.clock.skipDurationMs,
            });
          }}
        >
          {t('apps.phone.waitNext')}
        </Button95>
      </div>
      <div className={phoneStyles.lines}>
        {phone.lines.map((line) => (
          <PhoneLine key={line.id} line={line} />
        ))}
      </div>
      <CallHistory history={phone.history} />
    </div>
  );
}
