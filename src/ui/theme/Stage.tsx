import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { STAGE_HEIGHT, STAGE_WIDTH } from './layout.ts';
import styles from './Stage.module.css';
import { StageContext } from './stageScale.ts';

function fitScale(): number {
  return Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
}

/**
 * HelplineOS is drawn at 1920 × 1080 logical pixels, then scaled to fill the browser window,
 * with night-blue bands when the aspect ratio differs (GDD 8.4).
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(fitScale);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const geometry = useMemo(() => ({ scale, root }), [scale, root]);

  useEffect(() => {
    const onResize = () => {
      setScale(fitScale());
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.viewport}>
      <StageContext.Provider value={geometry}>
        <div
          ref={setRoot}
          className={styles.stage}
          style={{
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          {children}
        </div>
      </StageContext.Provider>
    </div>
  );
}
