import type { ReactNode } from 'react';
import styles from './Sandbox.module.css';

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {hint !== undefined && <p className={styles.hint}>{hint}</p>}
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
