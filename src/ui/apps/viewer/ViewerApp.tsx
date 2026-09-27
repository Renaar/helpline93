import { useEffect, useRef, type CSSProperties } from 'react';
import { docs } from '../../../content/docs.ts';
import { audio } from '../../feel/audio.ts';
import { Button95 } from '../../feel/Button95.tsx';
import { IconButton } from '../../feel/IconButton.tsx';
import { useSettings } from '../../settings/settingsStore.ts';
import { formatNumber, t } from '../../strings/i18n.ts';
import styles from './Viewer.module.css';
import { DocPageView } from './DocPageView.tsx';
import { ViewerSidebar } from './ViewerSidebar.tsx';
import { usePageConsultation } from './usePageConsultation.ts';
import { useViewer, ZOOM_STEPS } from './viewerStore.ts';

const { pages, manual } = docs;

/** Document viewer (GDD 4.4): contents, bookmarks, search, continuous pages, zoom. */
export function ViewerApp() {
  const scroller = useRef<HTMLDivElement>(null);
  const pageElements = useRef(new Map<string, HTMLElement>());
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const { pageId, target, zoomIndex, bookmarks, query, goTo, setPage, zoomBy, toggleBookmark } =
    useViewer();
  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;
  usePageConsultation(pageId);
  const index = Math.max(
    0,
    pages.findIndex((p) => p.id === pageId),
  );

  // Scroll to the requested page (sidebar, previous / next, zoom change).
  useEffect(() => {
    const element = target ? pageElements.current.get(target.pageId) : undefined;
    if (!target || !element || !scroller.current) return;
    // Pages are positioned relative to the scroller; keep the top padding above the page.
    const padding = parseFloat(getComputedStyle(element.parentElement ?? element).paddingTop) || 0;
    scroller.current.scrollTo({
      top: element.offsetTop - padding,
      behavior: target.smooth && !reducedMotion ? 'smooth' : 'auto',
    });
  }, [target, reducedMotion]);

  // After a zoom change, keep the same page in view.
  useEffect(() => {
    useViewer.getState().goTo(useViewer.getState().pageId, false);
  }, [zoomIndex]);

  const onScroll = () => {
    const box = scroller.current;
    if (!box) return;
    const probe = box.scrollTop + box.clientHeight * 0.3;
    let current = pages[0]?.id ?? '';
    for (const page of pages) {
      const element = pageElements.current.get(page.id);
      if (element && element.offsetTop <= probe) current = page.id;
    }
    if (current !== useViewer.getState().pageId) setPage(current);
  };

  const turn = (step: number) => () => {
    const next = pages[index + step];
    if (!next) return;
    audio.play('page.turn');
    goTo(next.id);
  };

  return (
    <div className={styles.viewer}>
      <div className={styles.toolbar}>
        <IconButton
          glyph="prev"
          label={t('apps.viewer.previous')}
          disabled={index === 0}
          onPress={turn(-1)}
        />
        <span className={styles.pageLabel}>
          {t('apps.viewer.page', { current: index + 1, total: pages.length })}
        </span>
        <IconButton
          glyph="next"
          label={t('apps.viewer.next')}
          disabled={index === pages.length - 1}
          onPress={turn(1)}
        />
        <span className={styles.separator} />
        <IconButton
          glyph="minus"
          label={t('apps.viewer.zoomOut')}
          disabled={zoomIndex === 0}
          onPress={() => {
            zoomBy(-1);
          }}
        />
        <span className={styles.zoomLabel}>
          {t('apps.viewer.zoom', { percent: formatNumber(Math.round(zoom * 100)) })}
        </span>
        <IconButton
          glyph="plus"
          label={t('apps.viewer.zoomIn')}
          disabled={zoomIndex === ZOOM_STEPS.length - 1}
          onPress={() => {
            zoomBy(1);
          }}
        />
        <span className={styles.separator} />
        <Button95
          toggled={bookmarks.includes(pageId)}
          onPress={() => {
            toggleBookmark(pageId);
          }}
        >
          {t('apps.viewer.bookmark')}
        </Button95>
      </div>
      <div className={styles.body}>
        <ViewerSidebar />
        <div
          ref={scroller}
          className={styles.document}
          data-flight-target="viewer-page"
          style={{ '--doc-zoom': zoom } as CSSProperties}
          onScroll={onScroll}
        >
          <div className={styles.pages}>
            {pages.map((page) => (
              <DocPageView
                key={page.id}
                page={page}
                manual={manual}
                query={query}
                ref={(element) => {
                  if (element) pageElements.current.set(page.id, element);
                  else pageElements.current.delete(page.id);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
