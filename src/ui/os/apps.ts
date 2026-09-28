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
    defaultRect: { x: 944, y: 48, width: 663, height: 510 },
  },
  chat: {
    icon: 'chat',
    title: 'apps.chat.title',
    defaultRect: { x: 162, y: 48, width: 646, height: 544 },
  },
  viewer: {
    icon: 'viewer',
    title: 'apps.viewer.title',
    defaultRect: { x: 442, y: 34, width: 918, height: 765 },
  },
  helpdesk: {
    icon: 'helpdesk',
    title: 'apps.helpdesk.title',
    defaultRect: { x: 162, y: 527, width: 646, height: 323 },
  },
  notebook: {
    icon: 'notebook',
    title: 'apps.notebook.title',
    defaultRect: { x: 357, y: 102, width: 595, height: 544 },
  },
  mail: {
    icon: 'mail',
    title: 'apps.mail.title',
    defaultRect: { x: 280, y: 76, width: 799, height: 544 },
  },
  clients: {
    icon: 'clients',
    title: 'apps.clients.title',
    defaultRect: { x: 238, y: 119, width: 850, height: 544 },
  },
};

/**
 * Arrangement when a call is answered (GDD 5.4, revised after J2): chat on the left, manual in
 * the middle, Notebook on the right (captures land there). The call itself sits in the taskbar
 * widget; the ticket waits for the end of the call. Desktop area: 1920 × 1036.
 */
export const callLayout: Partial<Record<AppId, Rect>> = {
  chat: { x: 16, y: 16, width: 700, height: 1004 },
  viewer: { x: 728, y: 16, width: 780, height: 1004 },
  notebook: { x: 1520, y: 16, width: 384, height: 1004 },
};

/** Applications opened automatically when a call is answered. */
export const callApps: AppId[] = ['chat', 'viewer', 'notebook'];

/** The ticket opens as a recap once the call is over, to pick the resolution code. */
export const recapLayout: Partial<Record<AppId, Rect>> = {
  helpdesk: { x: 728, y: 96, width: 780, height: 760 },
};
