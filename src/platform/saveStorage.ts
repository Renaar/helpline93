import { parseSave, type SaveGame } from '../engine/save.ts';

/** Where the game is saved (GDD 8.6). Web: localStorage; Steam later: local files. */
export interface SaveStorage {
  load: () => SaveGame | null;
  save: (game: SaveGame) => void;
}

const KEY = 'helpline93.save';

/** Browser storage. Private windows or blocked storage simply mean "no save". */
export const localSaveStorage: SaveStorage = {
  load: () => {
    try {
      return parseSave(window.localStorage.getItem(KEY));
    } catch {
      return null;
    }
  },
  save: (game) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(game));
    } catch {
      // Nothing to do: the night can still be replayed from the start.
    }
  },
};
