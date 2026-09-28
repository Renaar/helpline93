import type { IconName } from '../icons/iconArt.ts';
import type { UiStringKey } from '../strings/i18n.ts';
import type { Rect } from '../theme/layout.ts';

/** HelplineOS applications of the MVP (GDD 5.3). One window per application. */
export const APP_IDS = [
  'phone',
  'chat',
  'viewer',
  'helpdesk',
  'notebook',
  'mail',
  'clients',
] as const;
export type AppId = (typeof APP_IDS)[number];

export interface AppInfo {
  icon: IconName;
  title: UiStringKey;
  /** Where the window opens the first time (logical stage pixels). */
  defaultRect: Rect;
}

export const appInfo: Record<AppId, AppInfo> = {
  phone: {
    icon: 'phone',
    title: 'apps.phone.title',
    defaultRect: { x: 1110, y: 56, width: 780, height: 600 },
  },
  chat: {
    icon: 'chat',
    title: 'apps.chat.title',
    defaultRect: { x: 190, y: 56, width: 760, height: 640 },
  },
  viewer: {
    icon: 'viewer',
    title: 'apps.viewer.title',
    defaultRect: { x: 520, y: 40, width: 1080, height: 900 },
  },
  helpdesk: {
    icon: 'helpdesk',
    title: 'apps.helpdesk.title',
    defaultRect: { x: 190, y: 620, width: 760, height: 380 },
  },
  notebook: {
    icon: 'notebook',
    title: 'apps.notebook.title',
    defaultRect: { x: 420, y: 120, width: 700, height: 640 },
  },
  mail: {
    icon: 'mail',
    title: 'apps.mail.title',
    defaultRect: { x: 330, y: 90, width: 940, height: 640 },
  },
  clients: {
    icon: 'clients',
    title: 'apps.clients.title',
    defaultRect: { x: 280, y: 140, width: 1000, height: 640 },
  },
};

/**
 * Default arrangement when a call is answered (GDD 5.4): chat on the left, viewer on the
 * right, ticket reduced at the bottom. The phone keeps a compact place bottom right.
 */
export const callLayout: Partial<Record<AppId, Rect>> = {
  chat: { x: 24, y: 24, width: 900, height: 600 },
  helpdesk: { x: 24, y: 648, width: 900, height: 372 },
  viewer: { x: 948, y: 24, width: 948, height: 600 },
  phone: { x: 948, y: 648, width: 948, height: 372 },
};

/** Applications opened automatically when a call is answered. */
export const callApps: AppId[] = ['phone', 'chat', 'helpdesk', 'viewer'];
