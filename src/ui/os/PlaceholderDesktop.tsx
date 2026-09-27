import { navigateTo } from '../../platform/routing.ts';
import { Button95 } from '../feel/Button95.tsx';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { t } from '../strings/i18n.ts';
import styles from './PlaceholderDesktop.module.css';

/** Temporary start screen for J0. Replaced by the power-on screen and BIOS boot in J1. */
export function PlaceholderDesktop() {
  return (
    <main className={styles.desktop}>
      <div className={styles.card}>
        <PixelIcon name="start" size="lg" />
        <h1 className={styles.title}>{t('home.os')}</h1>
        <p className={styles.milestone}>{t('home.milestone')}</p>
        <p className={styles.notice}>{t('home.notice')}</p>
        <Button95
          variant="primary"
          onPress={() => {
            navigateTo('sandbox');
          }}
        >
          {t('home.openSandbox')}
        </Button95>
      </div>
    </main>
  );
}
