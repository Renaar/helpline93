import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { feelConfig } from '../feel/feel.config.ts';
import { appInfo } from './apps.ts';
import { focusedApp, useWindows } from './windowStore.ts';

const MAX_LATENCY = feelConfig.window.openLatencyMs.max;

function state() {
  return useWindows.getState();
}

function openNow(...apps: Parameters<ReturnType<typeof state>['open']>[0][]) {
  for (const app of apps) {
    state().open(app);
    vi.advanceTimersByTime(MAX_LATENCY);
  }
}

describe('window store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useWindows.setState({ windows: [], taskOrder: [], loading: [], taskbarRects: {} });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a loading period before the window opens at its default place', () => {
    state().open('phone');
    expect(state().loading).toEqual(['phone']);
    expect(state().windows).toEqual([]);
    vi.advanceTimersByTime(MAX_LATENCY);
    expect(state().loading).toEqual([]);
    expect(state().windows[0]).toMatchObject({ app: 'phone', phase: 'open' });
    expect(state().windows[0]?.rect).toEqual(appInfo.phone.defaultRect);
  });

  it('ignores a second open while loading', () => {
    state().open('chat');
    state().open('chat');
    vi.advanceTimersByTime(MAX_LATENCY);
    expect(state().windows).toHaveLength(1);
  });

  it('stacks windows and focuses the topmost open one', () => {
    openNow('phone', 'chat');
    expect(focusedApp(state().windows)).toBe('chat');
    state().focus('phone');
    expect(state().windows.map((w) => w.app)).toEqual(['chat', 'phone']);
    expect(focusedApp(state().windows)).toBe('phone');
  });

  it('minimizes (focus moves to the next window) and restores on top', () => {
    openNow('phone', 'chat');
    state().minimize('chat');
    expect(focusedApp(state().windows)).toBe('phone');
    state().open('chat');
    expect(state().windows.at(-1)).toMatchObject({ app: 'chat', phase: 'open' });
  });

  it('closes in two steps: animation, then removal', () => {
    openNow('mail');
    state().close('mail');
    expect(state().windows[0]?.phase).toBe('closing');
    expect(state().taskOrder).toEqual([]);
    state().closed('mail');
    expect(state().windows).toEqual([]);
  });

  it('keeps the taskbar in opening order, whatever the stacking', () => {
    openNow('viewer', 'notebook');
    state().focus('viewer');
    expect(state().taskOrder).toEqual(['viewer', 'notebook']);
  });

  it('arranges open windows and opens the missing ones', () => {
    openNow('viewer');
    const viewerRect = { x: 10, y: 10, width: 500, height: 400 };
    const chatRect = { x: 600, y: 10, width: 500, height: 400 };
    state().arrange({ viewer: viewerRect, chat: chatRect, mail: chatRect }, ['chat']);
    expect(state().windows[0]?.rect).toEqual(viewerRect);
    vi.advanceTimersByTime(MAX_LATENCY);
    expect(state().windows.find((w) => w.app === 'chat')?.rect).toEqual(chatRect);
    expect(state().windows.find((w) => w.app === 'mail')).toBeUndefined();
  });
});
