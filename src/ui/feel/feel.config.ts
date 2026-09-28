import type { SoundCategory, SoundId } from '../../audio/soundDefinitions.ts';

/**
 * Every duration, curve and volume of the game feel, in one place (GDD 8.3).
 * Durations are in milliseconds. Tweak here, then check the result in ?sandbox.
 */
export const feelConfig = {
  sound: {
    master: 0.8,
    /** ±1.5 % pitch on every play: just enough to avoid the machine-gun effect (GDD 8.5). */
    pitchVariation: 0.015,
    /** ±4 % volume on every play (GDD 8.5). */
    volumeVariation: 0.04,
    categories: { ui: 1, phone: 1, ambience: 0.6, music: 0.5 } satisfies Record<
      SoundCategory,
      number
    >,
    /**
     * Soft and muffled, never aggressive (GDD 5.1). Repetitive sounds (hover, keyboard, pages)
     * stay well below every one-off sound (GDD 6.5, checked by a test).
     */
    volumes: {
      'ui.hover': 0.035,
      /** Same file and level as the J0 hover sound, which Loïc validated. */
      'ui.press': 0.1,
      'ui.release': 0.06,
      'ui.deny': 0.3,
      'ui.confirm': 0.22,
      'os.power': 0.35,
      'os.spinup': 0.18,
      'os.hdd': 0.16,
      'bios.beep': 0.12,
      'window.open': 0.12,
      'window.close': 0.1,
      'window.minimize': 0.1,
      'window.restore': 0.1,
      'menu.open': 0.08,
      'drag.pick': 0.08,
      'drag.drop': 0.1,
      'page.turn': 0.04,
      'viewer.jump': 0.035,
      'key.press': 0.025,
      'clock.skip': 0.2,
      'phone.ring': 0.22,
      'phone.pickup': 0.3,
      'phone.hangup': 0.3,
      'phone.hold': 0.2,
      'chat.receive': 0.12,
      'chat.send': 0.09,
      'capture.mark': 0.16,
      'option.unlock': 0.12,
      'ticket.stamp': 0.26,
      'pen.write': 0.1,
    } satisfies Record<SoundId, number>,
    /** Minimum gap between two plays of the same sound, to avoid stacking on fast hovers. */
    minGapMs: 30,
    /** Procedural PC hum, started at power-on (GDD 8.5). Barely audible. */
    humVolume: 0.05,
    humFadeInMs: 1500,
    humFadeOutMs: 400,
  },

  hover: {
    /** Fade of the hover highlight. */
    fadeInMs: 70,
    fadeOutMs: 160,
    playSound: true as boolean,
  },

  press: {
    /** Pressable with the "sink" effect shrinks to this scale while held. */
    sinkScale: 0.94,
    sinkSpring: { stiffness: 1400, damping: 40, mass: 0.6 },
    /** Springier on release so the element "pops" back. */
    releaseSpring: { stiffness: 700, damping: 14, mass: 0.6 },
  },

  deny: {
    /** Horizontal shake offsets, in logical pixels. */
    shakeOffsets: [0, -6, 6, -4, 4, -2, 0],
    durationMs: 300,
    /** Shake amplitude multiplier when "reduced animations" is on (sound is kept). */
    reducedAmplitude: 0.35,
  },

  lamp: {
    /** Indicator lamps (phone lines, notification area). */
    onMs: 90,
    offMs: 600,
    /** Sandbox engine demo: how long the lamp stays lit. */
    holdMs: 900,
    /** Full blink cycles: ringing, urgent, and the slow pulse of a line on hold. */
    blinkSlowMs: 1000,
    blinkFastMs: 360,
    pulseMs: 2200,
  },

  window: {
    /** Staged period latency (GDD 5.1): hourglass + disk scratch before a window appears. */
    openLatencyMs: { min: 260, max: 650 },
    /** Window unfolding from its icon / folding into the taskbar. */
    openSpring: { stiffness: 380, damping: 32, mass: 0.9 },
    minimizeSpring: { stiffness: 520, damping: 42, mass: 0.8 },
    /** Automatic re-arrangement (incoming call layout). */
    moveSpring: { stiffness: 300, damping: 34, mass: 1 },
    closeMs: 130,
  },

  drag: {
    /** Light inertia when a dragged window is released (GDD 5.1 "poids et matière"). */
    inertiaPower: 0.12,
    inertiaTimeConstantMs: 90,
  },

  desktop: {
    /** Two presses closer than this open a desktop icon. */
    doubleClickMs: 420,
  },

  menu: {
    spring: { stiffness: 700, damping: 40, mass: 0.7 },
  },

  typing: {
    /** TypedText rhythm: base speed and random irregularity (0 = metronome). */
    charsPerSecond: 70,
    jitter: 0.6,
    caretBlinkMs: 530,
  },

  boot: {
    /** Pause between two BIOS lines (random in range). */
    lineDelayMs: { min: 90, max: 320 },
    memoryCountMs: 1300,
    /** Pause on the last BIOS line before the login screen. */
    endHoldMs: 700,
    loginFadeMs: 400,
    desktopFadeMs: 600,
    shutdownFadeMs: 500,
  },

  phone: {
    /** A ring every… while a line is ringing. */
    ringIntervalMs: 3400,
    toastSpring: { stiffness: 420, damping: 30, mass: 0.9 },
    /** The taskbar call widget appears / leaves with this spring; its timer ticks every second. */
    widgetSpring: { stiffness: 520, damping: 34, mass: 0.8 },
    widgetTickMs: 1000,
  },

  clock: {
    /** Staged jump to the next event: the clock runs fast for this long (sound: 2.5 s). */
    skipDurationMs: 2500,
    /**
     * Automatic jump after this much inactivity (no pointer, key or wheel), and only when no call
     * is going on: never while the player reads, types or searches.
     */
    autoSkipIdleMs: 60_000,
    idleCheckMs: 1000,
  },

  /**
   * VHS fast-forward effect during a time jump (GDD 6.1: the only CRT-like exception, brief and
   * never permanent). It lasts exactly clock.skipDurationMs.
   */
  vhs: {
    /** Horizontal bands: time for one band to cross the screen, and its start delay. */
    bands: [
      { kind: 'thin', passMs: 520, delayMs: 0 },
      { kind: 'wide', passMs: 900, delayMs: 180 },
      { kind: 'dark', passMs: 700, delayMs: 60 },
      { kind: 'thin', passMs: 380, delayMs: 300 },
      { kind: 'dark', passMs: 1100, delayMs: 450 },
      { kind: 'wide', passMs: 640, delayMs: 820 },
    ],
    /** Horizontal shake of the whole screen (logical px) and slight skew (degrees). */
    jitterPx: [0, -5, 3, -6, 2, -4, 5, -2, 4, -3, 3, -5, 2, 0],
    skewDeg: [0, 0.4, -0.3, 0.5, -0.2, 0.3, -0.4, 0.2, -0.3, 0.4, -0.2, 0.3, -0.1, 0],
    /** Brightness flicker (opacity of a light veil). */
    flicker: [0, 0.08, 0.03, 0.1, 0.04, 0.09, 0.02, 0.08, 0.03, 0.09, 0],
    /** "Reduced animations": a single discreet fade instead of the effect. */
    reducedFadeOpacity: 0.16,
  },

  chat: {
    /** A new transcript line slides in. */
    entrySpring: { stiffness: 520, damping: 38, mass: 0.8 },
    entryOffsetPx: 10,
    /** One cycle of the three typing dots. */
    typingDotsMs: 1100,
    /** New options glow in the reply zone for this long. */
    freshGlowMs: 2400,
  },

  capture: {
    /** Felt-marker sweep over a captured piece of text (GDD 4.2.3). */
    markMs: 280,
  },

  /** Things flying across the desktop: options Viewer → chat, captures chat → ticket / Notebook. */
  flight: {
    durationMs: 720,
    /** Between two options unlocked by the same page. */
    staggerMs: 130,
    /** Height of the arc above the straight line, in logical pixels. */
    arcPx: 90,
    landScale: 0.55,
    /** "Reduced animations": a quick fade in place instead. */
    reducedMs: 200,
  },

  viewer: {
    /** A page counts as consulted once it stays in view this long (GDD 4.2.2). */
    consultDwellMs: 1200,
  },

  ticket: {
    /** A field that just received a capture glows for this long. */
    flashMs: 1400,
    /** "Closed" stamp landing on the ticket. */
    stampSpring: { stiffness: 900, damping: 26, mass: 0.9 },
    stampFromScale: 1.8,
    stampAngleDeg: -8,
  },

  debug: {
    /** Delay of the engine round-trip demo in the sandbox. */
    pingDelayMs: 1500,
  },
} as const;

export type FeelConfig = typeof feelConfig;

/** Durations as CSS variables, so stylesheets never hard-code them either. */
export function feelCssVariables(config: FeelConfig = feelConfig): Record<string, string> {
  return {
    '--feel-hover-in': `${config.hover.fadeInMs}ms`,
    '--feel-hover-out': `${config.hover.fadeOutMs}ms`,
    '--feel-lamp-on': `${config.lamp.onMs}ms`,
    '--feel-lamp-off': `${config.lamp.offMs}ms`,
    '--feel-caret-blink': `${config.typing.caretBlinkMs}ms`,
    '--feel-blink-slow': `${config.lamp.blinkSlowMs}ms`,
    '--feel-blink-fast': `${config.lamp.blinkFastMs}ms`,
    '--feel-pulse': `${config.lamp.pulseMs}ms`,
    '--feel-boot-fade': `${config.boot.loginFadeMs}ms`,
    '--feel-capture-mark': `${config.capture.markMs}ms`,
    '--feel-typing-dots': `${config.chat.typingDotsMs}ms`,
    '--feel-fresh-glow': `${config.chat.freshGlowMs}ms`,
    '--feel-ticket-flash': `${config.ticket.flashMs}ms`,
  };
}

/** Converts milliseconds to the seconds Motion expects. */
export function ms(value: number): number {
  return value / 1000;
}
