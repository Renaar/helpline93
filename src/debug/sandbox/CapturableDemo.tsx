import { useState } from 'react';
import { Capturable } from '../../ui/feel/Capturable.tsx';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

/** Capture of key information in a caller message (GDD 4.2.3). */
export function CapturableDemo() {
  const [captured, setCaptured] = useState<string[]>([]);
  const [searched, setSearched] = useState<string | null>(null);
  const piece = (id: string, text: string, disabled = false) => (
    <Capturable
      captured={captured.includes(id)}
      disabled={disabled}
      onCapture={() => {
        setCaptured((list) => [...list, id]);
      }}
      onSearch={() => {
        setSearched(text);
      }}
    >
      {text}
    </Capturable>
  );
  return (
    <Section title={t('sandbox.capture.title')} hint={t('sandbox.capture.hint')}>
      <p className={styles.sample}>
        {t('sandbox.capture.before')}
        {piece('bips', t('sandbox.capture.piece'))}
        {t('sandbox.capture.middle')}
        {piece('serial', t('sandbox.capture.serial'))}
        {t('sandbox.capture.after')}
        {piece('closed', t('sandbox.capture.disabled'), true)}
      </p>
      {searched !== null && (
        <p className={styles.hint}>{t('sandbox.capture.searched', { keyword: searched })}</p>
      )}
    </Section>
  );
}
