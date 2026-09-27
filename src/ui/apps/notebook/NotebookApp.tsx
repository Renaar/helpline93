import { useState } from 'react';
import { TextField } from '../../feel/TextField.tsx';
import { TabBar } from '../../os/TabBar.tsx';
import { t } from '../../strings/i18n.ts';
import styles from '../apps.module.css';
import { EmptyState } from '../EmptyState.tsx';
import { useNotebook } from './notebookStore.ts';
import notebookStyles from './NotebookApp.module.css';

type Tab = 'clues' | 'notes';

/** Notebook (GDD 4.7): clues collected automatically (J2) and free notes. */
export function NotebookApp() {
  const [tab, setTab] = useState<Tab>('clues');
  const notes = useNotebook((state) => state.notes);
  return (
    <div className={styles.app}>
      <TabBar
        tabs={[
          { id: 'clues', label: t('apps.notebook.tabs.clues') },
          { id: 'notes', label: t('apps.notebook.tabs.notes') },
        ]}
        selected={tab}
        onSelect={setTab}
      />
      {tab === 'clues' ? (
        <div className={styles.pane}>
          <EmptyState
            icon="notebook"
            title={t('apps.notebook.cluesEmpty')}
            hint={t('apps.notebook.cluesHint')}
          />
        </div>
      ) : (
        <TextField
          className={notebookStyles.notes}
          multiline
          autoFocus
          label={t('apps.notebook.notesLabel')}
          placeholder={t('apps.notebook.notesPlaceholder')}
          value={notes}
          onChange={useNotebook.getState().setNotes}
        />
      )}
    </div>
  );
}
