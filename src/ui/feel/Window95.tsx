import { animate, motion, useMotionValue, type MotionValue } from 'motion/react';
import { useEffect, useEffectEvent, useRef, type ReactNode } from 'react';
import { cx } from '../cx.ts';
import { Glyph } from '../icons/Glyph.tsx';
import type { IconName } from '../icons/iconArt.ts';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { useSettings } from '../settings/settingsStore.ts';
import { DESKTOP_AREA, TITLEBAR_HEIGHT, WINDOW_KEEP_VISIBLE, type Rect } from '../theme/layout.ts';
import { feelConfig, ms } from './feel.config.ts';
import { Pressable } from './Pressable.tsx';
import { useDrag } from './useDrag.ts';
import styles from './Window95.module.css';

export type WindowPhase = 'open' | 'minimized' | 'closing';

export interface Window95Props {
  title: string;
  icon: IconName;
  /** Position and size, in logical stage pixels. */
  rect: Rect;
  active: boolean;
  zIndex: number;
  phase: WindowPhase;
  /** Where the window unfolds from (the icon that opened it). */
  openFrom?: Rect | null;
  /** Where the window folds into when minimized (its taskbar button). */
  minimizeTo?: Rect | null;
  minimizeLabel: string;
  closeLabel: string;
  onFocus: () => void;
  onMinimize: () => void;
  onClose: () => void;
  /** Called once the close animation is over: the window can be removed. */
  onClosed: () => void;
  /** Called when a drag (and its inertia) ends, with the final position. */
  onMove: (x: number, y: number) => void;
  children: ReactNode;
}

interface Pose {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

/** The transform that makes a window of `rect` cover `target` (transform origin: top left). */
function poseOver(rect: Rect, target: Rect, opacity: number): Pose {
  return {
    x: target.x,
    y: target.y,
    scaleX: target.width / rect.width,
    scaleY: target.height / rect.height,
    opacity,
  };
}

function clampPosition(rect: Rect, x: number, y: number): { x: number; y: number } {
  return {
    x: Math.min(
      DESKTOP_AREA.width - WINDOW_KEEP_VISIBLE,
      Math.max(WINDOW_KEEP_VISIBLE - rect.width, x),
    ),
    y: Math.min(DESKTOP_AREA.height - TITLEBAR_HEIGHT, Math.max(DESKTOP_AREA.y, y)),
  };
}

type Values = Record<keyof Pose, MotionValue<number>>;

function setPose(values: Values, pose: Pose): void {
  for (const key of Object.keys(pose) as (keyof Pose)[]) values[key].set(pose[key]);
}

/**
 * HelplineOS window (GDD 5.1 / 8.3): unfolds from its icon, moves with a light inertia,
 * folds into the taskbar, closes with a short fade. Every movement is a transform, and every
 * animation can be interrupted by the next one.
 */
export function Window95({
  title,
  icon,
  rect,
  active,
  zIndex,
  phase,
  openFrom = null,
  minimizeTo = null,
  minimizeLabel,
  closeLabel,
  onFocus,
  onMinimize,
  onClose,
  onClosed,
  onMove,
  children,
}: Window95Props) {
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const values: Values = {
    x: useMotionValue(rect.x),
    y: useMotionValue(rect.y),
    scaleX: useMotionValue(1),
    scaleY: useMotionValue(1),
    opacity: useMotionValue(0),
  };
  const valuesRef = useRef(values);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const mounted = useRef(false);
  const notifyClosed = useEffectEvent(() => {
    onClosed();
  });

  /** Animates every value to `pose` with one spring (instant when animations are reduced). */
  const animateTo = (pose: Pose, spring: object, onComplete?: () => void) => {
    const transition = reducedMotion ? { duration: 0 } : { type: 'spring' as const, ...spring };
    const controls = (Object.keys(pose) as (keyof Pose)[]).map((key) =>
      animate(valuesRef.current[key], pose[key], transition),
    );
    if (onComplete) void Promise.all(controls).then(onComplete);
  };

  const openPose: Pose = { x: rect.x, y: rect.y, scaleX: 1, scaleY: 1, opacity: 1 };

  // Phase changes: unfold, fold into the taskbar, close.
  useEffect(() => {
    const first = !mounted.current;
    mounted.current = true;
    if (phase === 'open') {
      if (first)
        setPose(
          valuesRef.current,
          openFrom
            ? poseOver(rect, openFrom, 0)
            : { ...openPose, scaleX: 0.96, scaleY: 0.96, opacity: 0 },
        );
      else if (minimizeTo && valuesRef.current.opacity.get() < 1)
        setPose(valuesRef.current, poseOver(rect, minimizeTo, 0));
      animateTo(openPose, feelConfig.window.openSpring);
    } else if (phase === 'minimized') {
      const target = minimizeTo ?? { ...rect, y: DESKTOP_AREA.height, height: rect.height / 4 };
      animateTo(poseOver(rect, target, 0), feelConfig.window.minimizeSpring);
    } else {
      const transition = {
        duration: reducedMotion ? 0 : ms(feelConfig.window.closeMs),
        ease: 'easeIn' as const,
      };
      void Promise.all([
        animate(valuesRef.current.opacity, 0, transition),
        animate(valuesRef.current.scaleX, 0.97, transition),
        animate(valuesRef.current.scaleY, 0.97, transition),
      ]).then(() => {
        notifyClosed();
      });
    }
    // Only phase changes trigger these animations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Position changes from outside (automatic layout) glide to the new place.
  useEffect(() => {
    if (!mounted.current || dragging.current || phase !== 'open') return;
    const transition = reducedMotion
      ? { duration: 0 }
      : { type: 'spring' as const, ...feelConfig.window.moveSpring };
    void animate(valuesRef.current.x, rect.x, transition);
    void animate(valuesRef.current.y, rect.y, transition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rect.x, rect.y]);

  const drag = useDrag({
    onStart: () => {
      dragging.current = true;
      valuesRef.current.x.stop();
      valuesRef.current.y.stop();
      dragStart.current = { x: valuesRef.current.x.get(), y: valuesRef.current.y.get() };
    },
    onMove: (dx, dy) => {
      const next = clampPosition(rect, dragStart.current.x + dx, dragStart.current.y + dy);
      valuesRef.current.x.set(next.x);
      valuesRef.current.y.set(next.y);
    },
    onEnd: (vx, vy) => {
      const min = clampPosition(rect, -Infinity, -Infinity);
      const max = clampPosition(rect, Infinity, Infinity);
      const finish = () => {
        dragging.current = false;
        onMove(valuesRef.current.x.get(), valuesRef.current.y.get());
      };
      if (reducedMotion) {
        finish();
        return;
      }
      const inertia = {
        type: 'inertia' as const,
        power: feelConfig.drag.inertiaPower,
        timeConstant: feelConfig.drag.inertiaTimeConstantMs,
      };
      void Promise.all([
        animate(valuesRef.current.x, valuesRef.current.x.get(), {
          ...inertia,
          velocity: vx,
          min: min.x,
          max: max.x,
        }),
        animate(valuesRef.current.y, valuesRef.current.y.get(), {
          ...inertia,
          velocity: vy,
          min: min.y,
          max: max.y,
        }),
      ]).then(finish);
    },
  });

  return (
    <motion.section
      className={styles.window}
      data-active={active || undefined}
      aria-label={title}
      aria-hidden={phase !== 'open'}
      style={{
        width: rect.width,
        height: rect.height,
        zIndex,
        x: values.x,
        y: values.y,
        scaleX: values.scaleX,
        scaleY: values.scaleY,
        opacity: values.opacity,
        pointerEvents: phase === 'open' ? 'auto' : 'none',
      }}
      onPointerDownCapture={onFocus}
    >
      <header className={styles.titlebar} {...drag}>
        <PixelIcon name={icon} size="sm" className={styles.titleIcon} />
        <h2 className={styles.title}>{title}</h2>
        <Pressable
          className={styles.control}
          label={minimizeLabel}
          pressEffect="none"
          onPress={onMinimize}
        >
          <Glyph name="minimize" />
        </Pressable>
        <Pressable
          className={cx(styles.control, styles.close)}
          label={closeLabel}
          pressEffect="none"
          onPress={onClose}
        >
          <Glyph name="close" />
        </Pressable>
      </header>
      <div className={styles.body}>{children}</div>
    </motion.section>
  );
}
