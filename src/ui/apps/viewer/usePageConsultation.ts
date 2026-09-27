import { useEffect } from 'react';
import { useEngineState } from '../../engine/hooks.ts';
import { engine } from '../../engine/runtime.ts';
import { feelConfig } from '../../feel/feel.config.ts';
import { useWindows } from '../../os/windowStore.ts';

/**
 * A page counts as consulted when it stays in view in the open Viewer for a moment
 * (GDD 4.2.2). A new call re-reads the page on screen, so it counts for that call too.
 */
export function usePageConsultation(pageId: string): void {
  const visible = useWindows(
    (state) => state.windows.find((w) => w.app === 'viewer')?.phase === 'open',
  );
  const talkingCalls = useEngineState(
    (state) => Object.values(state.dialogues).filter((d) => d.status === 'talking').length,
  );
  useEffect(() => {
    if (!visible || pageId === '') return;
    const timer = setTimeout(() => {
      engine.dispatch({ type: 'CONSULT_PAGE', pageId });
    }, feelConfig.viewer.consultDwellMs);
    return () => {
      clearTimeout(timer);
    };
  }, [pageId, visible, talkingCalls]);
}
