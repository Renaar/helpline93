import { cx } from '../cx.ts';
import styles from './Lamp.module.css';

/** off, steady, blinking (ringing), slow pulse (on hold), fast blinking (urgent). */
export type LampMode = 'off' | 'on' | 'blink' | 'slow' | 'fast';

export interface LampProps {
  /** Shortcut for mode "on" / "off". */
  lit?: boolean;
  mode?: LampMode;
  tone?: 'highlight' | 'alert';
}

/** Indicator lamp (line lights of the Phone app, notifications). Diegetic, never a HUD. */
export function Lamp({ lit = false, mode, tone = 'highlight' }: LampProps) {
  const resolved = mode ?? (lit ? 'on' : 'off');
  return (
    <span
      className={cx(styles.lamp, styles[tone])}
      data-mode={resolved === 'off' ? undefined : resolved}
    />
  );
}
