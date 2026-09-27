import { describe, expect, it } from 'vitest';
import { feelConfig } from '../ui/feel/feel.config.ts';
import { soundDefinitions, soundIds, type SoundDefinition } from './soundDefinitions.ts';

describe('sound mix (GDD 6.5)', () => {
  it('keeps every repetitive sound below every one-off sound', () => {
    const volume = (id: (typeof soundIds)[number]) =>
      feelConfig.sound.volumes[id] * feelConfig.sound.categories[soundDefinitions[id].category];
    const definitions: Record<string, SoundDefinition> = soundDefinitions;
    const isRepetitive = (id: string) => definitions[id]?.repetitive === true;
    const repetitive = soundIds.filter(isRepetitive);
    const oneOff = soundIds.filter((id) => !isRepetitive(id));
    expect(repetitive.length).toBeGreaterThan(0);
    const loudestRepetitive = Math.max(...repetitive.map(volume));
    const quietestOneOff = Math.min(...oneOff.map(volume));
    expect(loudestRepetitive).toBeLessThan(quietestOneOff);
  });
});
