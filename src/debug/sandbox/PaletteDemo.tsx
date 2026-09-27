import { useSettings } from '../../ui/settings/settingsStore.ts';
import { t } from '../../ui/strings/i18n.ts';
import { paletteCssVar, paletteRoles, palettes } from '../../ui/theme/palette.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function PaletteDemo() {
  const palette = palettes[useSettings((state) => state.palette)];
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
