import { Button95 } from '../../ui/feel/Button95.tsx';
import { useSettings } from '../../ui/settings/settingsStore.ts';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function SettingsDemo() {
  const { muted, reducedMotion, toggleMuted, toggleReducedMotion } = useSettings();
  return (
    <Section title={t('sandbox.settings.title')}>
      <div className={styles.row}>
        <Button95 toggled={reducedMotion} onPress={toggleReducedMotion}>
          {t('sandbox.settings.reducedMotion')}
        </Button95>
        <Button95 toggled={muted} onPress={toggleMuted}>
          {t('sandbox.settings.muted')}
        </Button95>
      </div>
    </Section>
  );
}
