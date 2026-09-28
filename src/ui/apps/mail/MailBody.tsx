import { parseBlocks } from '../viewer/markdownLight.ts';
import { RichText } from '../viewer/RichText.tsx';
import styles from './Mail.module.css';

/** An e-mail body, in the same light markdown as the manual. */
export function MailBody({ body }: { body: string }) {
  return (
    <div className={styles.body}>
      {parseBlocks(body).map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <p key={index} className={styles.bodyHeading}>
                <RichText text={block.text} query="" />
              </p>
            );
          case 'list':
            return (
              <ul key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>
                    <RichText text={item} query="" />
                  </li>
                ))}
              </ul>
            );
          case 'table':
            return (
              <p key={index}>
                {[block.header, ...block.rows].map((r) => r.join(' · ')).join(' / ')}
              </p>
            );
          case 'paragraph':
          case 'note':
            return (
              <p key={index} className={block.type === 'note' ? styles.bodyNote : undefined}>
                <RichText text={block.text} query="" />
              </p>
            );
        }
      })}
    </div>
  );
}
