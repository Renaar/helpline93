import { AnimatePresence, motion } from 'motion/react';
import { useEngineState } from '../engine/hooks.ts';
import { feelConfig, ms } from '../feel/feel.config.ts';
import { cx } from '../cx.ts';
import { useSettings } from '../settings/settingsStore.ts';
import { t } from '../strings/i18n.ts';
import { STAGE_HEIGHT } from '../theme/layout.ts';
import styles from './FastForwardOverlay.module.css';

const duration = ms(feelConfig.clock.skipDurationMs);

/**
 * Neo-retro VHS fast-forward shown while time jumps to the next event (GDD 2.2 / 6.1):
 * clean bands scrolling down, a faint brightness flicker and a discreet "▶▶".
 * Mounted exactly while the engine fast-forwards, so it ends cleanly with the clock.
 * The screen shake itself is applied to the desktop (see Desktop).
 */
export function FastForwardOverlay() {
  const skipping = useEngineState((state) => state.shift.fastForward !== null);
  // Own presence scope: the boot shell disables mount animations for its subtree.
  return <AnimatePresence>{skipping && <FastForwardEffect key="vhs" />}</AnimatePresence>;
}

/** The effect itself (also shown in the sandbox). Lasts clock.skipDurationMs. */
export function FastForwardEffect() {
  const reducedMotion = useSettings((state) => state.reducedMotion);

  if (reducedMotion) {
    const peak = feelConfig.vhs.reducedFadeOpacity;
    return (
      <motion.div
        className={cx(styles.layer, styles.veil)}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, peak, peak, 0] }}
        transition={{ duration, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' }}
      />
    );
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      {feelConfig.vhs.bands.map((band, index) => (
        <motion.div
          key={index}
          className={cx(styles.band, styles[band.kind])}
          initial={{ y: -STAGE_HEIGHT * 0.1 }}
          animate={{ y: STAGE_HEIGHT }}
          transition={{
            duration: ms(band.passMs),
            delay: ms(band.delayMs),
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      ))}
      <motion.div
        className={styles.veil}
        initial={{ opacity: 0 }}
        animate={{ opacity: [...feelConfig.vhs.flicker] }}
        transition={{ duration, ease: 'linear' }}
      />
      <span className={styles.indicator}>{t('os.fastForward')}</span>
    </div>
  );
}
