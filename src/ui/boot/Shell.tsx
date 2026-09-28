import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { engine } from '../engine/runtime.ts';
import { audio } from '../feel/audio.ts';
import { feelConfig, ms } from '../feel/feel.config.ts';
import { Desktop } from '../os/Desktop.tsx';
import { useSettings } from '../settings/settingsStore.ts';
import { t } from '../strings/i18n.ts';
import { BiosScreen } from './BiosScreen.tsx';
import styles from './Boot.module.css';
import { useBoot, type BootPhase } from './bootStore.ts';
import { LoginScreen } from './LoginScreen.tsx';
import { playableNights, startNight } from '../session/nights.ts';
import { PowerScreen } from './PowerScreen.tsx';

const fades: Record<BootPhase, number> = {
  off: feelConfig.boot.shutdownFadeMs,
  bios: 0,
  login: feelConfig.boot.loginFadeMs,
  desktop: feelConfig.boot.desktopFadeMs,
};

/** The whole workstation: off, BIOS, login, then the HelplineOS desktop. */
export function Shell() {
  const phase = useBoot((state) => state.phase);
  const reducedMotion = useSettings((state) => state.reducedMotion);

  useEffect(() => {
    if (phase === 'off') audio.stopHum();
    // `?boot=skip` lands on the desktop without a login: default name, first night.
    // `?mission=<id>` plays one mission in isolation: no night.
    if (phase === 'desktop' && engine.getState().shift.startedAt === null) {
      engine.dispatch({ type: 'START_SHIFT', operatorName: t('boot.defaultOperator') });
      const isolated = new URLSearchParams(window.location.search).has('mission');
      const first = playableNights()[0];
      if (!isolated && first) startNight(first.id);
      audio.startHum();
    }
  }, [phase]);

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={phase}
        className={styles.layer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : ms(fades[phase]) }}
      >
        {phase === 'off' && <PowerScreen />}
        {phase === 'bios' && <BiosScreen />}
        {phase === 'login' && <LoginScreen />}
        {phase === 'desktop' && <Desktop />}
      </motion.div>
    </AnimatePresence>
  );
}
