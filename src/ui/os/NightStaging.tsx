import { carryOver, nextNightId } from '../../engine/night/system.ts';
import { saveAfterNight } from '../../engine/save.ts';
import { useNotebook } from '../apps/notebook/notebookStore.ts';
import { useEngineEvent } from '../engine/hooks.ts';
import { engine } from '../engine/runtime.ts';
import { audio } from '../feel/audio.ts';
import { loadedSave, storeSave } from '../session/saveGame.ts';

/** Stages the night (no visuals of its own): new e-mail chime, automatic save at the end (GDD 4.8). */
export function NightStaging() {
  useEngineEvent('email.received', () => {
    audio.play('mail.receive');
  });
  useEngineEvent('night.ended', ({ payload }) => {
    const state = engine.getState();
    storeSave(
      saveAfterNight(loadedSave(), {
        operatorName: state.operatorName ?? '',
        nextNightId: nextNightId(engine.content, payload.nightId),
        carry: carryOver(state),
        notes: useNotebook.getState().notes,
      }),
    );
  });
  return null;
}
