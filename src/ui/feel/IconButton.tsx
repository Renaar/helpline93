import { cx } from '../cx.ts';
import { Glyph, type GlyphName } from '../icons/Glyph.tsx';
import styles from './IconButton.module.css';
import { Pressable, type PressableProps } from './Pressable.tsx';

export interface IconButtonProps extends Omit<
  PressableProps,
  'children' | 'pressEffect' | 'className' | 'label'
> {
  glyph: GlyphName;
  /** Accessible name (the button only shows a glyph). */
  label: string;
}

/** Small square bevelled button showing a pixel glyph (toolbars). */
export function IconButton({ glyph, disabled, ...pressable }: IconButtonProps) {
  return (
    <Pressable
      {...pressable}
      disabled={disabled ?? false}
      pressEffect="none"
      className={cx(styles.button)}
    >
      <Glyph name={glyph} />
    </Pressable>
  );
}
