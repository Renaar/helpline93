import { useState } from 'react';
import { Button95 } from '../../ui/feel/Button95.tsx';
import { Window95, type WindowPhase } from '../../ui/feel/Window95.tsx';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function WindowDemo() {
  const [phase, setPhase] = useState<WindowPhase | 'closed'>('closed');
  const [rect, setRect] = useState({ x: 24, y: 16, width: 440, height: 240 });
  return (
    <Section title={t('sandbox.window.title')} hint={t('sandbox.window.hint')}>
      <div className={styles.row}>
        <Button95
          disabled={phase === 'open' || phase === 'closing'}
          onPress={() => {
            setPhase('open');
          }}
        >
          {t(phase === 'minimized' ? 'sandbox.window.restore' : 'sandbox.window.open')}
        </Button95>
      </div>
      <div className={styles.windowArea}>
        {phase !== 'closed' && (
          <Window95
            title={t('sandbox.window.windowTitle')}
            icon="document"
            rect={rect}
            active
            zIndex={1}
            phase={phase}
            minimizeLabel={t('os.minimize')}
            closeLabel={t('os.close')}
            onFocus={() => undefined}
            onMinimize={() => {
              setPhase('minimized');
            }}
            onClose={() => {
              setPhase('closing');
            }}
            onClosed={() => {
              setPhase('closed');
            }}
            onMove={(x, y) => {
              setRect((current) => ({ ...current, x, y }));
            }}
            onResize={setRect}
          >
            <p className={styles.windowBody}>{t('sandbox.window.body')}</p>
          </Window95>
        )}
      </div>
    </Section>
  );
}
