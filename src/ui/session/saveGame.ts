import type { SaveGame } from '../../engine/save.ts';
import { localSaveStorage } from '../../platform/saveStorage.ts';

/** The save found at startup (null on a first game). Updated at the end of each night. */
let current: SaveGame | null = localSaveStorage.load();

export function loadedSave(): SaveGame | null {
  return current;
}

export function storeSave(game: SaveGame): void {
  current = game;
  localSaveStorage.save(game);
}
