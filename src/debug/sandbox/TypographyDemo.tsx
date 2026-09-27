import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function TypographyDemo() {
  return (
    <Section title={t('sandbox.typography.title')}>
      <p className={styles.fontSans}>{t('sandbox.typography.sans')}</p>
      <p className={styles.fontCondensed}>{t('sandbox.typography.condensed')}</p>
      <p className={styles.fontMono}>{t('sandbox.typography.mono')}</p>
      <p className={styles.fontSerifBold}>{t('sandbox.typography.serifBold')}</p>
      <p className={styles.fontSerif}>{t('sandbox.typography.serif')}</p>
    </Section>
  );
}
