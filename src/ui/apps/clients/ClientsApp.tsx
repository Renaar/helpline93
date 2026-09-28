import { engine } from '../../engine/runtime.ts';
import { audio } from '../../feel/audio.ts';
import { Pressable } from '../../feel/Pressable.tsx';
import { TextField } from '../../feel/TextField.tsx';
import { t } from '../../strings/i18n.ts';
import appStyles from '../apps.module.css';
import { EmptyState } from '../EmptyState.tsx';
import { ClientRecord } from './ClientRecord.tsx';
import styles from './Clients.module.css';
import { useClients } from './clientsStore.ts';
import { MIN_CLIENT_QUERY, searchClients } from './searchClients.ts';

const QUERY_MAX_LENGTH = 40;

/** Client database (GDD 4.4): search by name, serial number or city. Some records lie. */
export function ClientsApp() {
  const query = useClients((state) => state.query);
  const selected = useClients((state) => state.selected);
  const results = searchClients(Object.values(engine.content.clients), query);
  const shown =
    results.find((c) => c.id === selected) ?? (results.length === 1 ? results[0] : undefined);
  const active = query.trim().length >= MIN_CLIENT_QUERY;

  return (
    <div className={appStyles.app}>
      <div className={appStyles.toolbar}>
        <TextField
          className={styles.search}
          label={t('apps.clients.searchLabel')}
          placeholder={t('apps.clients.searchPlaceholder')}
          value={query}
          onChange={useClients.getState().setQuery}
          maxLength={QUERY_MAX_LENGTH}
        />
        {active && (
          <span className={styles.count}>
            {t('apps.clients.results', { count: results.length })}
          </span>
        )}
      </div>
      <div className={styles.split}>
        <div className={`${appStyles.pane} ${styles.list}`}>
          {!active && <p className={styles.hint}>{t('apps.clients.hint')}</p>}
          {active && results.length === 0 && (
            <p className={styles.hint}>{t('apps.clients.noResult')}</p>
          )}
          {results.map((client) => (
            <Pressable
              key={client.id}
              className={styles.row}
              pressEffect="none"
              toggled={client.id === shown?.id}
              onPress={() => {
                audio.play('viewer.jump');
                useClients.getState().select(client.id);
              }}
            >
              <span className={styles.rowName}>{client.name}</span>
              <span className={styles.rowMeta}>
                {client.city} · {client.equipment.map((e) => e.serial).join(', ')}
              </span>
            </Pressable>
          ))}
        </div>
        <div className={`${appStyles.pane} ${styles.detail}`}>
          {shown ? (
            <ClientRecord client={shown} />
          ) : (
            <EmptyState icon="clients" title={t('apps.clients.empty')} />
          )}
        </div>
      </div>
    </div>
  );
}
