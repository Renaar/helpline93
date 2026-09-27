import { Howl, Howler } from 'howler';
import type { SoundCategory, SoundId } from './soundDefinitions.ts';
import { PcHum } from './pcHum.ts';
import { soundDefinitions } from './soundDefinitions.ts';
import { pickVariant, varyPlayback } from './variation.ts';

export interface AudioConfig {
  master: number;
  pitchVariation: number;
  volumeVariation: number;
  categories: Readonly<Record<SoundCategory, number>>;
  volumes: Readonly<Record<SoundId, number>>;
  minGapMs: number;
  /** Procedural PC hum level (before the ambience category volume). */
  humVolume: number;
  humFadeInMs: number;
  humFadeOutMs: number;
}

export interface AudioManagerOptions {
  urls: Readonly<Record<SoundId, readonly string[]>>;
  config: AudioConfig;
  random?: () => number;
  now?: () => number;
}

/**
 * Plays short samples through Howler (Web Audio), each with a slight random
 * pitch/volume change and a random variant (GDD 8.5).
 */
export class AudioManager {
  readonly #urls: Readonly<Record<SoundId, readonly string[]>>;
  readonly #config: AudioConfig;
  readonly #random: () => number;
  readonly #now: () => number;
  readonly #howls = new Map<string, Howl>();
  readonly #lastVariant = new Map<SoundId, number>();
  readonly #lastPlayedAt = new Map<SoundId, number>();
  readonly #categoryVolumes: Record<SoundCategory, number>;
  #muted = false;
  #started = false;
  #humWanted = false;
  #hum: PcHum | null = null;

  constructor({
    urls,
    config,
    random = Math.random,
    now = () => performance.now(),
  }: AudioManagerOptions) {
    this.#urls = urls;
    this.#config = config;
    this.#random = random;
    this.#now = now;
    this.#categoryVolumes = { ...config.categories };
  }

  /**
   * Browsers refuse to start audio before a user gesture (GDD 8.5), so nothing touches the
   * audio context until the first pointer or key press. Samples are loaded at that moment.
   */
  startOnFirstGesture(target: EventTarget = window): void {
    const start = () => {
      target.removeEventListener('pointerdown', start, true);
      target.removeEventListener('keydown', start, true);
      this.#start();
    };
    target.addEventListener('pointerdown', start, true);
    target.addEventListener('keydown', start, true);
  }

  play(id: SoundId): void {
    if (!this.#started) return;
    const now = this.#now();
    const last = this.#lastPlayedAt.get(id);
    if (last !== undefined && now - last < this.#config.minGapMs) return;

    const urls = this.#urls[id];
    const index = pickVariant(urls.length, this.#random, this.#lastVariant.get(id));
    const url = urls[index];
    if (url === undefined) return;

    const category = soundDefinitions[id].category;
    const base = this.#config.volumes[id] * this.#categoryVolumes[category];
    const { rate, volume } = varyPlayback(
      base,
      this.#config.pitchVariation,
      this.#config.volumeVariation,
      this.#random,
    );
    const howl = this.#howl(url);
    const playId = howl.play();
    howl.rate(rate, playId);
    howl.volume(volume, playId);
    this.#lastVariant.set(id, index);
    this.#lastPlayedAt.set(id, now);
  }

  setMuted(muted: boolean): void {
    this.#muted = muted;
    if (this.#started) Howler.mute(muted);
  }

  setCategoryVolume(category: SoundCategory, volume: number): void {
    this.#categoryVolumes[category] = Math.min(1, Math.max(0, volume));
  }

  #start(): void {
    if (this.#started) return;
    this.#started = true;
    Howler.volume(this.#config.master);
    Howler.mute(this.#muted);
    for (const urls of Object.values(this.#urls)) for (const url of urls) this.#howl(url);
    if (this.#humWanted) this.startHum();
  }

  /** Starts the PC hum (now, or as soon as audio is allowed to start). */
  startHum(): void {
    this.#humWanted = true;
    if (!this.#started) return;
    this.#hum ??= new PcHum(Howler.ctx, Howler.masterGain);
    const volume = this.#config.humVolume * this.#categoryVolumes.ambience;
    this.#hum.start(volume, this.#config.humFadeInMs / 1000);
  }

  stopHum(): void {
    this.#humWanted = false;
    this.#hum?.stop(this.#config.humFadeOutMs / 1000);
  }

  #howl(url: string): Howl {
    let howl = this.#howls.get(url);
    if (!howl) {
      howl = new Howl({ src: [url], preload: true });
      this.#howls.set(url, howl);
    }
    return howl;
  }
}
