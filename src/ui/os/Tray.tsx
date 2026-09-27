import { Pressable } from '../feel/Pressable.tsx';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { useEngineState } from '../engine/hooks.ts';
import { formatClock } from '../strings/format.ts';
import { t } from '../strings/i18n.ts';
import styles from './Taskbar.module.css';
import { useWindows } from './windowStore.ts';

/** Notification area: blinking phone when a line rings (never a HUD), and the shift clock. */
export function Tray() {
  const phone = useEngineState((state) => state.phone);
  const minute = useEngineState((state) => state.shift.minute);
  const skipping = useEngineState((state) => state.shift.fastForward !== null);
  const ringing = phone.lines.find((line) => line.status === 'ringing');
  const urgent = ringing?.call?.type === 'urgent';

  return (
    <div className={styles.tray}>
      <Pressable
        className={styles.trayIcon}
        label={t('os.tray.phone')}
        onPress={() => {
          useWindows.getState().open('phone');
        }}
      >
        <span
          className={styles.blink}
          data-blink={ringing ? (urgent ? 'fast' : 'slow') : undefined}
        >
          <PixelIcon name={ringing ? 'incoming-call' : 'phone'} size="sm" />
        </span>
      </Pressable>
      <time
        className={styles.clock}
        data-skipping={skipping || undefined}
        aria-label={t('os.tray.clock')}
      >
        {formatClock(minute)}
      </time>
    </div>
  );
}
