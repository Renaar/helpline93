import { docs } from '../../../content/docs.ts';
import { pageNumber, type DocPage } from '../../../content/schemas.ts';
import { audio } from '../../feel/audio.ts';
import { Pressable } from '../../feel/Pressable.tsx';
import { TextField } from '../../feel/TextField.tsx';
import { TabBar } from '../../os/TabBar.tsx';
import { t } from '../../strings/i18n.ts';
import { Highlighted } from './RichText.tsx';
import { MIN_QUERY_LENGTH, searchPages } from './search.ts';
import styles from './Viewer.module.css';
import { useViewer, type ViewerTab } from './viewerStore.ts';

const { pages } = docs;

/** Pages grouped by chapter (the `tab` field of each page), in manual order. */
const chapters = pages.reduce<{ name: string; pages: DocPage[] }[]>((groups, page) => {
  const group = groups.find((g) => g.name === page.tab);
  if (group) group.pages.push(page);
  else groups.push({ name: page.tab, pages: [page] });
  return groups;
}, []);

function PageLink({ page, children }: { page: DocPage; children?: React.ReactNode }) {
  const current = useViewer((state) => state.pageId === page.id);
  return (
    <Pressable
      className={styles.link}
      pressEffect="none"
      toggled={current}
      onPress={() => {
        audio.play('viewer.jump');
        useViewer.getState().goTo(page.id);
      }}
    >
      <span className={styles.linkNumber}>
        {t('apps.viewer.pageNumber', { number: pageNumber(page) })}
      </span>
      <span className={styles.linkTitle}>{page.title}</span>
      {children}
    </Pressable>
  );
}

function SearchPanel() {
  const query = useViewer((state) => state.query);
  const results = searchPages(pages, query);
  const active = query.trim().length >= MIN_QUERY_LENGTH;
  return (
    <div className={styles.search}>
      <TextField
        autoFocus
        label={t('apps.viewer.searchLabel')}
        placeholder={t('apps.viewer.searchPlaceholder')}
        value={query}
        maxLength={40}
        onChange={useViewer.getState().setQuery}
      />
      <p className={styles.searchStatus}>
        {active ? t('apps.viewer.results', { count: results.length }) : t('apps.viewer.searchHint')}
      </p>
      {results.map(({ page, excerpt }) => (
        <PageLink key={page.id} page={page}>
          {excerpt !== '' && (
            <span className={styles.excerpt}>
              <Highlighted text={excerpt} query={query} />
            </span>
          )}
        </PageLink>
      ))}
    </div>
  );
}

export function ViewerSidebar() {
  const tab = useViewer((state) => state.tab);
  const bookmarks = useViewer((state) => state.bookmarks);
  const bookmarked = pages.filter((page) => bookmarks.includes(page.id));
  const tabs: { id: ViewerTab; label: string }[] = [
    { id: 'contents', label: t('apps.viewer.tabs.contents') },
    { id: 'bookmarks', label: t('apps.viewer.tabs.bookmarks') },
    { id: 'search', label: t('apps.viewer.tabs.search') },
  ];

  return (
    <aside className={styles.sidebar}>
      <TabBar tabs={tabs} selected={tab} onSelect={useViewer.getState().setTab} />
      <div className={styles.sidebarBody}>
        {tab === 'contents' &&
          chapters.map((chapter) => (
            <section key={chapter.name}>
              <h3 className={styles.chapter}>{chapter.name}</h3>
              {chapter.pages.map((page) => (
                <PageLink key={page.id} page={page} />
              ))}
            </section>
          ))}
        {tab === 'bookmarks' &&
          (bookmarked.length === 0 ? (
            <p className={styles.searchStatus}>{t('apps.viewer.bookmarksEmpty')}</p>
          ) : (
            bookmarked.map((page) => <PageLink key={page.id} page={page} />)
          ))}
        {tab === 'search' && <SearchPanel />}
      </div>
    </aside>
  );
}
