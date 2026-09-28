import { Pressable } from '../feel/Pressable.tsx';
import styles from './TabBar.module.css';

export interface TabBarProps<T extends string> {
  /** `badge`: something new in this tab (a small copper dot). */
  tabs: readonly { id: T; label: string; badge?: boolean }[];
  selected: T;
  onSelect: (id: T) => void;
}

/** Row of tabs; the selected one joins the panel below (classic property-sheet look). */
export function TabBar<T extends string>({ tabs, selected, onSelect }: TabBarProps<T>) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          className={styles.tab}
          pressEffect="none"
          toggled={tab.id === selected}
          onPress={() => {
            onSelect(tab.id);
          }}
        >
          {tab.label}
          {tab.badge === true && <span className={styles.badge} aria-hidden="true" />}
        </Pressable>
      ))}
    </div>
  );
}
