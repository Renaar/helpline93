/** A timestamped event, as emitted by the engine and staged by the UI. */
export interface BusEvent<M, K extends keyof M = keyof M> {
  type: K;
  /** Game time (ms) at which the event happened. */
  at: number;
  payload: M[K];
}

export type AnyBusEvent<M> = { [K in keyof M]: BusEvent<M, K> }[keyof M];

type Handler<M, K extends keyof M> = (event: BusEvent<M, K>) => void;
type AnyHandler<M> = (event: AnyBusEvent<M>) => void;

/** Minimal typed publish/subscribe channel. Handlers run synchronously, in subscription order. */
export class EventBus<M> {
  readonly #handlers = new Map<keyof M, Set<Handler<M, keyof M>>>();
  readonly #anyHandlers = new Set<AnyHandler<M>>();

  on<K extends keyof M>(type: K, handler: Handler<M, K>): () => void {
    let set = this.#handlers.get(type);
    if (!set) {
      set = new Set();
      this.#handlers.set(type, set);
    }
    const stored = handler as unknown as Handler<M, keyof M>;
    set.add(stored);
    return () => set.delete(stored);
  }

  onAny(handler: AnyHandler<M>): () => void {
    this.#anyHandlers.add(handler);
    return () => this.#anyHandlers.delete(handler);
  }

  emit(event: AnyBusEvent<M>): void {
    const set = this.#handlers.get(event.type);
    if (set) for (const handler of [...set]) handler(event);
    for (const handler of [...this.#anyHandlers]) handler(event);
  }
}
