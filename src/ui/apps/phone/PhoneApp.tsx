import { useEngineState } from '../../engine/hooks.ts';
import { t } from '../../strings/i18n.ts';
import styles from '../apps.module.css';
import { CallHistory } from './CallHistory.tsx';
import { PhoneLine } from './PhoneLine.tsx';
import phoneStyles from './PhoneApp.module.css';

/** Software switchboard (GDD 5.3): lines with lamps, answer / hold / hang up, history. */
export function PhoneApp() {
  const phone = useEngineState((state) => state.phone);
  return (
    <div className={styles.app}>
      <p className={phoneStyles.switchboard}>{t('apps.phone.switchboard')}</p>
      <div className={phoneStyles.lines}>
        {phone.lines.map((line) => (
          <PhoneLine key={line.id} line={line} />
        ))}
      </div>
      <CallHistory history={phone.history} />
    </div>
  );
}
