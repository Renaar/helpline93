import { useState } from 'react';
import { Button95 } from '../../ui/feel/Button95.tsx';
import { TextField } from '../../ui/feel/TextField.tsx';
import { TypedText } from '../../ui/feel/TypedText.tsx';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function InputsDemo() {
  const [value, setValue] = useState('');
  const [run, setRun] = useState(0);
  return (
    <Section title={t('sandbox.inputs.title')} hint={t('sandbox.inputs.hint')}>
      <TextField
        label={t('sandbox.inputs.fieldLabel')}
        placeholder={t('sandbox.inputs.placeholder')}
        value={value}
        maxLength={12}
        onChange={setValue}
      />
      <div className={styles.row}>
        <TypedText key={run} className={styles.fontMono} text={t('sandbox.inputs.typed')} />
      </div>
      <div className={styles.row}>
        <Button95
          onPress={() => {
            setRun((n) => n + 1);
          }}
        >
          {t('sandbox.inputs.replay')}
        </Button95>
      </div>
    </Section>
  );
}
