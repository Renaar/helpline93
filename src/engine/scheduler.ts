interface Entry<T> {
  at: number;
  order: number;
  item: T;
}

/**
 * Queue of items due at a given game time.
 * Items due at the same time come out in the order they were scheduled.
 */
export class Scheduler<T> {
  #entries: Entry<T>[] = [];
  #counter = 0;

  get size(): number {
    return this.#entries.length;
  }

  schedule(at: number, item: T): void {
    const entry: Entry<T> = { at, order: this.#counter++, item };
    const index = this.#entries.findIndex((e) => e.at > at);
    if (index === -1) this.#entries.push(entry);
    else this.#entries.splice(index, 0, entry);
  }

  /** Removes and returns every item due at or before `now`, with its due time. */
  popDue(now: number): { at: number; item: T }[] {
    const index = this.#entries.findIndex((e) => e.at > now);
    const due = index === -1 ? this.#entries : this.#entries.slice(0, index);
    this.#entries = index === -1 ? [] : this.#entries.slice(index);
    return due.map(({ at, item }) => ({ at, item }));
  }
}
