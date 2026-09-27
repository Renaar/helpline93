import { cx } from '../cx.ts';
import styles from './Lamp.module.css';

export interface LampProps {
  lit: boolean;
  tone?: 'highlight' | 'alert';
}

/** Indicator lamp (line lights of the Phone app, notification area). Diegetic, never a HUD. */
export function Lamp({ lit, tone = 'highlight' }: LampProps) {
  return <span className={cx(styles.lamp, styles[tone])} data-lit={lit || undefined} />;
}
