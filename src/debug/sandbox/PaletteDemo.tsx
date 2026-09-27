import { t } from '../../ui/strings/i18n.ts';
import { palette, paletteCssVar, type PaletteColor } from '../../ui/theme/palette.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

const colors = Object.keys(palette) as PaletteColor[];

export function PaletteDemo() {
  return (
    <Section title={t('sandbox.palette.title')}>
      <div className={styles.swatches}>
        {colors.map((color) => (
          <figure key={color} className={styles.swatch}>
            <span
              className={styles.swatchChip}
              style={{ background: `var(${paletteCssVar(color)})` }}
            />
            <figcaption>
              {t(`sandbox.palette.${color}`)}
              <code className={styles.swatchCode}>{palette[color]}</code>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
