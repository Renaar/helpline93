import { useState } from 'react';
import { TextField } from '../feel/TextField.tsx';
import { t } from '../strings/i18n.ts';
import styles from './apps.module.css';
import { EmptyState } from './EmptyState.tsx';

/** Client database (GDD 4.4). J1: search field only; records arrive in J3. */
export function ClientsApp() {
  const [query, setQuery] = useState('');
  return (
    <div className={styles.app}>
      <div className={styles.toolbar}>
        <TextField
          label={t('apps.clients.searchLabel')}
          placeholder={t('apps.clients.searchPlaceholder')}
          value={query}
          onChange={setQuery}
          maxLength={40}
        />
      </div>
      <div className={styles.pane}>
        <EmptyState icon="clients" title={t('apps.clients.empty')} />
      </div>
    </div>
  );
}
