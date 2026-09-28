import { useState } from 'react';
import type { Clue } from '../../../engine/dialogue/types.ts';
import { useEngineState } from '../../engine/hooks.ts';
import { Pressable } from '../../feel/Pressable.tsx';
import { TextField } from '../../feel/TextField.tsx';
import { TabBar } from '../../os/TabBar.tsx';
import { t } from '../../strings/i18n.ts';
import styles from '../apps.module.css';
import { formatClock } from '../../strings/format.ts';
import { EmptyState } from '../EmptyState.tsx';
import { fieldLabel } from '../helpdesk/fieldLabels.ts';
import { searchesClients, searchKeyword } from '../searchKeyword.ts';
import { useNotebook } from './notebookStore.ts';
import notebookStyles from './NotebookApp.module.css';

type Tab = 'clues' | 'notes';

function ClueRow({ clue }: { clue: Clue }) {
  const keyword = clue.keywords[0] ?? clue.label;
  return (
    <Pressable
      className={notebookStyles.clue}
      pressEffect="none"
      label={
        searchesClients(clue.field)
          ? t('apps.notebook.clueClients', { keyword })
          : t('apps.notebook.clueSearch', { keyword })
      }
      onPress={() => {
        searchKeyword(clue.field, keyword);
      }}
    >
      <span className={notebookStyles.clueLabel}>{clue.label}</span>
      <span className={notebookStyles.clueMeta}>
        {t('apps.notebook.clueMeta', {
          field: t(fieldLabel[clue.field]),
          time: formatClock(clue.minute),
        })}
      </span>
    </Pressable>
  );
}

/** Notebook (GDD 4.7): clues collected automatically and free notes. */
export function NotebookApp() {
  const [tab, setTab] = useState<Tab>('clues');
  const notes = useNotebook((state) => state.notes);
  const clues = useEngineState((state) => state.clues);
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
        <div className={styles.pane} data-flight-target="notebook-clues">
          {clues.length === 0 ? (
            <EmptyState
              icon="notebook"
              title={t('apps.notebook.cluesEmpty')}
              hint={t('apps.notebook.cluesHint')}
            />
          ) : (
            <div className={notebookStyles.clues}>
              {[...clues].reverse().map((clue) => (
                <ClueRow key={clue.id} clue={clue} />
              ))}
            </div>
          )}
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
