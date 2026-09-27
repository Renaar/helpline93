import { AudioManager } from '../../audio/audioManager.ts';
import { soundUrls } from '../../audio/soundUrls.ts';
import { useSettings } from '../settings/settingsStore.ts';
import { feelConfig } from './feel.config.ts';

/** The single audio manager of the game, configured from feel.config.ts. */
export const audio = new AudioManager({ urls: soundUrls, config: feelConfig.sound });

audio.setMuted(useSettings.getState().muted);
useSettings.subscribe((state) => {
  audio.setMuted(state.muted);
});
