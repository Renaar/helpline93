import type { IconName } from '../icons/iconArt.ts';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import styles from './apps.module.css';

/** Calm placeholder for an application with nothing to show yet. */
export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: IconName;
  title: string;
  hint?: string;
}) {
  return (
    <div className={styles.empty}>
      <PixelIcon name={icon} size="lg" className={styles.emptyIcon} />
      <p className={styles.emptyTitle}>{title}</p>
      {hint !== undefined && <p className={styles.emptyHint}>{hint}</p>}
    </div>
  );
}
