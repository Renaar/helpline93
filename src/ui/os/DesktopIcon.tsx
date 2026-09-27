import { useRef } from 'react';
import { feelConfig } from '../feel/feel.config.ts';
import { Pressable } from '../feel/Pressable.tsx';
import { useFeedback } from '../feel/useFeedback.ts';
import type { IconName } from '../icons/iconArt.ts';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { toStageRect, useStageGeometry } from '../theme/stageScale.ts';
import type { AppId } from './apps.ts';
import styles from './Desktop.module.css';
import { useShell } from './shellStore.ts';
import { useWindows } from './windowStore.ts';

export interface DesktopIconProps {
  id: AppId | 'trash';
  icon: IconName;
  label: string;
}

/** Desktop shortcut: one press selects, a double press opens (from the icon's own box). */
export function DesktopIcon({ id, icon, label }: DesktopIconProps) {
  const slot = useRef<HTMLDivElement>(null);
  const lastPress = useRef(0);
  const geometry = useStageGeometry();
  const selected = useShell((state) => state.selectedIcon === id);
  const { scope, deny } = useFeedback<HTMLDivElement>();

  const onPress = () => {
    const now = performance.now();
    const isDouble = now - lastPress.current < feelConfig.desktop.doubleClickMs;
    lastPress.current = isDouble ? 0 : now;
    useShell.getState().selectIcon(id === 'trash' ? null : id);
    if (!isDouble) return;
    // The recycle bin has no application yet (Explorer arrives with J5).
    if (id === 'trash') {
      deny();
      return;
    }
    const from = slot.current ? toStageRect(slot.current, geometry) : null;
    useWindows.getState().open(id, from);
  };

  return (
    <div ref={slot} className={styles.iconSlot} data-desktop-icon>
      <div ref={scope}>
        <Pressable className={styles.icon} onPress={onPress} label={label}>
          <PixelIcon name={icon} size="lg" />
          <span className={styles.iconLabel} data-selected={selected || undefined}>
            {label}
          </span>
        </Pressable>
      </div>
    </div>
  );
}
