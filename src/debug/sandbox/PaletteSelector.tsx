import { Button95 } from '../../ui/feel/Button95.tsx';
import { useSettings } from '../../ui/settings/settingsStore.ts';
import { t } from '../../ui/strings/i18n.ts';
import { paletteNames } from '../../ui/theme/palette.ts';
import styles from './Sandbox.module.css';

/** Live A/B switch between palettes, for the J0 palette review. */
export function PaletteSelector() {
  const palette = useSettings((state) => state.palette);
  const setPalette = useSettings((state) => state.setPalette);
  return (
    <div className={styles.row}>
      <span className={styles.selectorLabel}>{t('sandbox.paletteSelector.label')}</span>
      {paletteNames.map((name) => (
        <Button95
          key={name}
          toggled={palette === name}
          onPress={() => {
            setPalette(name);
          }}
        >
          {t(`sandbox.paletteSelector.${name}`)}
        </Button95>
      ))}
    </div>
  );
}
