import type { Ref } from 'react';
import { pageNumber, type DocPage, type Manual } from '../../../content/schemas.ts';
import { t } from '../../strings/i18n.ts';
import styles from './DocPage.module.css';
import { parseBlocks } from './markdownLight.ts';
import { RichText } from './RichText.tsx';
import { MIN_QUERY_LENGTH } from './search.ts';

export interface DocPageViewProps {
  page: DocPage;
  manual: Manual;
  query: string;
  ref?: Ref<HTMLElement>;
}

/** A manual page, laid out like a scanned printed document (GDD 4.4). */
export function DocPageView({ page, manual, query, ref }: DocPageViewProps) {
  const highlight = query.trim().length >= MIN_QUERY_LENGTH ? query : '';
  return (
    <article ref={ref} className={styles.page}>
      <header className={styles.header}>
        <span>{manual.publisher}</span>
        <span>{manual.title}</span>
      </header>
      <p className={styles.service}>{manual.service}</p>
      <span className={styles.stamp}>
        {t('apps.viewer.revision', { night: page.revision.night })}
      </span>
      <p className={styles.chapter}>{page.tab}</p>
      <h1 className={styles.title}>
        <RichText text={page.title} query={highlight} />
      </h1>
      {parseBlocks(page.body).map((block, index) => {
        switch (block.type) {
          case 'heading':
            return block.level === 2 ? (
              <h2 key={index} className={styles.h2}>
                <RichText text={block.text} query={highlight} />
              </h2>
            ) : (
              <h3 key={index} className={styles.h3}>
                <RichText text={block.text} query={highlight} />
              </h3>
            );
          case 'paragraph':
            return (
              <p key={index} className={styles.paragraph}>
                <RichText text={block.text} query={highlight} />
              </p>
            );
          case 'list':
            return (
              <ul key={index} className={styles.list}>
                {block.items.map((item, i) => (
                  <li key={i}>
                    <RichText text={item} query={highlight} />
                  </li>
                ))}
              </ul>
            );
          case 'table':
            return (
              <table key={index} className={styles.table}>
                <thead>
                  <tr>
                    {block.header.map((cell, i) => (
                      <th key={i}>
                        <RichText text={cell} query={highlight} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, i) => (
                        <td key={i}>
                          <RichText text={cell} query={highlight} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case 'note':
            return (
              <p key={index} className={styles.note}>
                <RichText text={block.text} query={highlight} />
              </p>
            );
        }
      })}
      <footer className={styles.footer}>
        {t('apps.viewer.pageNumber', { number: pageNumber(page) })}
      </footer>
    </article>
  );
}
