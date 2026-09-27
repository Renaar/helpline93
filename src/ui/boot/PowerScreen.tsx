import { audio } from '../feel/audio.ts';
import { Pressable } from '../feel/Pressable.tsx';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { t } from '../strings/i18n.ts';
import styles from './Boot.module.css';
import { useBoot } from './bootStore.ts';

/**
 * "Turn on the workstation" (GDD 8.5): the click that browsers require before any sound
 * becomes the first moment of immersion — switch clack, then the PC starts humming.
 */
export function PowerScreen() {
  return (
    <div className={styles.off}>
      <Pressable
        className={styles.power}
        pressSound="os.power"
        releaseSound="ui.release"
        onPress={() => {
          audio.startHum();
          useBoot.getState().setPhase('bios');
        }}
      >
        <PixelIcon name="power" size="lg" />
        <span>{t('boot.powerOn')}</span>
      </Pressable>
    </div>
  );
}
