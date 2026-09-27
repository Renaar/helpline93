import { PixelIcon } from '../../ui/icons/PixelIcon.tsx';
import { formatNumber, t } from '../../ui/strings/i18n.ts';
import { contrastRatio } from '../../ui/theme/contrast.ts';
import { contrastPairs, palette, paletteCssVar } from '../../ui/theme/palette.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

const TEXT_MINIMUM = 4.5;
const GRAPHIC_MINIMUM = 3;
const twoDecimals: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

/** Live WCAG contrast of the active palette's text/background pairs. */
export function ContrastDemo() {
  return (
    <Section
      title={t('sandbox.contrast.title')}
      hint={t('sandbox.contrast.hint', {
        text: formatNumber(TEXT_MINIMUM),
        graphic: formatNumber(GRAPHIC_MINIMUM),
      })}
    >
      <ul className={styles.contrastList}>
        {contrastPairs.map(({ text, background, minimum }) => {
          const ratio = contrastRatio(palette[text], palette[background]);
          const informative = minimum === 0;
          const passes = ratio >= minimum;
          return (
            <li key={`${text}-${background}`} className={styles.contrastRow}>
              <span
                className={styles.contrastSample}
                style={{
                  color: `var(${paletteCssVar(text)})`,
                  background: `var(${paletteCssVar(background)})`,
                }}
              >
                {t('sandbox.contrast.sample')}
              </span>
              <span className={styles.contrastPair}>
                {t('sandbox.contrast.pair', {
                  text: t(`sandbox.palette.roles.${text}`),
                  background: t(`sandbox.palette.roles.${background}`),
                })}
              </span>
              <code className={styles.contrastRatio}>
                {t('sandbox.contrast.ratio', { ratio: formatNumber(ratio, twoDecimals) })}
              </code>
              <span className={styles.contrastRequired}>
                {informative
                  ? t('sandbox.contrast.informative')
                  : t('sandbox.contrast.required', { minimum: formatNumber(minimum) })}
              </span>
              {!informative && <PixelIcon name={passes ? 'ok' : 'warning'} size="sm" />}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
