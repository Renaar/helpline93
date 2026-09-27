import { soundIds, type SoundId } from '../../audio/soundDefinitions.ts';
import { audio } from '../../ui/feel/audio.ts';
import { Button95 } from '../../ui/feel/Button95.tsx';
import { t, type UiStringKey } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

const labels: Record<SoundId, UiStringKey> = {
  'ui.hover': 'sandbox.sounds.hover',
  'ui.press': 'sandbox.sounds.press',
  'ui.release': 'sandbox.sounds.release',
  'ui.deny': 'sandbox.sounds.deny',
  'ui.confirm': 'sandbox.sounds.confirm',
};

export function SoundsDemo() {
  return (
    <Section title={t('sandbox.sounds.title')} hint={t('sandbox.sounds.hint')}>
      <div className={styles.row}>
        {soundIds.map((id) => (
          <Button95
            key={id}
            pressSound={id}
            releaseSound={id}
            hoverSound={null}
            onPress={() => {
              audio.play(id);
            }}
          >
            {t(labels[id])}
          </Button95>
        ))}
      </div>
    </Section>
  );
}
