import { navigateTo } from '../../platform/routing.ts';
import { Button95 } from '../../ui/feel/Button95.tsx';
import { t } from '../../ui/strings/i18n.ts';
import { ButtonsDemo } from './ButtonsDemo.tsx';
import { ContrastDemo } from './ContrastDemo.tsx';
import { CursorsDemo } from './CursorsDemo.tsx';
import { EngineDemo } from './EngineDemo.tsx';
import { FeedbackDemo } from './FeedbackDemo.tsx';
import { PaletteDemo } from './PaletteDemo.tsx';
import { PressableDemo } from './PressableDemo.tsx';
import styles from './Sandbox.module.css';
import { SettingsDemo } from './SettingsDemo.tsx';
import { SoundsDemo } from './SoundsDemo.tsx';
import { TypographyDemo } from './TypographyDemo.tsx';

/** `?sandbox` — every feel-kit primitive, to test the game feel in isolation (GDD 10.5). */
export function Sandbox() {
  return (
    <main className={styles.sandbox}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('sandbox.title')}</h1>
          <p className={styles.intro}>{t('sandbox.intro')}</p>
        </div>
        <Button95
          onPress={() => {
            navigateTo('game');
          }}
        >
          {t('sandbox.back')}
        </Button95>
      </header>
      <div className={styles.grid}>
        <div className={styles.column}>
          <ButtonsDemo />
          <FeedbackDemo />
          <SoundsDemo />
          <SettingsDemo />
        </div>
        <div className={styles.column}>
          <PressableDemo />
          <EngineDemo />
        </div>
        <div className={styles.column}>
          <TypographyDemo />
          <CursorsDemo />
          <PaletteDemo />
          <ContrastDemo />
        </div>
      </div>
    </main>
  );
}
