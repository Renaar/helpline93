import { soundIds, type SoundId } from '../../audio/soundDefinitions.ts';
import { audio } from '../../ui/feel/audio.ts';
import { Button95 } from '../../ui/feel/Button95.tsx';
import { feelConfig } from '../../ui/feel/feel.config.ts';
import { formatNumber, t, type UiStringKey } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

const labels: Record<SoundId, UiStringKey> = {
  'ui.hover': 'sandbox.sounds.hover',
  'ui.press': 'sandbox.sounds.press',
  'ui.release': 'sandbox.sounds.release',
  'ui.deny': 'sandbox.sounds.deny',
  'ui.confirm': 'sandbox.sounds.confirm',
  'os.power': 'sandbox.sounds.power',
  'os.spinup': 'sandbox.sounds.spinup',
  'os.hdd': 'sandbox.sounds.hdd',
  'bios.beep': 'sandbox.sounds.biosBeep',
  'window.open': 'sandbox.sounds.windowOpen',
  'window.close': 'sandbox.sounds.windowClose',
  'window.minimize': 'sandbox.sounds.windowMinimize',
  'window.restore': 'sandbox.sounds.windowRestore',
  'menu.open': 'sandbox.sounds.menuOpen',
  'drag.pick': 'sandbox.sounds.dragPick',
  'drag.drop': 'sandbox.sounds.dragDrop',
  'page.turn': 'sandbox.sounds.pageTurn',
  'viewer.jump': 'sandbox.sounds.viewerJump',
  'key.press': 'sandbox.sounds.key',
  'phone.ring': 'sandbox.sounds.phoneRing',
  'phone.pickup': 'sandbox.sounds.phonePickup',
  'phone.hangup': 'sandbox.sounds.phoneHangup',
  'phone.hold': 'sandbox.sounds.phoneHold',
};

const percent = (fraction: number) => formatNumber(fraction * 100);

export function SoundsDemo() {
  const hint = t('sandbox.sounds.hint', {
    pitch: percent(feelConfig.sound.pitchVariation),
    volume: percent(feelConfig.sound.volumeVariation),
  });
  return (
    <Section title={t('sandbox.sounds.title')} hint={hint}>
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
