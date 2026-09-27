import type { Line } from '../../../engine/phone.ts';
import { engine } from '../../engine/runtime.ts';
import { Button95 } from '../../feel/Button95.tsx';
import { Lamp, type LampMode } from '../../os/Lamp.tsx';
import { formatPhoneNumber } from '../../strings/format.ts';
import { t } from '../../strings/i18n.ts';
import styles from './PhoneApp.module.css';

const lampModes: Record<Line['status'], LampMode> = {
  idle: 'off',
  ringing: 'blink',
  active: 'on',
  held: 'slow',
};

export function PhoneLine({ line }: { line: Line }) {
  const urgent = line.call?.type === 'urgent';
  const mode = urgent && line.status === 'ringing' ? 'fast' : lampModes[line.status];
  const dispatch = (type: 'ANSWER_CALL' | 'HOLD_CALL' | 'RESUME_CALL' | 'HANG_UP') => () => {
    engine.dispatch({ type, line: line.id });
  };

  return (
    <div className={styles.line} data-status={line.status}>
      <Lamp mode={mode} tone={urgent ? 'alert' : 'highlight'} />
      <div className={styles.lineName}>
        <span>{t('apps.phone.line', { line: line.id })}</span>
        <span className={styles.lineCode}>{t('apps.phone.lineCode', { line: line.id })}</span>
      </div>
      <span className={styles.status}>{t(`apps.phone.status.${line.status}`)}</span>
      <span className={styles.number}>{line.call ? formatPhoneNumber(line.call.number) : ''}</span>
      <div className={styles.actions}>
        {line.status === 'ringing' && (
          <Button95 variant="primary" pressSound="phone.pickup" onPress={dispatch('ANSWER_CALL')}>
            {t('apps.phone.answer')}
          </Button95>
        )}
        {line.status === 'active' && (
          <Button95 onPress={dispatch('HOLD_CALL')}>{t('apps.phone.hold')}</Button95>
        )}
        {line.status === 'held' && (
          <Button95 onPress={dispatch('RESUME_CALL')}>{t('apps.phone.resume')}</Button95>
        )}
        {(line.status === 'active' || line.status === 'held') && (
          <Button95 onPress={dispatch('HANG_UP')}>{t('apps.phone.hangUp')}</Button95>
        )}
      </div>
    </div>
  );
}
