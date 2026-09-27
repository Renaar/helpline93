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
    /** Soft and muffled, never aggressive (GDD 5.1). Hover < release < press. */
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
      'key.press': 0.12,
      'phone.ring': 0.22,
      'phone.pickup': 0.3,
      'phone.hangup': 0.3,
      'phone.hold': 0.2,
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
    /** Indicator lamp used in the sandbox engine demo. */
    onMs: 90,
    offMs: 600,
    holdMs: 900,
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
    '--feel-boot-fade': `${config.boot.loginFadeMs}ms`,
  };
}

/** Converts milliseconds to the seconds Motion expects. */
export function ms(value: number): number {
  return value / 1000;
}
