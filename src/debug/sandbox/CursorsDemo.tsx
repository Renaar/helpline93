import { cursorArt, type CursorName } from '../../ui/icons/cursorArt.ts';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

const cursorNames = Object.keys(cursorArt) as CursorName[];

export function CursorsDemo() {
  return (
    <Section title={t('sandbox.cursors.title')} hint={t('sandbox.cursors.hint')}>
      <div className={styles.row}>
        {cursorNames.map((name) => (
          <div key={name} className={styles.cursorZone} style={{ cursor: `var(--cursor-${name})` }}>
            {t(`sandbox.cursors.${name}`)}
          </div>
        ))}
      </div>
    </Section>
  );
}
