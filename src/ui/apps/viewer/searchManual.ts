import { useWindows } from '../../os/windowStore.ts';
import { useViewer } from './viewerStore.ts';

/** Opens the Viewer on its search tab with a keyword (captured info, Notebook clue). */
export function searchManual(keyword: string): void {
  const viewer = useViewer.getState();
  viewer.setTab('search');
  viewer.setQuery(keyword);
  useWindows.getState().open('viewer');
}
