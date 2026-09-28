import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect } from 'react';
import { useSettings } from '../../settings/settingsStore.ts';
import { feelConfig, ms } from '../feel.config.ts';
import styles from './FlightLayer.module.css';
import { useFlights, type Flight } from './flightStore.ts';

const center = (r: Flight['to']) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

function FlightChip({ flight }: { flight: Flight }) {
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const start = center(flight.from);
  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const opacity = useMotionValue(0);
  const scale = useMotionValue(1);

  useEffect(() => {
    const { durationMs, arcPx, landScale, reducedMs } = feelConfig.flight;
    const from = center(flight.from);
    const end = center(flight.to);
    const delay = ms(flight.delayMs);
    const controls = reducedMotion
      ? [animate(opacity, [0, 1, 0], { duration: ms(reducedMs), delay })]
      : [
          // An arc: up from the start, then down onto the target, shrinking as it lands.
          animate(x, [from.x, (from.x + end.x) / 2, end.x], {
            duration: ms(durationMs),
            delay,
            ease: 'easeInOut',
          }),
          animate(y, [from.y, Math.min(from.y, end.y) - arcPx, end.y], {
            duration: ms(durationMs),
            delay,
            ease: 'easeInOut',
          }),
          animate(scale, [1, 1.04, landScale], { duration: ms(durationMs), delay }),
          animate(opacity, [0, 1, 1, 0], {
            duration: ms(durationMs),
            delay,
            times: [0, 0.12, 0.88, 1],
          }),
        ];
    let cancelled = false;
    void Promise.all(controls.map((c) => c.finished)).then(() => {
      if (!cancelled) useFlights.getState().land(flight.id);
    });
    return () => {
      cancelled = true;
      for (const c of controls) c.stop();
    };
  }, [flight, reducedMotion, x, y, opacity, scale]);

  return (
    <motion.div
      className={styles.chip}
      data-variant={flight.variant}
      style={{ x, y, opacity, scale }}
    >
      {flight.label}
    </motion.div>
  );
}

/** Draws every flight above the windows and the taskbar. */
export function FlightLayer() {
  const flights = useFlights((state) => state.flights);
  return (
    <div className={styles.layer} aria-hidden="true">
      {flights.map((flight) => (
        <FlightChip key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
