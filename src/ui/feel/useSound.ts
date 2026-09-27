import { useCallback } from 'react';
import type { SoundId } from '../../audio/soundDefinitions.ts';
import { audio } from './audio.ts';

/** Returns a stable function that plays the sound, with its random pitch/volume variation. */
export function useSound(id: SoundId): () => void {
  return useCallback(() => {
    audio.play(id);
  }, [id]);
}
