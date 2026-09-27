import { useEffect, useRef, useState } from 'react';
import { nextEventMinute } from '../../engine/schedule.ts';
import { engine } from '../engine/runtime.ts';
import { useEngineState } from '../engine/hooks.ts';
import { Button95 } from '../feel/Button95.tsx';
import { Pressable } from '../feel/Pressable.tsx';
import { useDrag } from '../feel/useDrag.ts';
import { formatClock } from '../strings/format.ts';
import { t } from '../strings/i18n.ts';
import styles from './DebugPanel.module.css';

const SCHEDULE_DELAYS = [15, 45];

/**
 * Out-of-fiction tools for testing, never shown to players (development server or `?debug`).
 * Folded by default, draggable by its header, and F9 hides or shows it entirely.
 */
export function DebugPanel() {
  const minute = useEngineState((state) => state.shift.minute);
  const next = useEngineState(nextEventMinute);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef(offset);
  const drag = useDrag({
    onStart: () => {
      dragStart.current = offset;
    },
    onMove: (dx, dy) => {
      setOffset({ x: dragStart.current.x + dx, y: dragStart.current.y + dy });
    },
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F9') {
        event.preventDefault();
        setHidden((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (hidden) return null;

  return (
    <aside
      className={styles.panel}
      style={{ transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)` }}
    >
      <header className={styles.header} {...drag}>
        <Pressable
          className={styles.toggle}
          pressEffect="none"
          toggled={open}
          label={t('debug.toggle')}
          onPress={() => {
            setOpen((value) => !value);
          }}
        >
          {t('debug.title')}
        </Pressable>
        <span className={styles.info}>{t('debug.shortcut')}</span>
        <span className={styles.info}>{formatClock(minute)}</span>
      </header>
      {open && (
        <div className={styles.body}>
          <Button95
            onPress={() => {
              engine.dispatch({ type: 'DEBUG_INCOMING_CALL' });
            }}
          >
            {t('debug.incomingCall')}
          </Button95>
          <Button95
            onPress={() => {
              engine.dispatch({ type: 'DEBUG_INCOMING_CALL', callType: 'urgent' });
            }}
          >
            {t('debug.urgentCall')}
          </Button95>
          {SCHEDULE_DELAYS.map((minutes) => (
            <Button95
              key={minutes}
              onPress={() => {
                engine.dispatch({ type: 'SCHEDULE_CALL', atMinute: minute + minutes });
              }}
            >
              {t('debug.scheduleCall', { minutes })}
            </Button95>
          ))}
          <p className={styles.info}>
            {next === null ? t('debug.noEvent') : t('debug.nextEvent', { time: formatClock(next) })}
          </p>
        </div>
      )}
    </aside>
  );
}
