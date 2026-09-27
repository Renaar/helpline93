import { t } from '../../ui/strings/i18n.ts';
import { paletteCssVar, palette, paletteRoles } from '../../ui/theme/palette.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function PaletteDemo() {
  return (
    <Section title={t('sandbox.palette.title')}>
      <div className={styles.swatches}>
        {paletteRoles.map((role) => (
          <figure key={role} className={styles.swatch}>
            <span
              className={styles.swatchChip}
              style={{ background: `var(${paletteCssVar(role)})` }}
            />
            <figcaption>
              {t(`sandbox.palette.roles.${role}`)}
              <code className={styles.swatchCode}>{palette[role]}</code>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
