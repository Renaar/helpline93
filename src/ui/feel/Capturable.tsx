import { useRef } from 'react';
import { cx } from '../cx.ts';
import styles from './Capturable.module.css';
import { Pressable } from './Pressable.tsx';

export interface CapturableProps {
  children: string;
  captured: boolean;
  /** Nothing more can be captured (e.g. the ticket is closed): refusal feedback. */
  disabled?: boolean;
  /** First click: the piece of text is captured. Receives the element (start of its flight). */
  onCapture: (element: HTMLElement) => void;
  /** Later clicks: search it as a keyword (GDD 4.2.3). */
  onSearch?: (element: HTMLElement) => void;
  className?: string;
}

/**
 * A key piece of information in a caller message (GDD 4.2.3): discreet underline on hover,
 * felt-marker highlight and a marker sound when captured, then usable as a search keyword.
 */
export function Capturable({
  children,
  captured,
  disabled = false,
  onCapture,
  onSearch,
  className,
}: CapturableProps) {
  const anchor = useRef<HTMLSpanElement>(null);
  const refused = disabled && !captured;
  return (
    <span ref={anchor} className={cx(styles.anchor, className)}>
      <Pressable
        className={cx(styles.capturable, captured && styles.captured)}
        disabled={refused}
        releaseSound={captured ? 'viewer.jump' : 'capture.mark'}
        onPress={() => {
          const element = anchor.current;
          if (!element) return;
          if (captured) onSearch?.(element);
          else onCapture(element);
        }}
      >
        <span className={styles.mark} aria-hidden="true" />
        <span className={styles.text}>{children}</span>
      </Pressable>
    </span>
  );
}
