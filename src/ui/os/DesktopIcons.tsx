import { t } from '../strings/i18n.ts';
import { APP_IDS, appInfo } from './apps.ts';
import styles from './Desktop.module.css';
import { DesktopIcon } from './DesktopIcon.tsx';

export function DesktopIcons() {
  return (
    <div className={styles.icons}>
      {APP_IDS.map((app) => (
        <DesktopIcon key={app} id={app} icon={appInfo[app].icon} label={t(appInfo[app].title)} />
      ))}
      <DesktopIcon id="trash" icon="trash" label={t('icons.trash')} />
    </div>
  );
}
