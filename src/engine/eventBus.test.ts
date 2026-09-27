import { describe, expect, it } from 'vitest';
import { EventBus } from './eventBus.ts';

interface TestMap {
  ring: { line: number };
  hangup: { reason: string };
}

describe('EventBus', () => {
  it('delivers events to handlers of that type only', () => {
    const bus = new EventBus<TestMap>();
    const lines: number[] = [];
    bus.on('ring', (e) => lines.push(e.payload.line));
    bus.emit({ type: 'ring', at: 0, payload: { line: 2 } });
    bus.emit({ type: 'hangup', at: 1, payload: { reason: 'x' } });
    expect(lines).toEqual([2]);
  });

  it('delivers every event to onAny handlers, in order', () => {
    const bus = new EventBus<TestMap>();
    const types: string[] = [];
    bus.onAny((e) => types.push(e.type));
    bus.emit({ type: 'ring', at: 0, payload: { line: 1 } });
    bus.emit({ type: 'hangup', at: 1, payload: { reason: 'x' } });
    expect(types).toEqual(['ring', 'hangup']);
  });

  it('stops delivering after unsubscribe', () => {
    const bus = new EventBus<TestMap>();
    let count = 0;
    const off = bus.on('ring', () => count++);
    bus.emit({ type: 'ring', at: 0, payload: { line: 1 } });
    off();
    bus.emit({ type: 'ring', at: 0, payload: { line: 1 } });
    expect(count).toBe(1);
  });
});
