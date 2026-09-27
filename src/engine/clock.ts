/**
 * Game time source, in milliseconds.
 * Injected into the engine so that tests and the future solver can advance time instantly,
 * while the real game uses a wall-clock implementation from src/platform/.
 */
export interface Clock {
  now(): number;
}

/** Clock that only moves when told to. Used by tests, the solver and debug tools. */
export class ManualClock implements Clock {
  #time: number;

  constructor(start = 0) {
    this.#time = start;
  }

  now(): number {
    return this.#time;
  }

  advance(ms: number): void {
    if (ms < 0) throw new RangeError('ManualClock cannot go back in time');
    this.#time += ms;
  }
}
