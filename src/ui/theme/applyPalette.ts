import { useSettings } from '../settings/settingsStore.ts';

/** Keeps `<html data-palette="…">` in sync with the settings, so palettes.css applies it live. */
export function syncPaletteWithSettings(root: HTMLElement = document.documentElement): void {
  root.dataset.palette = useSettings.getState().palette;
  useSettings.subscribe((state) => {
    root.dataset.palette = state.palette;
  });
}
