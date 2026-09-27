import { useEffect, useState } from 'react';
import { audio } from '../feel/audio.ts';
import { feelConfig } from '../feel/feel.config.ts';
import { formatNumber, t, type UiStringKey } from '../strings/i18n.ts';
import styles from './Boot.module.css';
import { useBoot } from './bootStore.ts';

const MEMORY_KB = 8192;

/** BIOS lines, in order. `null` = empty line; "memory" = the counting memory test. */
const script: (UiStringKey | null | 'memory')[] = [
  'boot.bios.header',
  'boot.bios.copyright',
  null,
  'boot.bios.cpu',
  'memory',
  null,
  'boot.bios.floppy',
  'boot.bios.drives',
  'boot.bios.primaryMaster',
  'boot.bios.primarySlave',
  null,
  'boot.bios.starting',
];

function randomDelay(): number {
  const { min, max } = feelConfig.boot.lineDelayMs;
  return min + Math.random() * (max - min);
}

/** Power-on self-test: lines appear one by one, memory counts up, one soft beep. */
export function BiosScreen() {
  const [visible, setVisible] = useState(0);
  const [memory, setMemory] = useState(0);
  const [memoryDone, setMemoryDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let frame = 0;
    let time = 0;
    const at = (delay: number, action: () => void) => {
      time += delay;
      timers.push(setTimeout(action, time));
    };
    const finish = () => {
      useBoot.getState().setPhase('login');
    };

    audio.play('os.spinup');
    script.forEach((line, index) => {
      at(randomDelay(), () => {
        setVisible(index + 1);
        if (line === 'boot.bios.drives' || line === 'boot.bios.starting') audio.play('os.hdd');
      });
      if (line === 'memory') {
        const start = time;
        timers.push(
          setTimeout(() => {
            const began = performance.now();
            const tick = () => {
              const progress = Math.min(
                1,
                (performance.now() - began) / feelConfig.boot.memoryCountMs,
              );
              setMemory(Math.round((progress * MEMORY_KB) / 64) * 64);
              if (progress < 1) frame = requestAnimationFrame(tick);
            };
            frame = requestAnimationFrame(tick);
          }, start),
        );
        at(feelConfig.boot.memoryCountMs, () => {
          setMemoryDone(true);
          audio.play('bios.beep');
        });
      }
    });
    at(feelConfig.boot.endHoldMs, finish);

    // Escape, Enter or a click skips the self-test.
    const skip = (event: Event) => {
      if (event instanceof KeyboardEvent && !['Escape', 'Enter', ' '].includes(event.key)) return;
      finish();
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  return (
    <div className={styles.bios}>
      <div className={styles.biosLines}>
        {script.slice(0, visible).map((line, index) => {
          if (line === null)
            return <p key={index} className={styles.biosLine} aria-hidden="true" />;
          if (line === 'memory') {
            const amount = formatNumber(memoryDone ? MEMORY_KB : memory);
            return (
              <p key={index} className={styles.biosLine}>
                {t(memoryDone ? 'boot.bios.memoryOk' : 'boot.bios.memory', { amount })}
              </p>
            );
          }
          return (
            <p key={index} className={index === 0 ? styles.biosHeader : styles.biosLine}>
              {t(line)}
            </p>
          );
        })}
      </div>
      <p className={styles.biosHint}>{t('boot.bios.skipHint')}</p>
    </div>
  );
}
