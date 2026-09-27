import { useState } from 'react';
import { Button95 } from '../../ui/feel/Button95.tsx';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function ButtonsDemo() {
  const [toggled, setToggled] = useState(false);
  return (
    <Section title={t('sandbox.buttons.title')} hint={t('sandbox.buttons.hint')}>
      <div className={styles.row}>
        <Button95 variant="primary">{t('sandbox.buttons.primary')}</Button95>
        <Button95>{t('sandbox.buttons.ok')}</Button95>
        <Button95>{t('sandbox.buttons.cancel')}</Button95>
      </div>
      <div className={styles.row}>
        <Button95 disabled>{t('sandbox.buttons.disabled')}</Button95>
        <Button95
          toggled={toggled}
          onPress={() => {
            setToggled((value) => !value);
          }}
        >
          {t('sandbox.buttons.toggle')}
        </Button95>
      </div>
    </Section>
  );
}
