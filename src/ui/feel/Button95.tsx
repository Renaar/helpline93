import type { ReactNode } from 'react';
import { cx } from '../cx.ts';
import styles from './Button95.module.css';
import { Pressable, type PressableProps } from './Pressable.tsx';

export interface Button95Props extends Omit<
  PressableProps,
  'pressEffect' | 'className' | 'children'
> {
  children: ReactNode;
  /** "primary" = the dialog's default button, with an extra dark outline. */
  variant?: 'default' | 'primary';
}

/** Classic bevelled desktop button: the relief inverts and the label moves 1 px when pressed. */
export function Button95({ children, variant = 'default', ...pressable }: Button95Props) {
  return (
    <Pressable
      {...pressable}
      pressEffect="none"
      className={cx(styles.button, variant === 'primary' && styles.primary)}
    >
      <span className={styles.label}>{children}</span>
    </Pressable>
  );
}
