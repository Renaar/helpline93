import { useState } from 'react';
import { Pressable } from '../../ui/feel/Pressable.tsx';
import { iconArt, type IconName } from '../../ui/icons/iconArt.ts';
import { PixelIcon } from '../../ui/icons/PixelIcon.tsx';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

const iconNames = Object.keys(iconArt) as IconName[];

function IconTile({
  name,
  disabled,
  onPress,
}: {
  name: IconName;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable className={styles.tile} disabled={disabled ?? false} onPress={onPress}>
      <PixelIcon name={name} size="lg" />
      <span className={styles.tileLabel}>{t(`icons.${name}`)}</span>
    </Pressable>
  );
}

export function PressableDemo() {
  const [count, setCount] = useState(0);
  const increment = () => {
    setCount((value) => value + 1);
  };
  return (
    <Section title={t('sandbox.pressable.title')} hint={t('sandbox.pressable.hint')}>
      <p className={styles.counter}>{t('sandbox.pressable.pressed', { count })}</p>
      <div className={styles.tiles}>
        {iconNames.map((name) => (
          <IconTile key={name} name={name} onPress={increment} />
        ))}
        <IconTile name="folder" disabled onPress={increment} />
      </div>
    </Section>
  );
}
