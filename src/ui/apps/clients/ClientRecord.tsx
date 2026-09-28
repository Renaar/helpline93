import type { Client } from '../../../content/schemas.ts';
import { formatPhoneNumber } from '../../strings/format.ts';
import { t } from '../../strings/i18n.ts';
import styles from './Clients.module.css';

/** One record of the client database, laid out like a 1993 terminal form. */
export function ClientRecord({ client }: { client: Client }) {
  const fields: [string, string | undefined][] = [
    [t('apps.clients.fields.id'), client.id.slice(3)],
    [t('apps.clients.fields.company'), client.company],
    [t('apps.clients.fields.city'), client.city],
    [t('apps.clients.fields.address'), client.address],
    [t('apps.clients.fields.phone'), client.phone && formatPhoneNumber(client.phone)],
    [t('apps.clients.fields.since'), client.since],
  ];
  return (
    <article className={styles.record}>
      <h2 className={styles.name}>{client.name}</h2>
      <dl className={styles.fields}>
        {fields.map(([label, value]) =>
          value === undefined ? null : (
            <div key={label} className={styles.field}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ),
        )}
      </dl>
      <h3 className={styles.section}>{t('apps.clients.fields.equipment')}</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('apps.clients.fields.serial')}</th>
            <th>{t('apps.clients.fields.model')}</th>
            <th>{t('apps.clients.fields.purchased')}</th>
            <th>{t('apps.clients.fields.warranty')}</th>
          </tr>
        </thead>
        <tbody>
          {client.equipment.map((item) => (
            <tr key={item.serial}>
              <td className={styles.mono}>{item.serial}</td>
              <td>{item.model}</td>
              <td>{item.purchased ?? '—'}</td>
              <td>{item.warranty ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className={styles.section}>{t('apps.clients.fields.history')}</h3>
      {client.history.length === 0 ? (
        <p className={styles.dim}>{t('apps.clients.historyEmpty')}</p>
      ) : (
        <ul className={styles.history}>
          {client.history.map((entry, index) => (
            <li key={index}>
              <span className={styles.mono}>{entry.date}</span> {entry.text}
            </li>
          ))}
        </ul>
      )}
      {client.notes !== undefined && (
        <>
          <h3 className={styles.section}>{t('apps.clients.fields.notes')}</h3>
          <p className={styles.notes}>{client.notes}</p>
        </>
      )}
    </article>
  );
}
