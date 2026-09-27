import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import type { SoundId } from '../../audio/soundDefinitions.ts';
import { cx } from '../cx.ts';
import { feelConfig } from './feel.config.ts';
import styles from './Pressable.module.css';
import { useFeedback } from './useFeedback.ts';

export interface PressableProps {
  children: ReactNode;
  /** Runs when the press is released over the element (or on Enter/Space release). */
  onPress?: () => void;
  /** Disabled elements still react: dull sound + shake + "denied" cursor. */
  disabled?: boolean;
  /** Toggle buttons: stays visually pressed while true. */
  toggled?: boolean;
  /** "sink" shrinks slightly with a spring; "none" leaves visuals to the caller (e.g. bevels). */
  pressEffect?: 'sink' | 'none';
  pressSound?: SoundId;
  releaseSound?: SoundId;
  hoverSound?: SoundId | null;
  className?: string | undefined;
  /** Accessible name, when the content is not text (icons). */
  label?: string | undefined;
}

const ACTIVATION_KEYS = new Set(['Enter', ' ']);

/**
 * The base of every clickable thing (GDD 8.3): hover, pressed state, varied sounds,
 * refusal when disabled, interruptible spring, adapted cursor.
 * Like classic desktop buttons, the action fires on release, and dragging out cancels it.
 */
export function Pressable({
  children,
  onPress,
  disabled = false,
  toggled,
  pressEffect = 'sink',
  pressSound = 'ui.press',
  releaseSound = 'ui.release',
  hoverSound = 'ui.hover',
  className,
  label,
}: PressableProps) {
  const { scope, play, sink, deny } = useFeedback<HTMLButtonElement>();
  const [pressed, setPressed] = useState(false);
  const armed = useRef(false);
  const keyHeld = useRef<string | null>(null);

  const setDown = useCallback(
    (down: boolean) => {
      setPressed(down);
      if (pressEffect === 'sink') sink(down);
    },
    [pressEffect, sink],
  );

  // A press that ends anywhere else in the page disarms the button.
  useEffect(() => {
    const disarm = () => {
      if (!armed.current) return;
      armed.current = false;
      setDown(false);
    };
    window.addEventListener('pointerup', disarm);
    window.addEventListener('pointercancel', disarm);
    window.addEventListener('blur', disarm);
    return () => {
      window.removeEventListener('pointerup', disarm);
      window.removeEventListener('pointercancel', disarm);
      window.removeEventListener('blur', disarm);
    };
  }, [setDown]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    if (disabled) {
      deny();
      return;
    }
    armed.current = true;
    setDown(true);
    play(pressSound);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !armed.current) return;
    armed.current = false;
    setDown(false);
    play(releaseSound);
    onPress?.();
  };

  const handlePointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
    if (armed.current && event.buttons === 1) {
      setDown(true);
      return;
    }
    if (!disabled && event.buttons === 0 && hoverSound && feelConfig.hover.playSound)
      play(hoverSound);
  };

  const handlePointerLeave = () => {
    if (armed.current) setDown(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!ACTIVATION_KEYS.has(event.key)) return;
    event.preventDefault();
    if (event.repeat || keyHeld.current) return;
    if (disabled) {
      deny();
      return;
    }
    keyHeld.current = event.key;
    setDown(true);
    play(pressSound);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== keyHeld.current) return;
    event.preventDefault();
    keyHeld.current = null;
    setDown(false);
    play(releaseSound);
    onPress?.();
  };

  const handleBlur = () => {
    if (keyHeld.current === null) return;
    keyHeld.current = null;
    setDown(false);
  };

  return (
    <button
      ref={scope}
      type="button"
      className={cx(styles.pressable, className)}
      data-pressed={pressed || undefined}
      aria-disabled={disabled || undefined}
      aria-pressed={toggled}
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
    >
      {children}
    </button>
  );
}
