import { Lamp, type LampMode } from '../../ui/os/Lamp.tsx';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

const modes: LampMode[] = ['off', 'on', 'blink', 'slow'];

export function LampsDemo() {
  return (
    <Section title={t('sandbox.lamps.title')} hint={t('sandbox.lamps.hint')}>
      <div className={styles.row}>
        {modes.map((mode) => (
          <Lamp key={mode} mode={mode} />
        ))}
        <Lamp mode="fast" tone="alert" />
      </div>
    </Section>
  );
}
