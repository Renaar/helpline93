import { type ChangeEvent, type KeyboardEvent } from 'react';
import { cx } from '../cx.ts';
import styles from './TextField.module.css';
import { useFeedback } from './useFeedback.ts';

export interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Enter in a single-line field. */
  onSubmit?: () => void;
  /** Accessible name. */
  label: string;
  placeholder?: string | undefined;
  maxLength?: number | undefined;
  multiline?: boolean;
  /** Mono font, for codes, serial numbers, names typed at a terminal. */
  mono?: boolean;
  autoFocus?: boolean;
  className?: string | undefined;
}

const SILENT_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape']);

/**
 * Text input of the feel kit: sunken bevel, amber caret, a soft mechanical key sound on
 * every key, and the refusal feedback when the field is full.
 */
export function TextField({
  value,
  onChange,
  onSubmit,
  label,
  placeholder,
  maxLength,
  multiline = false,
  mono = false,
  autoFocus = false,
  className,
}: TextFieldProps) {
  const { scope, play, deny } = useFeedback<HTMLSpanElement>();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (SILENT_KEYS.has(event.key) || event.ctrlKey || event.metaKey) return;
    const field = event.currentTarget;
    const printable = event.key.length === 1;
    const hasSelection = field.selectionStart !== field.selectionEnd;
    if (printable && maxLength !== undefined && field.value.length >= maxLength && !hasSelection) {
      event.preventDefault();
      deny();
      return;
    }
    if (event.key === 'Enter' && !multiline) {
      event.preventDefault();
      play('key.press');
      onSubmit?.();
      return;
    }
    play('key.press');
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const shared = {
    className: cx(styles.field, mono && styles.mono, multiline && styles.multiline),
    value,
    placeholder,
    maxLength,
    autoFocus,
    'aria-label': label,
    spellCheck: false,
    onKeyDown: handleKeyDown,
    onChange: handleChange,
  };

  return (
    <span
      ref={scope}
      className={cx(styles.wrapper, multiline && styles.wrapperMultiline, className)}
    >
      {multiline ? <textarea {...shared} /> : <input {...shared} type="text" />}
    </span>
  );
}
