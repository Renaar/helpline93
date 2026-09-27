/**
 * Procedural PC hum (GDD 8.5): low mains hum + fan noise, synthesized live with Web Audio.
 * Very quiet: it should be felt more than heard.
 */
export class PcHum {
  readonly #ctx: AudioContext;
  readonly #output: GainNode;
  #sources: AudioScheduledSourceNode[] = [];

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.#ctx = ctx;
    this.#output = ctx.createGain();
    this.#output.gain.value = 0;
    this.#output.connect(destination);
  }

  get playing(): boolean {
    return this.#sources.length > 0;
  }

  start(volume: number, fadeInSeconds: number): void {
    if (this.playing) return;
    const ctx = this.#ctx;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 320;
    lowpass.connect(this.#output);

    for (const [frequency, gain] of [
      [58, 0.55],
      [116, 0.18],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.frequency.value = frequency;
      const level = ctx.createGain();
      level.gain.value = gain;
      osc.connect(level).connect(lowpass);
      osc.start();
      this.#sources.push(osc);
    }

    // Fan: two seconds of looped noise, softened.
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseLevel = ctx.createGain();
    noiseLevel.gain.value = 0.12;
    noise.connect(noiseLevel).connect(lowpass);
    noise.start();
    this.#sources.push(noise);

    const now = ctx.currentTime;
    this.#output.gain.cancelScheduledValues(now);
    this.#output.gain.setValueAtTime(0, now);
    this.#output.gain.linearRampToValueAtTime(volume, now + fadeInSeconds);
  }

  stop(fadeOutSeconds: number): void {
    if (!this.playing) return;
    const now = this.#ctx.currentTime;
    this.#output.gain.cancelScheduledValues(now);
    this.#output.gain.setValueAtTime(this.#output.gain.value, now);
    this.#output.gain.linearRampToValueAtTime(0, now + fadeOutSeconds);
    for (const source of this.#sources) source.stop(now + fadeOutSeconds);
    this.#sources = [];
  }
}
