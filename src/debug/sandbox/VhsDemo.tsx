import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { audio } from '../../ui/feel/audio.ts';
import { Button95 } from '../../ui/feel/Button95.tsx';
import { feelConfig } from '../../ui/feel/feel.config.ts';
import { FastForwardEffect } from '../../ui/os/FastForwardOverlay.tsx';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function VhsDemo() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      setPlaying(false);
    }, feelConfig.clock.skipDurationMs);
    return () => {
      clearTimeout(timer);
    };
  }, [playing]);

  return (
    <Section title={t('sandbox.vhs.title')} hint={t('sandbox.vhs.hint')}>
      <div className={styles.row}>
        <Button95
          disabled={playing}
          onPress={() => {
            audio.play('clock.skip');
            setPlaying(true);
          }}
        >
          {t('sandbox.vhs.play')}
        </Button95>
      </div>
      <div className={styles.windowArea}>
        <AnimatePresence>{playing && <FastForwardEffect key="vhs" />}</AnimatePresence>
      </div>
    </Section>
  );
}
